package com.medicare.clinic.agent;

import com.medicare.clinic.config.GeminiService;
import com.medicare.clinic.model.Appointment;
import com.medicare.clinic.model.Doctor;
import com.medicare.clinic.repository.AppointmentRepository;
import com.medicare.clinic.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Appointment Agent — handles full appointment booking flow with:
 * - Multi-step conversation memory (session map)
 * - Auto-creation in DB when enough data is collected
 * - Specialty inference from symptoms
 * - Doctor availability check from DB
 * - Reschedule / cancel / list support
 */
@Service
public class AppointmentAgent {

    private final GeminiService gemini;
    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;

    // In-memory session state: sessionId → partial booking data
    private final Map<String, BookingSession> sessions = new ConcurrentHashMap<>();

    public AppointmentAgent(GeminiService gemini,
                            AppointmentRepository appointmentRepo,
                            DoctorRepository doctorRepo) {
        this.gemini = gemini;
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
    }

    // ── Simple value object for session state ─────────────────────────────────
    private static class BookingSession {
        String patientName;
        String patientId;
        String symptoms;
        LocalDateTime preferredDate;
        String specialty;
        int step = 0; // 0=new, 1=name collected, 2=symptoms collected, 3=date collected
    }

    // ── Public handle (no session — fallback) ─────────────────────────────────
    public String handle(String userMessage) {
        return handle(userMessage, null);
    }

    public boolean hasActiveSession(String sessionId) {
        return sessionId != null && sessions.containsKey(sessionId);
    }

    // ── Main entry point ──────────────────────────────────────────────────────
    public String handle(String userMessage, String sessionId) {
        String lowerMsg = userMessage.toLowerCase();

        // ── 0. Handle cancellation / reschedule keywords ──────────────────────
        if (lowerMsg.contains("cancel appointment") && lowerMsg.matches(".*\\d+.*")) {
            return handleCancelByText(userMessage);
        }
        if (lowerMsg.contains("my appointments") || lowerMsg.contains("show my appointments")
                || lowerMsg.contains("list appointments")) {
            return handleListAppointments(sessionId);
        }

        // ── 1. Session-based multi-step booking ──────────────────────────────
        if (sessionId != null && !sessionId.isBlank()) {
            BookingSession session = sessions.computeIfAbsent(sessionId, k -> new BookingSession());
            String stepResult = processStep(session, userMessage, sessionId);
            if (stepResult != null) return stepResult;
        }

        // ── 2. Try instant auto-create (if message has all details in one shot) ─
        Appointment created = tryAutoCreate(userMessage, sessionId);

        // ── 3. Build rich context for Gemini ─────────────────────────────────
        List<Doctor> availableDoctors = doctorRepo.findByIsAvailableTrue();
        long totalAppointments = appointmentRepo.count();
        List<Appointment> recentAppointments = appointmentRepo.findAll().stream()
                .sorted((a, b) -> b.getAppointmentId().compareTo(a.getAppointmentId()))
                .limit(5)
                .collect(Collectors.toList());

        String doctorList = availableDoctors.isEmpty()
                ? "No doctors listed yet."
                : availableDoctors.stream()
                        .map(d -> "  • Dr. " + d.getName()
                                + " | " + d.getSpecialty()
                                + " | " + (d.getAvailableDays() != null ? d.getAvailableDays() : "Mon–Fri")
                                + " | Fee: Rs. " + (d.getConsultationFee() != null ? d.getConsultationFee() : "300"))
                        .collect(Collectors.joining("\n"));

        String recentList = recentAppointments.isEmpty()
                ? "No appointments yet."
                : recentAppointments.stream()
                        .map(a -> "  #" + a.getAppointmentId()
                                + " — " + a.getPatientName()
                                + " with Dr. " + a.getDoctorName()
                                + " on " + a.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"))
                                + " [" + a.getStatus() + "]")
                        .collect(Collectors.joining("\n"));

        String appointmentContext = created != null
                ? "\n\n✅ APPOINTMENT SUCCESSFULLY CREATED:\n"
                        + "  ID      : #" + created.getAppointmentId() + "\n"
                        + "  Patient : " + created.getPatientName() + "\n"
                        + "  Doctor  : Dr. " + created.getDoctorName() + " (" + created.getSpecialty() + ")\n"
                        + "  Date    : " + created.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")) + "\n"
                        + "  Status  : " + created.getStatus()
                : "";

        String systemPrompt = """
                You are Alex, the Appointment Agent for Medicare Smart Clinic.
                Today's date: %s

                Your responsibilities:
                1. Help patients book appointments by collecting: patient name, symptoms/reason, preferred date & time.
                2. Suggest the best-matched doctor based on described symptoms (use the specialty list below).
                3. Confirm the booking once you have all 3 pieces of information, and quote the Appointment ID.
                4. Help patients check, reschedule, or cancel existing appointments if they provide the Appointment ID.
                5. If the patient gives partial info, ask specifically for what's missing — one question at a time.

                ── Available Doctors (%d available) ──────────────────────────────
                %s

                ── Recent Appointments (latest 5) ────────────────────────────────
                %s

                ── Total appointments in system: %d ───────────────────────────────
                %s

                ── Specialty → Symptom Mapping (use to suggest doctors) ─────────
                  Cardiology       → chest pain, palpitations, heart, blood pressure
                  Dermatology      → skin rash, acne, eczema, psoriasis
                  Orthopedics      → bone, joint pain, knee, back pain, fracture
                  Ophthalmology    → eye, vision, sight, glasses
                  Pediatrics       → child, baby, infant, kids
                  Psychiatry       → mental health, anxiety, depression, stress, sleep
                  Dentistry        → tooth, teeth, gum, cavity, dental
                  Gynecology       → women's health, pregnancy, menstrual
                  Urology          → urine, kidney, bladder, prostate
                  General Medicine → fever, cold, flu, fatigue, general check-up

                ── Booking Rules ─────────────────────────────────────────────────
                - Always be warm, professional, and reassuring.
                - If the user says "book", "schedule", "appointment", "see a doctor" — start booking flow.
                - Collect missing info step by step: Name → Symptoms → Date.
                - NEVER reveal medicine stock, inventory, or pharmacy data.
                - If no doctor matches the specialty, suggest the best general medicine doctor.
                - Quote Appointment IDs clearly so patients can reference them.
                - Clinic hours for scheduling: Mon–Sat, 8 AM – 5 PM (last slot).
                - Format date confirmations clearly: "Wednesday, 26 March 2026 at 9:00 AM".
                """.formatted(
                        LocalDate.now(),
                        availableDoctors.size(),
                        doctorList,
                        recentList,
                        totalAppointments,
                        appointmentContext);

        return gemini.chat(systemPrompt, userMessage);
    }

