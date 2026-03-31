package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PrescriptionItems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @Id
    @Column(name = "PrescriptionItemID")
    private String prescriptionItemId;

    @Column(name = "PrescriptionID", nullable = false)
    private String prescriptionId;

    @Column(name = "MedicineID", nullable = false)
    private String medicineId;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "Dosage")
    private String dosage;

    @Column(name = "Duration")
    private String duration;
}
