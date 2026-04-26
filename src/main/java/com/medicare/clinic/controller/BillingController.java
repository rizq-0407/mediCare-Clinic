package com.medicare.clinic.controller;

import com.medicare.clinic.model.Invoice;
import com.medicare.clinic.service.BillingService;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*") // Allows React frontend to connect
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void initStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    // --- DATABASE ENDPOINTS ---

    @GetMapping("/all")
    public List<Invoice> getAllInvoices() {
        return billingService.getAllInvoices();
    }

    @GetMapping("/patient/{patientId}")
    public List<Invoice> getPatientInvoices(@PathVariable String patientId) {
        return billingService.getInvoicesByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        try {
            return ResponseEntity.ok(billingService.createInvoice(invoice));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); // Catches Foreign Key errors!
        }
    }

    @PutMapping("/{invoiceId}/pay")
    public ResponseEntity<Invoice> payInvoice(@PathVariable String invoiceId, @RequestParam String method) {
        try {
            return ResponseEntity.ok(billingService.payInvoice(invoiceId, method));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable String invoiceId) {
        try {
            billingService.deleteInvoice(invoiceId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // --- STRIPE ENDPOINT ---

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());
            long amountInCents = (long) (amount * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("lkr")
                    .addPaymentMethodType("card")
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("clientSecret", intent.getClientSecret());
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}