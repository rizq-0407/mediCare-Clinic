package com.medicare.clinic.controller;

import com.medicare.clinic.dto.AttachmentDTO;
import com.medicare.clinic.service.AttachmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attachments")
@Slf4j
@CrossOrigin(origins = "*")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    /**
     * POST /api/attachments/upload/{ticketId} - Upload attachment
     */
    @PostMapping("/upload/{ticketId}")
    public ResponseEntity<?> uploadAttachment(@PathVariable String ticketId,
                                              @RequestParam("file") MultipartFile file) {
        try {
            AttachmentDTO attachment = attachmentService.uploadAttachment(ticketId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(attachment);
        } catch (IOException e) {
            log.error("Error uploading attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/attachments/ticket/{ticketId} - Get attachments for a ticket
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<?> getTicketAttachments(@PathVariable String ticketId) {
        try {
            List<AttachmentDTO> attachments = attachmentService.getTicketAttachments(ticketId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            log.error("Error fetching attachments", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/attachments/{attachmentId} - Get attachment details
     */
    @GetMapping("/{attachmentId}")
    public ResponseEntity<?> getAttachment(@PathVariable String attachmentId) {
        try {
            AttachmentDTO attachment = attachmentService.getAttachmentById(attachmentId);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            log.error("Error fetching attachment", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/attachments/download/{attachmentId} - Download attachment
     */
    @GetMapping("/download/{attachmentId}")
    public ResponseEntity<?> downloadAttachment(@PathVariable String attachmentId) {
        try {
            AttachmentDTO attachmentDTO = attachmentService.getAttachmentById(attachmentId);
            byte[] fileContent = attachmentService.downloadAttachment(attachmentId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachmentDTO.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, attachmentDTO.getFileType())
                    .body(fileContent);
        } catch (IOException e) {
            log.error("Error downloading attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Error downloading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error downloading attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/attachments/{attachmentId} - Delete attachment
     */
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable String attachmentId) {
        try {
            attachmentService.deleteAttachment(attachmentId);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (IOException e) {
            log.error("Error deleting attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Error deleting file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting attachment", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
