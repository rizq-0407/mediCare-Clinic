package com.medicare.clinic.dto;

import lombok.Data;

@Data
public class PrescriptionDTO {
    private String id;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String medicineId;
    private String medicineName;
    private String dosage;
    private String duration;
    private String instructions;
    private Integer refills;
    private String createdAt;
    private String status; // Pending | Dispensed
}
