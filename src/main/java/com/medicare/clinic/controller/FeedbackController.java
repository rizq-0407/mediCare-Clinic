package com.medicare.clinic.controller;

import com.medicare.clinic.dto.FeedbackDTO;
import com.medicare.clinic.service.FeedbackService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@Slf4j
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    /**
     * POST /api/feedback - Submit feedback
     */
    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> request) {
        try {
            String patientId = (String) request.get("patientId");
            Integer rating = (Integer) request.get("rating");
            String comments = (String) request.get("comments");
            Boolean isPublic = request.get("isPublic") != null ? (Boolean) request.get("isPublic") : false;

            if (patientId == null || rating == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5"));
            }

            FeedbackDTO feedback = feedbackService.submitFeedback(patientId, rating, comments, isPublic);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (Exception e) {
            log.error("Error submitting feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/feedback/{feedbackId} - Get feedback by ID
     */
    @GetMapping("/{feedbackId}")
    public ResponseEntity<?> getFeedback(@PathVariable String feedbackId) {
        try {
            FeedbackDTO feedback = feedbackService.getFeedbackById(feedbackId);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            log.error("Error fetching feedback", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/feedback/patient/{patientId} - Get feedback for a patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientFeedback(@PathVariable String patientId) {
        try {
            List<FeedbackDTO> feedback = feedbackService.getPatientFeedback(patientId);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            log.error("Error fetching patient feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/feedback - Get all feedback (admin)
     */
    @GetMapping
    public ResponseEntity<?> getAllFeedback() {
        try {
            List<FeedbackDTO> feedback = feedbackService.getAllFeedback();
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            log.error("Error fetching all feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/feedback/public - Get public feedback
     */
    @GetMapping("/public")
    public ResponseEntity<?> getPublicFeedback() {
        try {
            List<FeedbackDTO> feedback = feedbackService.getPublicFeedback();
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            log.error("Error fetching public feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PUT /api/feedback/{feedbackId} - Update feedback
     */
    @PutMapping("/{feedbackId}")
    public ResponseEntity<?> updateFeedback(@PathVariable String feedbackId, @RequestBody FeedbackDTO feedbackDTO) {
        try {
            FeedbackDTO updated = feedbackService.updateFeedback(feedbackId, feedbackDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/feedback/{feedbackId} - Delete feedback
     */
    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(@PathVariable String feedbackId) {
        try {
            feedbackService.deleteFeedback(feedbackId);
            return ResponseEntity.ok(Map.of("message", "Feedback deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting feedback", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/feedback/stats/average - Get average rating
     */
    @GetMapping("/stats/average")
    public ResponseEntity<?> getAverageRating() {
        try {
            Double avgRating = feedbackService.getAverageRating();
            return ResponseEntity.ok(Map.of("averageRating", avgRating));
        } catch (Exception e) {
            log.error("Error fetching average rating", e);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
