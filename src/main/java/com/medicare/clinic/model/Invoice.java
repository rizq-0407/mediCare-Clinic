package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing an Invoice in the Smart Clinic System.
 * Author: Peiris K N L (IT24102077)
 */
@Entity
@Table(name = "Invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @Column(name = "InvoiceID", length = 10)
    private String invoiceId;

    @Column(name = "PatientID", nullable = false, length = 10)
    private String patientId;

    @Column(name = "TotalAmount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "Status", length = 20)
    private String status = "UNPAID";

    @Column(name = "IssuedDate")
    private LocalDateTime issuedDate = LocalDateTime.now();

    @Column(name = "DueDate")
    private LocalDateTime dueDate;

    // Added explicitly mapped column for the Patient Name
    @Column(name = "PatientName", length = 100)
    private String patientName;
}
