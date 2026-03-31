package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @Column(name = "PrescriptionID")
    private String prescriptionId;

    @Column(name = "PatientID", nullable = false)
    private String patientId;

    @Column(name = "DoctorID", nullable = false)
    private String doctorId;

    @Column(name = "PrescriptionDate")
    private LocalDateTime prescriptionDate;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "Status")
    private String status = "Pending"; // Pending | Dispensed

    @PrePersist
    public void prePersist() {
        if (prescriptionDate == null) {
            prescriptionDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "Pending";
        }
    }
}
