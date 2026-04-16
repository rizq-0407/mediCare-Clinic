package com.medicare.clinic.repository;

import com.medicare.clinic.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    // Custom method to find all payments made against a specific invoice
    List<Payment> findByInvoiceId(String invoiceId);
}