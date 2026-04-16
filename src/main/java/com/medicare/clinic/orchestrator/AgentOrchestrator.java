package com.medicare.clinic.orchestrator;

import com.medicare.clinic.agent.*;
import com.medicare.clinic.config.GeminiService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AgentOrchestrator — routes incoming user messages using LLM Semantic Classification
 * to the correct specialist agent. It replaces hardcoded keyword lists for vastly
 * improved reliability.
 */
@Service
public class AgentOrchestrator {

    private final PatientSupportAgent patientSupportAgent;
    private final AppointmentAgent appointmentAgent;
    private final MedicalKnowledgeAgent medicalKnowledgeAgent;
    private final PharmacyAgent pharmacyAgent;
    private final GeminiService geminiService;

    // Cache the detected intents so detectAgentName() knows what the LLM returned
    private final Map<String, String> lastIntentCache = new ConcurrentHashMap<>();

    public AgentOrchestrator(PatientSupportAgent patientSupportAgent,
                             AppointmentAgent appointmentAgent,
                             MedicalKnowledgeAgent medicalKnowledgeAgent,
                             PharmacyAgent pharmacyAgent,
                             GeminiService geminiService) {
        this.patientSupportAgent = patientSupportAgent;
        this.appointmentAgent = appointmentAgent;
        this.medicalKnowledgeAgent = medicalKnowledgeAgent;
        this.pharmacyAgent = pharmacyAgent;
        this.geminiService = geminiService;
    }

    public String route(String userMessage) {
        return route(userMessage, null, null, false);
    }

    public String route(String userMessage, String sessionId) {
        return route(userMessage, sessionId, null, false);
    }

    public String route(String userMessage, String sessionId, String patientId, boolean isPharmacist) {
        // ── 1. Bypass Routing if user is in an active mid-booking conversation
        if (appointmentAgent.hasActiveSession(sessionId)) {
            lastIntentCache.put(sessionId != null ? sessionId : "default", "APPOINTMENT");
            return appointmentAgent.handle(userMessage, sessionId);
        }

        // ── 2. Determine Intent (Hybrid: Fast Keywords -> LLM Fallback)
        String intent = fastKeywordMatch(userMessage);
        
        // If keywords failed to find a specific agent, fallback to the intelligent LLM router
        if (intent.equals("UNKNOWN")) {
            System.out.println("Keywords missed, routing via LLM...");
            intent = categorizeIntentWithLLM(userMessage);
        }

        // Remember intent for UI detection (keyed by Session or generic)
        lastIntentCache.put(sessionId != null ? sessionId : "default", intent);

        // ── 3. Route based on intent output
        return switch (intent) {
            case "PHARMACY" -> {
                if (isPharmacist) {
                    yield pharmacyAgent.handle(userMessage);
                }
                yield "🔒 Pharmacy inventory data is restricted to pharmacy staff and administrators. "
                    + "How can I assist you with your health, prescriptions, or booking as a patient?";
            }
            case "APPOINTMENT" -> appointmentAgent.handle(userMessage, sessionId);
            case "MEDICAL_KNOWLEDGE" -> medicalKnowledgeAgent.handle(userMessage);
            default -> patientSupportAgent.handle(userMessage, patientId); // Fallback to Support
        };
    }

    /**
     * Fast regex/keyword mapping. If the user uses clear words, we save an API call (Rate limiting fix).
     */
    private String fastKeywordMatch(String userMessage) {
        String msg = userMessage.toLowerCase().trim();

        if (msg.contains("inventory") || msg.contains("stock level") || msg.contains("stock quantity") 
                || msg.contains("reorder") || msg.contains("low stock") || msg.contains("expir")
                || msg.contains("out of stock") || msg.contains("supplier") || msg.contains("purchase order")
                || msg.contains("dispens") || msg.contains("pharmacy")) {
            return "PHARMACY";
        }

        if (msg.contains("appointment") || msg.contains("book") || msg.contains("schedule") 
                || msg.contains("slot") || msg.contains("cancel") || msg.contains("reschedule")
                || msg.contains("available doctor")) {
            return "APPOINTMENT";
        }

        if (msg.contains("symptoms") || msg.contains("treatment") || msg.contains("disease") 
                || msg.contains("medication") || msg.contains("medicine for") || msg.contains("dosage") 
                || msg.contains("side effect") || msg.contains("how to treat")) {
            return "MEDICAL_KNOWLEDGE";
        }

        return "UNKNOWN";
    }

    /**
     * Determines which agent handled the last request for the frontend UI.
     */
    public String detectAgentName(String msg, String sessionId, boolean isPharmacist) {
        // Fallback to keyword if cache misses
        String intent = lastIntentCache.getOrDefault(sessionId != null ? sessionId : "default", "PATIENT_SUPPORT");

        return switch (intent) {
            case "PHARMACY" -> isPharmacist ? "Pharmacy Agent" : "Patient Support Agent";
            case "APPOINTMENT" -> "Appointment Agent";
            case "MEDICAL_KNOWLEDGE" -> "Medical Knowledge Agent";
            default -> "Patient Support Agent";
        };
    }

    public String detectAgentName(String msg) {
        return detectAgentName(msg, null, false);
    }

    /**
     * The Semantic LLM Router used when user uses obscure or edge-case phrases.
     */
    private String categorizeIntentWithLLM(String userMessage) {
        String systemPrompt = """
            You are the Router for the Medicare Clinic AI System.
            Classify the user's message into EXACTLY ONE of the following categories.
            You MUST ONLY return the exact uppercase name of the category.

            1. PHARMACY: User asks about medicine inventory, stock levels, suppliers, stock counts, low stock, expired drugs, or reordering.
            2. APPOINTMENT: User wants to book, cancel, reschedule, list, or check doctor availability & slots.
            3. MEDICAL_KNOWLEDGE: User asks about symptoms, diseases, what a pill/drug is used for, dosage facts, side effects, home remedies, or general health knowledge.
            4. PATIENT_SUPPORT: User asks about clinic hours, location, their own prescription history, standard greetings (hello, how are you), or anything else.

            Example 1: "Do we have any paracetamol left in stock?" -> PHARMACY
            Example 2: "I have a headache, what should I take?" -> MEDICAL_KNOWLEDGE
            Example 3: "Cancel my appointment #14" -> APPOINTMENT
            Example 4: "What time do you open?" -> PATIENT_SUPPORT
            """;

        String rawResponse = geminiService.chat(systemPrompt, userMessage);
        if (rawResponse == null) return "PATIENT_SUPPORT";

        String clean = rawResponse.toUpperCase().trim();
        if (clean.contains("PHARMACY")) return "PHARMACY";
        if (clean.contains("APPOINTMENT")) return "APPOINTMENT";
        if (clean.contains("MEDICAL_KNOWLEDGE")) return "MEDICAL_KNOWLEDGE";
        
        return "PATIENT_SUPPORT";
    }
}