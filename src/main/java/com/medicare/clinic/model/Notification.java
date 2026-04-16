package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notificationId", unique = true, nullable = false)
    private String notificationId;

    @Column(name = "recipientRole", nullable = false)
    private String recipientRole;  // PATIENT, ADMIN, DOCTOR, PHARMACY

    @Column(name = "recipientId", nullable = false)
    private String recipientId;  // userId or employeeId

    @Column(name = "type", nullable = false)
    private String type;  // TICKET_CREATED, TICKET_UPDATED, TICKET_ASSIGNED, FEEDBACK_SUBMITTED, etc.

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "LONGTEXT")
    private String message;

    @Column(name = "ticketId")
    private String ticketId;

    @Column(name = "isRead", nullable = false)
    private Boolean isRead = false;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }
}
