package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "feedbackId", unique = true, nullable = false)
    private String feedbackId;

    @Column(name = "patientId", nullable = false)
    private String patientId;

    @Column(name = "rating", nullable = false)
    private Integer rating;  // 1-5

    @Column(name = "comments", columnDefinition = "LONGTEXT")
    private String comments;

    @Column(name = "isPublic", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "adminReply", columnDefinition = "LONGTEXT")
    private String adminReply;

    @Column(name = "repliedBy")
    private String repliedBy;

    @Column(name = "firstResponseAt")
    private LocalDateTime firstResponseAt;

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
        if (isPublic == null) {
            isPublic = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
