package com.medicare.clinic.agent;

import com.medicare.clinic.config.GeminiService;
import com.medicare.clinic.model.Appointment;
import com.medicare.clinic.model.Schedule;
import com.medicare.clinic.repository.AppointmentRepository;
import com.medicare.clinic.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Appointment Agent — handles full appointment booking flow using Gemini:
 * - Locks session to ensure context is kept
 * - Suggests actual available schedules (Doctor, Date, Time)
 * - Books appointment with status "Pending" for staff confirmation
 */
@Service
public class AppointmentAgent {

    private final GeminiService gemini;
    private final AppointmentRepository appointmentRepo;
    private final ScheduleRepository scheduleRepo;

    // Track active booking sessions to lock routing
    private final Map<String, Boolean> activeSessions = new ConcurrentHashMap<>();
    
    // Track conversation history for sessions
    private final Map<String, java.util.List<String>> sessionHistory = new ConcurrentHashMap<>();

    public AppointmentAgent(GeminiService gemini,
                            AppointmentRepository appointmentRepo,
                            ScheduleRepository scheduleRepo) {
        this.gemini = gemini;
        this.appointmentRepo = appointmentRepo;
        this.scheduleRepo = scheduleRepo;
    }

    public String handle(String userMessage) {
        return handle(userMessage, null);
    }

    public boolean hasActiveSession(String sessionId) {
        return sessionId != null && activeSessions.containsKey(sessionId);
    }

    public String handle(String userMessage, String sessionId) {
        String lowerMsg = userMessage.toLowerCase();

        // ── 0. Handle cancellation / reschedule keywords ──────────────────────
        if (lowerMsg.contains("cancel appointment") && lowerMsg.matches(".*\\d+.*")) {
            activeSessions.remove(sessionId);
            sessionHistory.remove(sessionId);
            return handleCancelByText(userMessage);
        }
        if (lowerMsg.contains("my appointments") || lowerMsg.contains("show my appointments")
                || lowerMsg.contains("list appointments")) {
            activeSessions.remove(sessionId);
            sessionHistory.remove(sessionId);
            return handleListAppointments(sessionId);
        }

        // Lock session if booking intent detected
        boolean bookingIntent = lowerMsg.contains("book") || lowerMsg.contains("schedule")
                || lowerMsg.contains("appointment") || lowerMsg.contains("see a doctor");
        
        if (bookingIntent && sessionId != null) {
            activeSessions.put(sessionId, true);
        }

        // Allow user to break out of booking flow
        if (hasActiveSession(sessionId) && (lowerMsg.equals("stop") || lowerMsg.equals("cancel booking") || lowerMsg.equals("nevermind"))) {
            activeSessions.remove(sessionId);
            sessionHistory.remove(sessionId);
            return "Booking process cancelled. Is there anything else I can help you with?";
        }

        // ── Fetch available schedules ─────────────────────────────────────────
        List<Schedule> availableSchedules = scheduleRepo.findAll().stream()
                .filter(s -> s.getAvailableSlots() > 0)
                .collect(Collectors.toList());

        String scheduleList = availableSchedules.isEmpty()
                ? "No schedules available at the moment."
                : availableSchedules.stream()
                        .map(s -> String.format("  • [ID: %d] Dr. %s (%s) | Date: %s | Time: %s | Slots: %d", 
                                s.getId(), s.getDoctorName(), s.getSpecialization(), s.getDate(), s.getTime(), s.getAvailableSlots()))
                        .collect(Collectors.joining("\n"));

        // ── Retrieve History ──────────────────────────────────────────────────
        List<String> history = sessionHistory.getOrDefault(sessionId, new java.util.ArrayList<>());
        
        String historyText = "";
        if (!history.isEmpty()) {
            historyText = "\n\n── Previous Conversation ──\n" + String.join("\n", history);
        }

        // ── Build Gemini Prompt ───────────────────────────────────────────────
        String systemPrompt = """
                You are Alex, the Appointment Agent for Medicare Smart Clinic.
                Today's date: %s
                
                Your responsibilities:
                1. Help patients book appointments by collecting exactly three details: Patient Name, Symptoms, and a Schedule ID.
                2. If this is a new booking, ask for their Name and Symptoms first. Do not ask for things you already know from the Previous Conversation.
                3. Once you know their symptoms, SUGGEST available doctor schedules from the list below. Show them the Doctor Name, Specialization, Date, Time, and the Schedule ID.
                4. Ask the patient to choose a Schedule ID.
                5. ONCE YOU HAVE all 3 details (Name, Symptoms, Schedule ID), you MUST output exactly this command on a new line (and nothing else after it):
                BOOK_APPT_CMD|<PatientName>|<Symptoms>|<ScheduleID>
                
                Example of final output:
                Great, I'll book that for you right away.
                BOOK_APPT_CMD|John Doe|Headache and fever|5
                
                ── Available Schedules (ID is required for booking) ─────────────────
                %s
                
                ── Booking Rules ─────────────────────────────────────────────────
                - Always be warm, professional, and reassuring.
                - Only suggest schedules that are in the list. If none match the exact specialty, suggest a General doctor.
                - Inform the patient that their appointment will be initially "Pending" until a staff member confirms it.
                - Do not make up any schedule IDs.
                - DO NOT REPEAT QUESTIONS YOU ALREADY ASKED in the previous conversation.%s
                """.formatted(LocalDate.now(), scheduleList, historyText);

        String geminiResponse = gemini.chat(systemPrompt, userMessage);

        // Update history
        if (sessionId != null) {
            history.add("Patient: " + userMessage);
            history.add("Agent: " + geminiResponse);
            // Keep last 10 messages
            if (history.size() > 10) {
                history = history.subList(history.size() - 10, history.size());
            }
            sessionHistory.put(sessionId, history);
        }

        // ── Intercept Booking Command ─────────────────────────────────────────
        if (geminiResponse.contains("BOOK_APPT_CMD|")) {
            activeSessions.remove(sessionId);
            sessionHistory.remove(sessionId);
            return processBookingCommand(geminiResponse, sessionId);
        }

        return geminiResponse;
    }

