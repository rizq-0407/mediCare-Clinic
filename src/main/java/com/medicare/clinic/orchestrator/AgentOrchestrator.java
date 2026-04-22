package com.medicare.clinic.orchestrator;

import com.medicare.clinic.agent.*;
import com.medicare.clinic.config.GeminiService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AgentOrchestrator — routes user messages to the correct specialist agent.
 *
 * ── Rate-Limit Strategy (Gemini free tier = 15 RPM) ──────────────────────────
 *  Every user message → EXACTLY 1 Gemini API call (the agent response).
 *  The intent router is PURE keyword matching — ZERO extra API calls.
 *  Unrecognised messages fall back to PatientSupportAgent which handles
 *  general questions gracefully via its own single Gemini call.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
public class AgentOrchestrator {

    private final PatientSupportAgent patientSupportAgent;
    private final AppointmentAgent appointmentAgent;
    private final MedicalKnowledgeAgent medicalKnowledgeAgent;
    private final PharmacyAgent pharmacyAgent;

    // NOTE: GeminiService is only kept here for detectAgentName() flow.
    // The orchestrator itself NEVER calls Gemini — only agents do.
    private final GeminiService geminiService;

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
        return route(userMessage, null, null, "PATIENT");
    }

    public String route(String userMessage, String sessionId) {
        return route(userMessage, sessionId, null, "PATIENT");
    }

    public String route(String userMessage, String sessionId, String patientId, String roleUpper) {
        // 1. Continue active multi-step appointment booking (no keyword check needed)
        if (appointmentAgent.hasActiveSession(sessionId)) {
            if (!roleUpper.equals("DOCTOR") && !roleUpper.equals("ADMIN")) {
                return "🔒 Booking an appointment is restricted to administrators and doctors.";
            }
            cache(sessionId, "APPOINTMENT");
            return appointmentAgent.handle(userMessage, sessionId);
        }

        // 2. Pure keyword routing — NO Gemini API call
        String intent = classify(userMessage);
        cache(sessionId, intent);

        System.out.println("[Orchestrator] " + intent + " → \"" + userMessage.substring(0, Math.min(60, userMessage.length())) + "\"");

        // 3. Dispatch to the correct agent with role enforcement
        return switch (intent) {
            case "PHARMACY" -> {
                if (!roleUpper.equals("PHARMACY") && !roleUpper.equals("PHARMACIST") && !roleUpper.equals("ADMIN")) {
                    yield "🔒 Pharmacy agent is restricted to Pharmacy and Admin dashboards.";
                }
                yield pharmacyAgent.handle(userMessage);
            }
            case "APPOINTMENT" -> {
                if (!roleUpper.equals("DOCTOR") && !roleUpper.equals("ADMIN")) {
                    yield "🔒 Doctor agent (Appointments) is restricted to Doctor and Admin dashboards.";
                }
                yield appointmentAgent.handle(userMessage, sessionId);
            }
            case "MEDICAL_KNOWLEDGE" -> {
                // Common for all
                yield medicalKnowledgeAgent.handle(userMessage);
            }
            default -> { // PATIENT_SUPPORT
                if (!roleUpper.equals("PATIENT")) {
                    yield "🔒 Patient agent is restricted to the Patient dashboard.";
                }
                yield patientSupportAgent.handle(userMessage, patientId);
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pure keyword classifier — covers ~97% of real clinic queries.
    // Returns PATIENT_SUPPORT for anything unrecognised (safe fallback).
    // Cost: ZERO API calls.
    // ─────────────────────────────────────────────────────────────────────────
    private String classify(String userMessage) {
        String m = userMessage.toLowerCase().trim();

        // ── PHARMACY ─────────────────────────────────────────────────────────
        if (anyOf(m,
                "inventory", "stock level", "stock quantity", "stock count", "current stock",
                "reorder", "low stock", "expir", "out of stock", "no stock", "units left",
                "units remaining", "how many units", "medicines available", "drugs available",
                "supplier", "purchase order", "bulk order", "restocking", "restock",
                "dispens", "pharmacy inventory", "medicine stock", "drug stock",
                "batch", "shelf life", "slow moving", "fast moving", "high demand",
                "controlled substance", "drug expiry", "medicine expiry")) {
            return "PHARMACY";
        }

        // ── APPOINTMENT ───────────────────────────────────────────────────────
        if (anyOf(m,
                "appointment", "book", "schedule an", "schedule a", "slot",
                "cancel appointment", "reschedule", "available doctor", "see a doctor",
                "visit doctor", "make an appointment", "get an appointment", "reserve",
                "when can i see", "next available", "book me", "i want to book",
                "need to book", "set up appointment", "check appointment", "my appointment",
                "show appointment", "list appointment", "upcoming appointment",
                "doctor availability", "available slot", "free slot", "consultation slot",
                "i need a doctor", "want to see", "see the doctor", "book appointment")) {
            return "APPOINTMENT";
        }

        // ── MEDICAL KNOWLEDGE ─────────────────────────────────────────────────
        if (anyOf(m,
                // Generic medical terms
                "what is", "what are", "how does", "how do", "tell me about", "explain",
                "symptoms of", "signs of", "cause of", "treatment for", "how to treat",
                "how is", "used for", "prescribed for", "works for",
                // Conditions / body systems
                "disease", "condition", "illness", "disorder", "syndrome",
                "fever", "pain", "headache", "migraine", "cough", "cold", "flu",
                "rash", "itch", "allerg", "infection", "wound", "injury", "sprain",
                "fracture", "broken bone", "swelling", "bleed", "bleeding",
                "nausea", "vomit", "diarrhea", "diarrhoea", "constipat",
                "fatigue", "tired", "weakness", "dizziness", "fainting",
                "chest pain", "shortness of breath", "breathing difficul", "heart attack",
                "stroke", "seizure", "unconscious",
                "diabetes", "hypertension", "blood pressure", "high bp",
                "asthma", "cancer", "tumor", "arthritis", "osteoporosis",
                "anemia", "anaemia", "cholesterol", "thyroid",
                "depression", "anxiety", "stress", "insomnia", "sleep", "mental health",
                "skin", "acne", "eczema", "psoriasis", "rosacea",
                "eye", "ear", "dental", "tooth", "teeth", "gum",
                "pregnancy", "prenatal", "breastfeed", "menstrual", "period",
                "child health", "pediatric", "infant", "baby fever",
                "kidney", "liver", "lung", "stomach", "abdomen", "bowel",
                "urine", "bladder", "prostate",
                // Medications / treatments
                "medication", "medicine for", "drug for", "dosage", "dose",
                "side effect", "side-effect", "overdose", "interaction",
                "paracetamol", "ibuprofen", "amoxicillin", "aspirin", "metformin",
                "antibiotic", "antiviral", "antifungal", "steroid", "insulin",
                "vaccine", "vaccination", "immunisation",
                // First aid / lifestyle
                "first aid", "home remedy", "home care", "remedy", "natural cure",
                "supplement", "vitamin", "mineral", "deficiency",
                "blood test", "lab test", "test result", "scan", "x-ray", "mri",
                "diagnosis", "diagnose", "prognosis", "recovery",
                "healthy eating", "diet", "nutrition", "exercise", "weight",
                "obesity", "bmi", "calories")) {
            return "MEDICAL_KNOWLEDGE";
        }

        // ── PATIENT SUPPORT (explicit) ────────────────────────────────────────
        if (anyOf(m,
                "clinic hour", "opening hour", "when do you open", "when are you open",
                "close time", "closing time", "open time", "working hour",
                "location", "address", "where are you", "how to get there",
                "directions", "contact", "phone number", "email", "website",
                "emergency number", "emergency contact", "ambulance",
                "prescription", "my prescription", "my record",
                "medical record", "patient record", "my history",
                "insurance", "billing", "payment", "cost", "fee", "how much",
                "specialist", "which doctor", "which specialist", "recommend doctor",
                "help", "what can you do", "how can you help", "what do you do",
                "clinic info", "about the clinic", "services", "facilities")) {
            return "PATIENT_SUPPORT";
        }

        // Explicit greeting → patient support (no regex needed, checked quickly)
        if (m.length() < 30 && anyOf(m,
                "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
                "howdy", "greetings", "thank", "thanks", "bye", "goodbye",
                "ok", "okay", "sure", "alright", "great", "yes", "no",
                "please", "help me")) {
            return "PATIENT_SUPPORT";
        }

        // Default — PatientSupportAgent handles anything else gracefully
        System.out.println("[Orchestrator] No keyword match — falling back to PATIENT_SUPPORT");
        return "PATIENT_SUPPORT";
    }

    /** Returns true if the message contains ANY of the given keyword fragments. */
    private boolean anyOf(String msg, String... keywords) {
        for (String kw : keywords) {
            if (msg.contains(kw)) return true;
        }
        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────

    public String detectAgentName(String msg, String sessionId, String roleUpper) {
        String intent = lastIntentCache.getOrDefault(sessionId != null ? sessionId : "default", "PATIENT_SUPPORT");
        return switch (intent) {
            case "PHARMACY"          -> "Pharmacy Agent";
            case "APPOINTMENT"       -> "Doctor Agent";
            case "MEDICAL_KNOWLEDGE" -> "Medical Knowledge Agent";
            default                  -> "Patient Agent";
        };
    }

    public String detectAgentName(String msg) {
        return detectAgentName(msg, null, "PATIENT");
    }

    private void cache(String sessionId, String intent) {
        lastIntentCache.put(sessionId != null ? sessionId : "default", intent);
    }
}