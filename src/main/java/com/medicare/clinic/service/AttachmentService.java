package com.medicare.clinic.service;

import com.medicare.clinic.dto.AttachmentDTO;
import com.medicare.clinic.model.Attachment;
import com.medicare.clinic.repository.AttachmentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload.dir:uploads/tickets}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_TYPES = List.of(
        "application/pdf", "image/jpeg", "image/png", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    public AttachmentService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    /**
     * Upload an attachment
     */
    @Transactional
    public AttachmentDTO uploadAttachment(String ticketId, MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 10 MB");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new RuntimeException("File type not allowed: " + file.getContentType());
        }

        // Generate attachment ID and file name
        String attachmentId = generateAttachmentId();
        String originalFileName = file.getOriginalFilename();
        String safeFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // Ensure upload directory exists
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        // Save file to disk
        Path filePath = Paths.get(uploadDir, safeFileName);
        Files.write(filePath, file.getBytes());

        // Create attachment record
        Attachment attachment = new Attachment();
        attachment.setAttachmentId(attachmentId);
        attachment.setTicketId(ticketId);
        attachment.setFileName(originalFileName);
        attachment.setFileType(file.getContentType());
        attachment.setFilePath(filePath.toString());
        attachment.setFileSize(file.getSize());
        attachment.setUploadedAt(LocalDateTime.now());

        Attachment saved = attachmentRepository.save(attachment);
        log.info("Attachment uploaded: {} for ticket {}", attachmentId, ticketId);
        return mapToDTO(saved);
    }

    /**
     * Get attachment by ID
     */
    public AttachmentDTO getAttachmentById(String attachmentId) {
        Attachment attachment = attachmentRepository.findByAttachmentId(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));
        return mapToDTO(attachment);
    }

    /**
     * Get all attachments for a ticket
     */
    public List<AttachmentDTO> getTicketAttachments(String ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Download attachment
     */
    public byte[] downloadAttachment(String attachmentId) throws IOException {
        Attachment attachment = attachmentRepository.findByAttachmentId(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));
        return Files.readAllBytes(Paths.get(attachment.getFilePath()));
    }

    /**
     * Delete attachment
     */
    @Transactional
    public void deleteAttachment(String attachmentId) throws IOException {
        Attachment attachment = attachmentRepository.findByAttachmentId(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));

        // Delete from disk
        Path filePath = Paths.get(attachment.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Delete from database
        attachmentRepository.deleteByAttachmentId(attachmentId);
        log.info("Attachment {} deleted", attachmentId);
    }

    /**
     * Delete all attachments for a ticket
     */
    @Transactional
    public void deleteTicketAttachments(String ticketId) throws IOException {
        List<Attachment> attachments = attachmentRepository.findByTicketId(ticketId);
        for (Attachment attachment : attachments) {
            Path filePath = Paths.get(attachment.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        }
        attachmentRepository.deleteByTicketId(ticketId);
        log.info("All attachments for ticket {} deleted", ticketId);
    }

    /**
     * Generate unique attachment ID
     */
    private String generateAttachmentId() {
        return "ATT" + System.currentTimeMillis();
    }

    /**
     * Map entity to DTO
     */
    private AttachmentDTO mapToDTO(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setAttachmentId(attachment.getAttachmentId());
        dto.setTicketId(attachment.getTicketId());
        dto.setFileName(attachment.getFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setUploadedAt(attachment.getUploadedAt());
        return dto;
    }
}
