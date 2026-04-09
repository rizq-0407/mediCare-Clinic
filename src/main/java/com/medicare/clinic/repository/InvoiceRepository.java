package com.medicare.clinic.repository;

import com.medicare.clinic.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    // Custom method to easily grab invoices for just one patient
    List<Invoice> findByPatientId(String patientId);
}