    // ── Session-based step processor ─────────────────────────────────────────
    private String processStep(BookingSession session, String message, String sessionId) {
        String lower = message.toLowerCase();

        // Detect booking start
        boolean bookingStart = lower.contains("book") || lower.contains("schedule")
                || lower.contains("appointment") || lower.contains("see a doctor");

        if (session.step == 0 && !bookingStart) return null; // Not in a booking flow

        // Step 1: Try to get name
        if (session.step <= 1 && session.patientName == null) {
            String name = extractPatientName(message);
            if (name != null) {
                session.patientName = name;
                session.step = 1;
            }
        }

        // Step 2: Try to get symptoms
        if (session.step <= 2 && session.symptoms == null && session.patientName != null) {
            if (lower.contains("symptom") || lower.contains("pain") || lower.contains("suffering")
                    || lower.contains("feeling") || lower.contains("have")
                    || lower.contains("cough") || lower.contains("fever")) {
                session.symptoms = message;
                session.specialty = inferSpecialty(lower);
                session.step = 2;
            }
        }

        // Step 3: Try to get date
        if (session.step <= 3 && session.preferredDate == null && session.symptoms != null) {
            session.preferredDate = extractDate(message);
            if (session.preferredDate != null) session.step = 3;
        }

        // All data collected — auto create
        if (session.step == 3 && session.patientName != null
                && session.symptoms != null && session.preferredDate != null) {
            Doctor doctor = pickDoctor(session.specialty);
            if (doctor != null) {
                Appointment appt = new Appointment();
                appt.setPatientName(session.patientName);
                appt.setPatientId(session.patientId);
                appt.setDoctorName(doctor.getName());
                appt.setSpecialty(doctor.getSpecialty());
                appt.setAppointmentDate(session.preferredDate);
                appt.setSymptoms(session.symptoms);
                appt.setStatus("Scheduled");
                Appointment saved = appointmentRepo.save(appt);
                sessions.remove(sessionId); // Clear session
                return "✅ **Appointment Booked Successfully!**\n\n"
                        + "📋 **ID:** #" + saved.getAppointmentId() + "\n"
                        + "👤 **Patient:** " + saved.getPatientName() + "\n"
                        + "👨‍⚕️ **Doctor:** Dr. " + saved.getDoctorName() + " (" + saved.getSpecialty() + ")\n"
                        + "📅 **Date:** " + saved.getAppointmentDate().format(DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy 'at' hh:mm a")) + "\n"
                        + "📌 **Status:** " + saved.getStatus() + "\n\n"
                        + "Please arrive 10 minutes early and bring any previous medical records. Is there anything else I can help you with?";
            }
        }

        return null; // Let Gemini handle it
    }

    // ── Auto-create from single message ──────────────────────────────────────
    private Appointment tryAutoCreate(String message, String sessionId) {
        String lowerMsg = message.toLowerCase();

        boolean hasBookingIntent = lowerMsg.contains("book") || lowerMsg.contains("schedule")
                || lowerMsg.contains("reserve") || lowerMsg.contains("set an appointment");
        if (!hasBookingIntent) return null;

        String patientName = extractPatientName(message);
        if (patientName == null) return null;

        LocalDateTime date = extractDate(message);
        if (date == null) return null;

        String specialty = inferSpecialty(lowerMsg);
        Doctor doctor = pickDoctor(specialty);
        if (doctor == null) return null;

        Appointment appt = new Appointment();
        appt.setPatientName(patientName);
        appt.setDoctorName(doctor.getName());
        appt.setSpecialty(doctor.getSpecialty());
        appt.setAppointmentDate(date);
        appt.setSymptoms(message);
        appt.setStatus("Scheduled");
        return appointmentRepo.save(appt);
    }

    // ── Cancel by appointment ID extracted from text ──────────────────────────
    private String handleCancelByText(String message) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(message);
        if (m.find()) {
            long id = Long.parseLong(m.group(1));
            return appointmentRepo.findById(id).map(appt -> {
                appt.setStatus("Cancelled");
                appointmentRepo.save(appt);
                return "✅ Appointment #" + id + " for **" + appt.getPatientName()
                        + "** has been cancelled. Would you like to book a new one?";
            }).orElse("❌ I couldn't find Appointment #" + id
                    + ". Please double-check the ID. You can ask me to list your appointments.");
        }
        return "Please provide the Appointment ID number you'd like to cancel (e.g., \"cancel appointment #42\").";
    }

