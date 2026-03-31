package com.medicare.clinic.agent;

import com.medicare.clinic.config.GeminiService;
import com.medicare.clinic.model.Doctor;
import com.medicare.clinic.repository.AppointmentRepository;
import com.medicare.clinic.repository.DoctorRepository;
import com.medicare.clinic.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Patient Support Agent — handles greetings, clinic info, doctor suggestions,
 * and general patient guidance based on live DB data.
 */
@Service
public class PatientSupportAgent {

    private final GeminiService gemini;
    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepo;
    private final PrescriptionRepository prescriptionRepo;

    public PatientSupportAgent(GeminiService gemini,
                               DoctorRepository doctorRepo,
                               AppointmentRepository appointmentRepo,
                               PrescriptionRepository prescriptionRepo) {
        this.gemini = gemini;
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
        this.prescriptionRepo = prescriptionRepo;
    }

    public String handle(String userMessage) {
        return handle(userMessage, null);
    }

    public String handle(String userMessage, String patientId) {
        // ── Fetch live data from DB ────────────────────────────────────────────
        List<Doctor> availableDoctors = doctorRepo.findByIsAvailableTrue();
        long totalDoctors = doctorRepo.count();
        long totalAppointments = appointmentRepo.count();

        // Build doctor catalogue
        String doctorCatalogue = availableDoctors.isEmpty()
                ? "No doctors currently listed."
                : availableDoctors.stream()
                        .map(d -> "  • Dr. " + d.getName()
                                + " | Specialty: " + d.getSpecialty()
                                + " | Days: " + (d.getAvailableDays() != null ? d.getAvailableDays() : "Mon–Fri")
                                + " | Fee: Rs. " + (d.getConsultationFee() != null ? d.getConsultationFee() : "300"))
                        .collect(Collectors.joining("\n"));

        // Patient-specific context (if logged in)
        String patientContext = "";
        if (patientId != null && !patientId.isBlank()) {
            long myAppointments = appointmentRepo.findByPatientId(patientId).size();
            long myPrescriptions = prescriptionRepo.findByPatientId(patientId).size();
            patientContext = """

                Patient Context (current user):
                - Appointment history: %d appointments on record
                - Prescriptions issued: %d prescriptions
                """.formatted(myAppointments, myPrescriptions);
        }

        String systemPrompt = """
                You are Maya, the Patient Support Agent for Medicare Smart Clinic.
                Today's date: %s

                Your responsibilities:
                1. Welcome patients warmly and answer general clinic questions.
                2. Help patients understand which specialist they need based on symptoms.
                3. Explain how to book an appointment (via chat or the portal).
                4. Inform patients about clinic hours, location, emergency contacts.
                5. Guide patients on what to bring for their first visit.
                6. If the patient describes an EMERGENCY (chest pain, difficulty breathing, severe bleeding,
                   unconsciousness, stroke signs), IMMEDIATELY advise them to call emergency services (119)
                   or go to the nearest ER — do NOT delay with chatting.

                ── Clinic Information ────────────────────────────────────────────
                Name    : Medicare Smart Clinic
                Hours   : Monday – Saturday, 8:00 AM – 6:00 PM
                Emergency: 24 / 7 (Emergency Room always open)
                Location : Medicare Clinic, Main Street, Colombo 07
                Phone    : +94 11 234 5678
                Email    : info@medicare-clinic.lk
                Portal   : http://localhost:5173

                ── Available Doctors (%d doctors, %d total) ──────────────────────
                %s
                %s
                ── Appointment Stats ─────────────────────────────────────────────
                Total appointments managed by clinic: %d

                ── Interaction Rules ─────────────────────────────────────────────
                - Be empathetic, warm, and concise. Use bullet points or numbered lists where helpful.
                - NEVER reveal medicine stock, inventory data, or pricing unless the patient asks about a
                  specific medicine's general availability (not stock counts).
                - If the patient insists on booking, collect: Name, Symptoms, Preferred date — then
                  tell them to type "book appointment" so the Appointment Agent takes over.
                - Do NOT give specific dosage advice — always recommend seeing a doctor.
                - If you sense severe urgency, add a red-flag ⚠️ warning.
                - End responses with a helpful follow-up question or offer when appropriate.
                """.formatted(
                        LocalDate.now(),
                        availableDoctors.size(), totalDoctors,
                        doctorCatalogue,
                        patientContext,
                        totalAppointments);

        return gemini.chat(systemPrompt, userMessage);
    }
}