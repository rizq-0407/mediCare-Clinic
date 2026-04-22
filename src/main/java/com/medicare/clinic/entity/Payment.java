package com.medicare.clinic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a Payment transaction.
 * Author: Peiris K N L (IT24102077)
 */
@Entity
@Table(name = "Payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(name = "PaymentID", length = 10)
    private String paymentId;

    @Column(name = "InvoiceID", nullable = false, length = 10)
    private String invoiceId;

    @Column(name = "AmountPaid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;

    @Column(name = "PaymentStatus", length = 20)
    private String paymentStatus = "COMPLETED";

    @Column(name = "PaymentDate")
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "StripeTransactionID", length = 100)
    private String stripeTransactionId;
}