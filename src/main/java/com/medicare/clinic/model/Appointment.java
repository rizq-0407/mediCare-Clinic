package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AppointmentID")
    private Long appointmentId;

    @Column(name = "PatientName", nullable = false)
    private String patientName;

    @Column(name = "PatientId")
    private String patientId;

    @Column(name = "DoctorName", nullable = false)
    private String doctorName;

    @Column(name = "Specialty", nullable = false)
    private String specialty;

    @Column(name = "AppointmentDate", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "Symptoms", length = 1000)
    private String symptoms;

    @Column(name = "Status")
    private String status = "Scheduled";

    @Column(name = "Notes", length = 2000)
    private String notes;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        // Only set default status if it was never explicitly set
        // (AI agent sets "Pending" before save — do NOT override it here)
        if (status == null) status = "Scheduled";
    }
}