    // ── List appointments for session patient ─────────────────────────────────
    private String handleListAppointments(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            return "To list your appointments, please log in to the patient portal at http://localhost:5173 "
                    + "or provide your Patient ID.";
        }
        List<Appointment> list = appointmentRepo.findByPatientId(patientId);
        if (list.isEmpty()) {
            return "You have no appointments on record. Would you like to book one now?";
        }
        StringBuilder sb = new StringBuilder("📅 **Your Appointments:**\n\n");
        list.forEach(a -> sb.append("• #").append(a.getAppointmentId())
                .append(" — Dr. ").append(a.getDoctorName())
                .append(" on ").append(a.getAppointmentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")))
                .append(" [").append(a.getStatus()).append("]\n"));
        return sb.append("\nWould you like to reschedule or cancel any of these?").toString();
    }

    // ── Utility: extract patient name ─────────────────────────────────────────
    private String extractPatientName(String message) {
        String lowerMsg = message.toLowerCase();
        String[] patterns = {"my name is ", "i am ", "i'm ", "name: ", "patient: ", "this is ", "for "};
        for (String pattern : patterns) {
            int idx = lowerMsg.indexOf(pattern);
            if (idx != -1) {
                String remaining = message.substring(idx + pattern.length()).trim();
                String[] words = remaining.split("\\s+");
                if (words.length >= 1) {
                    return words.length >= 2 ? words[0] + " " + words[1] : words[0];
                }
            }
        }
        return null;
    }

