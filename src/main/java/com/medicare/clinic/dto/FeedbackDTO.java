package com.medicare.clinic.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackDTO {
    private String feedbackId;
    private String patientId;
    private String patientName;
    private Integer rating;
    private String comments;
    private Boolean isPublic;
    private String adminReply;
    private String repliedBy;
    private LocalDateTime firstResponseAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
