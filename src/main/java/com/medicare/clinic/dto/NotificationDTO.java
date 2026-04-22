package com.medicare.clinic.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String notificationId;
    private String recipientRole;
    private String recipientId;
    private String type;
    private String title;
    private String message;
    private String ticketId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
