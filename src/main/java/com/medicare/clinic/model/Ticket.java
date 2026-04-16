package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticketId", unique = true, nullable = false)
    private String ticketId;

    @Column(name = "patientId", nullable = false)
    private String patientId;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "status", nullable = false)
    private String status = "OPEN";  // OPEN, IN-PROGRESS, WAITING-FOR-PATIENT, RESOLVED, CLOSED

    @Column(name = "priority", nullable = false)
    private String priority = "MEDIUM";  // URGENT, HIGH, MEDIUM, LOW

    @Column(name = "category")
    private String category;

    @Column(name = "assignedAdminId")
    private String assignedAdminId;

    @Column(name = "adminReply", columnDefinition = "LONGTEXT")
    private String adminReply;

    @Column(name = "repliedBy")
    private String repliedBy;

    @Column(name = "firstResponseAt")
    private LocalDateTime firstResponseAt;

    @Column(name = "closedAt")
    private LocalDateTime closedAt;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "OPEN";
        }
        if (priority == null) {
            priority = "MEDIUM";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
