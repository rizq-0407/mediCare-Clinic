package com.medicare.clinic.service;

import com.medicare.clinic.entity.Invoice;
import com.medicare.clinic.repository.InvoiceRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentGatewayService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    // This gets the key from application.properties
    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createCheckoutSession(String invoiceId) throws Exception {
        // Find the invoice in your database
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found!"));

        // Stripe requires the amount to be in cents (e.g., $150.00 = 15000 cents)
        long amountInCents = invoice.getTotalAmount().multiply(new java.math.BigDecimal("100")).longValue();

        // Build the Stripe Checkout Session
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:3000/payment-cancelled")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Clinic Bill - " + invoice.getInvoiceId())
                                                                .build())
                                                .build())
                                .build())
                .build();

        // Generate the session and return the URL
        Session session = Session.create(params);
        return session.getUrl();
    }
}