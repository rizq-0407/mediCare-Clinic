package com.medicare.clinic.repository;

import com.medicare.clinic.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByFeedbackId(String feedbackId);
    List<Feedback> findByPatientId(String patientId);
    List<Feedback> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Feedback> findByIsPublicTrue();
    List<Feedback> findByIsPublicTrueOrderByCreatedAtDesc();
    List<Feedback> findByRatingOrderByCreatedAtDesc(Integer rating);
    long countByPatientId(String patientId);
}
