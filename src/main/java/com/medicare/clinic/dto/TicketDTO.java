package com.medicare.clinic.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketDTO {
    private String ticketId;
    private String patientId;
    private String patientName;
    private String subject;
    private String description;
    private String status;
    private String priority;
    private String category;
    private String assignedAdminId;
    private String assignedAdminName;
    private String adminReply;
    private String repliedBy;
    private LocalDateTime firstResponseAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