    private String processBookingCommand(String geminiResponse, String sessionId) {
        try {
            String[] lines = geminiResponse.split("\n");
            StringBuilder cleanResponse = new StringBuilder();
            String commandLine = null;
            
            for (String line : lines) {
                if (line.trim().startsWith("BOOK_APPT_CMD|")) {
                    commandLine = line.trim();
                } else {
                    cleanResponse.append(line).append("\n");
                }
            }
            
            if (commandLine != null) {
                String[] parts = commandLine.split("\\|");
                if (parts.length >= 4) {
                    String patientName = parts[1].trim();
                    String symptoms = parts[2].trim();
                    Long scheduleId = Long.parseLong(parts[3].trim());
                    
                    Schedule schedule = scheduleRepo.findById(scheduleId).orElse(null);
                    if (schedule != null) {
                        Appointment appt = new Appointment();
                        appt.setPatientName(patientName);
                        // If patient is logged in, sessionId usually matches patientId. We can fallback to it.
                        appt.setPatientId(sessionId);
                        appt.setDoctorName(schedule.getDoctorName());
                        appt.setSpecialty(schedule.getSpecialization());
                        
                        try {
                            // Convert string date/time to LocalDateTime for DB (Format: yyyy-MM-dd / HH:mm)
                            String timeString = schedule.getTime();
                            if (timeString.length() == 5) timeString += ":00"; // Ensure HH:mm:ss
                            LocalDateTime dateTime = LocalDateTime.parse(schedule.getDate() + "T" + timeString);
                            appt.setAppointmentDate(dateTime);
                        } catch (Exception e) {
                            // Fallback if schedule date format is weird
                            appt.setAppointmentDate(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
                        }
                        
                        appt.setSymptoms(symptoms);
                        // User requirement: Initial status should be "Pending" for staff to confirm
                        appt.setStatus("Pending"); 
                        
                        Appointment saved = appointmentRepo.save(appt);
                        
                        return cleanResponse.toString().trim() + "\n\n✅ **Appointment Request Submitted Successfully!**\n\n"
                            + "📋 **ID:** #" + saved.getAppointmentId() + "\n"
                            + "👤 **Patient:** " + saved.getPatientName() + "\n"
                            + "👨‍⚕️ **Doctor:** Dr. " + saved.getDoctorName() + " (" + saved.getSpecialty() + ")\n"
                            + "📅 **Date:** " + saved.getAppointmentDate().format(DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy 'at' hh:mm a")) + "\n"
                            + "📌 **Status:** " + saved.getStatus() + "\n\n"
                            + "Your appointment is currently **Pending**. Our staff will review and confirm it shortly via the Staff Dashboard. Is there anything else I can help you with?";
                    } else {
                        return cleanResponse.toString().trim() + "\n\n❌ I'm sorry, but that schedule slot seems to be invalid or no longer available. Please choose another schedule ID.";
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing booking command: " + e.getMessage());
        }
        return geminiResponse;
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
        if (patientId == null || patientId.isBlank() || patientId.startsWith("sess-")) {
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
}