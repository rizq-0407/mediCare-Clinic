package com.medicare.clinic.agent;

import com.medicare.clinic.config.GeminiService;
import com.medicare.clinic.model.Medicine;
import com.medicare.clinic.repository.MedicineRepository;
import com.medicare.clinic.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Pharmacy Agent — accessible only within the Pharmacy Module (admin/pharmacist role).
 * Provides:
 * - Full inventory overview with low-stock alerts
 * - Expiry date warnings for medicines
 * - Reorder suggestions and alternative medicine advice
 * - Prescription dispensing summaries
 * - AI-driven supply chain recommendations
 */
@Service
public class PharmacyAgent {

    private final GeminiService gemini;
    private final MedicineRepository medicineRepo;
    private final PrescriptionRepository prescriptionRepo;

    public PharmacyAgent(GeminiService gemini,
                         MedicineRepository medicineRepo,
                         PrescriptionRepository prescriptionRepo) {
        this.gemini = gemini;
        this.medicineRepo = medicineRepo;
        this.prescriptionRepo = prescriptionRepo;
    }

    public String handle(String userMessage) {
        // ── Fetch complete inventory state ─────────────────────────────────────
        List<Medicine> allMedicines = medicineRepo.findAll();
        List<Medicine> lowStock = medicineRepo.findLowStockMedicines(10);

        // Expiring within 30 days
        LocalDate warningDate = LocalDate.now().plusDays(30);
        List<Medicine> expiringSoon = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(warningDate))
                .collect(Collectors.toList());

        // Already expired
        List<Medicine> expired = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(LocalDate.now()))
                .collect(Collectors.toList());

        // Out of stock
        List<Medicine> outOfStock = allMedicines.stream()
                .filter(m -> m.getStockQuantity() != null && m.getStockQuantity() == 0)
                .collect(Collectors.toList());

        // Prescription stats
        long totalPrescriptions = prescriptionRepo.count();
        long pendingDispense = prescriptionRepo.findByStatus("Pending").size();
        long dispensed = prescriptionRepo.findByStatus("Dispensed").size();

        // Summarise inventory (send names and counts only to save tokens)
        String inventorySummary = allMedicines.isEmpty()
                ? "No medicines in inventory."
                : String.format("Total distinct medicines: %d. Low stock items: %d. Out of stock: %d. Expiring soon: %d",
                        allMedicines.size(), lowStock.size(), outOfStock.size(), expiringSoon.size());

        String lowStockSummary = lowStock.isEmpty()
                ? "✅ All medicines are adequately stocked."
                : lowStock.stream()
                        .map(m -> "  ⚠️ " + m.getName() + " — " + m.getStockQuantity() + " units left"
                                + (m.getReorderLevel() != null ? " (reorder at " + m.getReorderLevel() + ")" : ""))
                        .collect(Collectors.joining("\n"));

        String expirySummary = expiringSoon.isEmpty()
                ? "✅ No medicines expiring in the next 30 days."
                : expiringSoon.stream()
                        .map(m -> "  🕐 " + m.getName() + " — expires " + m.getExpiryDate()
                                + (expired.contains(m) ? " ❌ ALREADY EXPIRED" : ""))
                        .collect(Collectors.joining("\n"));

        String outOfStockSummary = outOfStock.isEmpty()
                ? "✅ No medicines are completely out of stock."
                : outOfStock.stream()
                        .map(m -> "  ❌ " + m.getName() + " — OUT OF STOCK")
                        .collect(Collectors.joining("\n"));

        String systemPrompt = """
                You are PharmBot, the AI Pharmacy Agent for Medicare Smart Clinic.
                You are ONLY accessible to pharmacists and clinic administrators.
                Today's date: %s

                Your responsibilities:
                1. Analyse the full medicine inventory and flag issues (low stock, expiry, out-of-stock).
                2. Recommend reorder quantities and suggest alternative medicines when stock is low.
                3. Summarise prescription dispensing status and flag pending prescriptions.
                4. Provide AI-driven decisions: should we bulk-order? discontinue a slow-moving medicine?
                5. Suggest supplier contacts for restocking critical medicines.
                6. Help the pharmacist search for a specific medicine, category, or supplier.

                ── Medicine Inventory Summary ────────────────────────────────────
                %s

                ── Low Stock Alert (< 10 units) ──────────────────────────────────
                %s

                ── Expiry Warnings (within 30 days) ──────────────────────────────
                %s

                ── Out of Stock ──────────────────────────────────────────────────
                %s

                ── Prescription Dispensing Summary ───────────────────────────────
                Total prescriptions : %d
                Pending (not dispensed): %d
                Dispensed            : %d

                ── Agent Rules ───────────────────────────────────────────────────
                - This agent CAN discuss stock levels, quantities, expiry dates, suppliers, and prices.
                - Be precise: give exact numbers, dates, and medicine names.
                - Prioritise alerts: expired > out of stock > low stock > expiring soon.
                - When recommending reorders, suggest quantity = (reorderLevel × 3) as a safe buffer.
                - If asked about a specific medicine, pull its exact details from the inventory above.
                - If medicines are expired, recommend immediate removal from dispensing shelves.
                - Format output with clear sections, emojis for severity, and bullet lists.
                - If asked for a purchase order summary, list all low/out-of-stock medicines in table format.
                """.formatted(
                        LocalDate.now(),
                        inventorySummary,
                        lowStockSummary,
                        expirySummary,
                        outOfStockSummary,
                        totalPrescriptions,
                        pendingDispense,
                        dispensed);

        return gemini.chat(systemPrompt, userMessage);
    }
}