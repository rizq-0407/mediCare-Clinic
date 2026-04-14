package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MedicalRecords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RecordID")
    private Long id;

    @Column(name = "PatientFullName", nullable = false, length = 100)
    private String patientFullName;

    @Column(name = "PatientUsername", length = 50)
    private String patientUsername;

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "Gender", length = 20)
    private String gender;

    @Column(name = "BloodGroup", length = 10)
    private String bloodGroup;

    @Column(name = "Allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "AttendingDoctor", length = 100)
    private String attendingDoctor;

    @Column(name = "VisitDate", nullable = false)
    private LocalDate visitDate;

    @Column(name = "NextVisitFollowUpDate")
    private LocalDate nextVisitFollowUpDate;

    @Column(name = "Status", length = 50)
    private String status;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
        if (status == null)
            status = "Active";
        if (visitDate == null)
            visitDate = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
