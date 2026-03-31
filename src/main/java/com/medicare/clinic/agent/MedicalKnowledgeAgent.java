package com.medicare.clinic.agent;

import com.medicare.clinic.config.GeminiService;
import com.medicare.clinic.model.Medicine;
import com.medicare.clinic.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Medical Knowledge Agent — answers health questions, explains symptoms,
 * describes medications (public knowledge), and provides first-aid guidance.
 * Optionally cross-references the clinic's medicine catalogue for availability hints.
 */
@Service
public class MedicalKnowledgeAgent {

    private final GeminiService gemini;
    private final MedicineRepository medicineRepo;

    public MedicalKnowledgeAgent(GeminiService gemini, MedicineRepository medicineRepo) {
        this.gemini = gemini;
        this.medicineRepo = medicineRepo;
    }

    public String handle(String userMessage) {
        // ── Build a safe medicine name list (NOT stock levels) ─────────────────
        List<Medicine> allMedicines = medicineRepo.findAll();
        // Just extract basic names instead of formatting huge strings
        String medicineCatalogue = allMedicines.isEmpty()
                ? "No medicines listed in the clinic catalogue yet."
                : allMedicines.stream()
                        .map(Medicine::getName)
                        .filter(n -> n != null && !n.isBlank())
                        .collect(Collectors.joining(", "));

        // Detect if question involves a medicine that's in our catalogue
        String lowerMsg = userMessage.toLowerCase();
        String matchedMedicine = allMedicines.stream()
                .filter(m -> m.getName() != null && lowerMsg.contains(m.getName().toLowerCase()))
                .map(Medicine::getName)
                .findFirst()
                .orElse(null);

        String medicineContext = matchedMedicine != null
                ? "\n[Note: '" + matchedMedicine + "' IS carried by Medicare Clinic — patients can get it here.]"
                : "";

        String systemPrompt = """
                You are MedBot, the Medical Knowledge Agent at Medicare Smart Clinic.
                Today's date: %s

                Your role:
                1. Answer general medical and health questions clearly, accurately, and helpfully.
                2. Explain symptoms, diseases, conditions, and how they are typically diagnosed.
                3. Describe what common medications are used for (general knowledge — NOT personal dosage advice).
                4. Provide first-aid and basic home-care advice when appropriate.
                5. Guide the patient on whether they should see a doctor immediately or if home care is sufficient.
                6. If a disease/symptom is severe or life-threatening, strongly advise immediate medical attention.

                ── Medicare Clinic Medicine Catalogue (names only, NO stock info) ──
                %s
                %s

                ── Strict Rules ──────────────────────────────────────────────────
                - NEVER provide specific dosage amounts for a named patient — say "consult your doctor".
                - NEVER reveal, discuss, or estimate stock quantities, reorder levels, or inventory data.
                - Do NOT diagnose the patient — only provide general educational information.
                - If a question is clearly not medical (e.g., booking, billing), politely redirect.
                - For emergencies: ALWAYS say "Call 119 or go to the nearest ER immediately."
                - Cite that answers are educational and not a substitute for professional medical advice.
                - Use bullet points and clear sections for complex answers.
                - Keep responses friendly, structured, and scannable.

                ── Response Format ────────────────────────────────────────────────
                Use this structure where possible:
                📋 **What is [topic]?**
                🔍 **Common Symptoms / Uses**
                💊 **General Treatment / Medication (general knowledge)**
                ⚠️  **When to see a doctor**
                🏥 **At Medicare Clinic** (if relevant to our catalogue)
                """.formatted(
                        LocalDate.now(),
                        medicineCatalogue,
                        medicineContext);

        return gemini.chat(systemPrompt, userMessage);
    }
}