    // ── Utility: extract date / time ─────────────────────────────────────────
    private LocalDateTime extractDate(String message) {
        String lowerMsg = message.toLowerCase();

        if (lowerMsg.contains("tomorrow"))
            return LocalDate.now().plusDays(1).atTime(9, 0);
        if (lowerMsg.contains("today"))
            return LocalDateTime.now().plusHours(1).withMinute(0).withSecond(0);
        if (lowerMsg.contains("next week"))
            return LocalDate.now().plusWeeks(1).atTime(9, 0);
        if (lowerMsg.contains("next monday"))
            return nextDayOfWeek(java.time.DayOfWeek.MONDAY);
        if (lowerMsg.contains("next tuesday"))
            return nextDayOfWeek(java.time.DayOfWeek.TUESDAY);
        if (lowerMsg.contains("next wednesday"))
            return nextDayOfWeek(java.time.DayOfWeek.WEDNESDAY);
        if (lowerMsg.contains("next thursday"))
            return nextDayOfWeek(java.time.DayOfWeek.THURSDAY);
        if (lowerMsg.contains("next friday"))
            return nextDayOfWeek(java.time.DayOfWeek.FRIDAY);

        // Match "March 28" / "28 March" / "28th March"
        String[] months = {"january","february","march","april","may","june",
                "july","august","september","october","november","december"};
        for (int i = 0; i < months.length; i++) {
            if (lowerMsg.contains(months[i])) {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d{1,2})").matcher(message);
                if (m.find()) {
                    int day = Integer.parseInt(m.group(1));
                    int year = LocalDate.now().getYear();
                    try {
                        LocalDate date = LocalDate.of(year, i + 1, day);
                        if (date.isBefore(LocalDate.now())) date = date.plusYears(1);
                        return date.atTime(9, 0);
                    } catch (Exception ignored) {}
                }
            }
        }

        // Match numeric date "2026-03-28" or "28/03/2026"
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d{4}-\\d{2}-\\d{2})").matcher(message);
        if (m.find()) {
            try {
                return LocalDate.parse(m.group(1)).atTime(9, 0);
            } catch (Exception ignored) {}
        }
        m = java.util.regex.Pattern.compile("(\\d{2}/\\d{2}/\\d{4})").matcher(message);
        if (m.find()) {
            try {
                return LocalDate.parse(m.group(1), DateTimeFormatter.ofPattern("dd/MM/yyyy")).atTime(9, 0);
            } catch (Exception ignored) {}
        }
        return null;
    }

    private LocalDateTime nextDayOfWeek(java.time.DayOfWeek dayOfWeek) {
        LocalDate today = LocalDate.now();
        return today.with(java.time.temporal.TemporalAdjusters.next(dayOfWeek)).atTime(9, 0);
    }

    // ── Utility: infer specialty from symptoms ────────────────────────────────
    private String inferSpecialty(String msg) {
        if (msg.contains("heart") || msg.contains("chest pain") || msg.contains("cardiac")
                || msg.contains("blood pressure") || msg.contains("palpitation"))
            return "Cardiology";
        if (msg.contains("skin") || msg.contains("rash") || msg.contains("acne")
                || msg.contains("eczema") || msg.contains("psoriasis"))
            return "Dermatology";
        if (msg.contains("bone") || msg.contains("joint") || msg.contains("knee")
                || msg.contains("back pain") || msg.contains("fracture") || msg.contains("spine"))
            return "Orthopedics";
        if (msg.contains("eye") || msg.contains("vision") || msg.contains("sight") || msg.contains("glasses"))
            return "Ophthalmology";
        if (msg.contains("child") || msg.contains("baby") || msg.contains("infant")
                || msg.contains("pediatric") || msg.contains("kids"))
            return "Pediatrics";
        if (msg.contains("mental") || msg.contains("anxiety") || msg.contains("depression")
                || msg.contains("stress") || msg.contains("sleep") || msg.contains("phobia"))
            return "Psychiatry";
        if (msg.contains("tooth") || msg.contains("teeth") || msg.contains("dental")
                || msg.contains("gum") || msg.contains("cavity"))
            return "Dentistry";
        if (msg.contains("women") || msg.contains("gynec") || msg.contains("pregnancy")
                || msg.contains("menstrual") || msg.contains("period"))
            return "Gynecology";
        if (msg.contains("urine") || msg.contains("kidney") || msg.contains("bladder")
                || msg.contains("prostate"))
            return "Urology";
        return "General Medicine";
    }

    // ── Utility: pick best matching doctor ────────────────────────────────────
    private Doctor pickDoctor(String specialty) {
        List<Doctor> specialists = doctorRepo.findBySpecialtyContainingIgnoreCase(specialty);
        if (!specialists.isEmpty()) return specialists.get(0);
        List<Doctor> allAvailable = doctorRepo.findByIsAvailableTrue();
        return allAvailable.isEmpty() ? null : allAvailable.get(0);
    }
}