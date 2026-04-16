package com.medicare.clinic.service;

import com.medicare.clinic.dto.FeedbackDTO;
import com.medicare.clinic.model.Feedback;
import com.medicare.clinic.repository.FeedbackRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;

    public FeedbackService(FeedbackRepository feedbackRepository, NotificationService notificationService) {
        this.feedbackRepository = feedbackRepository;
        this.notificationService = notificationService;
    }

    /**
     * Submit feedback
     */
    @Transactional
    public FeedbackDTO submitFeedback(String patientId, Integer rating, String comments, Boolean isPublic) {
        String feedbackId = generateFeedbackId();

        Feedback feedback = new Feedback();
        feedback.setFeedbackId(feedbackId);
        feedback.setPatientId(patientId);
        feedback.setRating(rating);
        feedback.setComments(comments);
        feedback.setIsPublic(isPublic != null ? isPublic : false);
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());

        Feedback saved = feedbackRepository.save(feedback);

        // Notify admins
        notificationService.notifyAdmins("FEEDBACK_SUBMITTED",
            "New Feedback Received",
            "Patient " + patientId + " submitted feedback with rating " + rating,
            null);

        log.info("Feedback created: {} by patient {}", feedbackId, patientId);
        return mapToDTO(saved);
    }

    /**
     * Get feedback by ID
     */
    public FeedbackDTO getFeedbackById(String feedbackId) {
        Feedback feedback = feedbackRepository.findByFeedbackId(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        return mapToDTO(feedback);
    }

    /**
     * Get all feedback for a patient
     */
    public List<FeedbackDTO> getPatientFeedback(String patientId) {
        return feedbackRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get public feedback
     */
    public List<FeedbackDTO> getPublicFeedback() {
        return feedbackRepository.findByIsPublicTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all feedback (admin view)
     */
    public List<FeedbackDTO> getAllFeedback() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update feedback
     */
    @Transactional
    public FeedbackDTO updateFeedback(String feedbackId, FeedbackDTO feedbackDTO) {
        Feedback feedback = feedbackRepository.findByFeedbackId(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));

        if (feedbackDTO.getPatientId() == null || feedbackDTO.getPatientId().isBlank()) {
            throw new RuntimeException("patientId is required");
        }
        if (!feedback.getPatientId().equals(feedbackDTO.getPatientId())) {
            throw new RuntimeException("You can only edit your own feedback");
        }
        if (feedback.getAdminReply() != null && !feedback.getAdminReply().isBlank()) {
            throw new RuntimeException("Feedback cannot be edited after admin reply");
        }

        if (feedbackDTO.getRating() != null) {
            feedback.setRating(feedbackDTO.getRating());
        }
        if (feedbackDTO.getComments() != null) {
            feedback.setComments(feedbackDTO.getComments());
        }
        if (feedbackDTO.getIsPublic() != null) {
            feedback.setIsPublic(feedbackDTO.getIsPublic());
        }
        feedback.setUpdatedAt(LocalDateTime.now());

        Feedback updated = feedbackRepository.save(feedback);
        log.info("Feedback {} updated", feedbackId);
        return mapToDTO(updated);
    }

    /**
     * Delete feedback
     */
    @Transactional
    public void deleteFeedback(String feedbackId) {
        Feedback feedback = feedbackRepository.findByFeedbackId(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found: " + feedbackId));
        feedbackRepository.delete(feedback);
        log.info("Feedback {} deleted", feedbackId);
    }

    /**
     * Get average rating
     */
    public Double getAverageRating() {
        List<Feedback> allFeedback = feedbackRepository.findAll();
        if (allFeedback.isEmpty()) {
            return 0.0;
        }
        return allFeedback.stream()
                .mapToDouble(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Get average rating for a patient
     */
    public Double getPatientAverageRating(String patientId) {
        List<Feedback> patientFeedback = feedbackRepository.findByPatientId(patientId);
        if (patientFeedback.isEmpty()) {
            return 0.0;
        }
        return patientFeedback.stream()
                .mapToDouble(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Generate unique feedback ID
     */
    private String generateFeedbackId() {
        long count = feedbackRepository.count();
        return "FB" + String.format("%04d", count + 1);
    }

    /**
     * Map entity to DTO
     */
    private FeedbackDTO mapToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setFeedbackId(feedback.getFeedbackId());
        dto.setPatientId(feedback.getPatientId());
        dto.setRating(feedback.getRating());
        dto.setComments(feedback.getComments());
        dto.setIsPublic(feedback.getIsPublic());
        dto.setAdminReply(feedback.getAdminReply());
        dto.setRepliedBy(feedback.getRepliedBy());
        dto.setFirstResponseAt(feedback.getFirstResponseAt());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setUpdatedAt(feedback.getUpdatedAt());
        return dto;
    }
}
