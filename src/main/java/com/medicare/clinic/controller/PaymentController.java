package com.medicare.clinic.controller;

import com.medicare.clinic.service.PaymentGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentGatewayService paymentGatewayService;

    @PostMapping("/checkout/{invoiceId}")
    public ResponseEntity<?> createCheckoutSession(@PathVariable String invoiceId) {
        try {
            // Generate the Stripe URL
            String checkoutUrl = paymentGatewayService.createCheckoutSession(invoiceId);

            // Return it to the frontend as a JSON object
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}