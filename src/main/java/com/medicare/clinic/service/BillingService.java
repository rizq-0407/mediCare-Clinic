package com.medicare.clinic.service;

import com.medicare.clinic.entity.Invoice;
import com.medicare.clinic.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    // READ: Get all invoices for the Admin
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // READ: Get specific invoices for the Patient Portal
    public List<Invoice> getInvoicesByPatientId(String patientId) {
        return invoiceRepository.findByPatientId(patientId);
    }

    // CREATE: The database fix
    public Invoice createInvoice(Invoice invoice) {
        // Generate the unique ID if it doesn't exist
        if (invoice.getInvoiceId() == null || invoice.getInvoiceId().isEmpty()) {
            String randomString = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            invoice.setInvoiceId("INV-" + randomString);
        }

        // Lock in the timestamp and status
        invoice.setIssuedDate(LocalDateTime.now());
        invoice.setStatus("UNPAID");

        // FORCE THE DATABASE TO SAVE THE ROW
        return invoiceRepository.save(invoice);
    }

    // UPDATE: Change status to PAID when Stripe succeeds
    public Invoice payInvoice(String invoiceId, String paymentMethod) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found in database"));

        invoice.setStatus("PAID");

        // Calling save() on an existing ID forces SQL to run an UPDATE command
        return invoiceRepository.save(invoice);
    }

    // DELETE: Remove errors completely
    public void deleteInvoice(String invoiceId) {
        // Physically removes the row from the SQL database
        invoiceRepository.deleteById(invoiceId);
    }
}