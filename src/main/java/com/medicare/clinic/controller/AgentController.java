package com.medicare.clinic.controller;

import com.medicare.clinic.orchestrator.AgentOrchestrator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AgentController — REST endpoint for the AI chat system.
 *
 * POST /api/agent/chat
 * Body: { "message": "...", "sessionId": "...", "patientId": "...", "role": "patient|pharmacist|admin" }
 *
 * Response: { "response": "...", "agent": "...", "sessionId": "..." }
 */
@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = "http://localhost:5173")
public class AgentController {

    private final AgentOrchestrator orchestrator;

    public AgentController(AgentOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {

        String userMessage = body.getOrDefault("message", "").trim();
        if (userMessage.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message cannot be empty."));
        }

        // Optional context fields
        String sessionId = body.getOrDefault("sessionId", null);
        String patientId = body.getOrDefault("patientId", null);
        String role = body.getOrDefault("role", "patient");

        // Normalise role check — frontend sends mixed case (PHARMACY, pharmacist, ADMIN, admin)
        String roleUpper = role != null ? role.toUpperCase() : "PATIENT";
        boolean isPharmacist = roleUpper.equals("PHARMACY") || roleUpper.equals("ADMIN") || roleUpper.equals("PHARMACIST");

        // Route to the correct agent
        String agentResponse = orchestrator.route(userMessage, sessionId, patientId, roleUpper);

        // Detect which agent handled it (for frontend badge display)
        String agentName = orchestrator.detectAgentName(userMessage, sessionId, roleUpper);

        return ResponseEntity.ok(Map.of(
                "response", agentResponse,
                "agent", agentName,
                "sessionId", sessionId != null ? sessionId : ""
        ));
    }

    /**
     * Health check endpoint — confirms AI system is running.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status() {
        return ResponseEntity.ok(Map.of(
                "status", "online",
                "agents", "PatientSupport, Appointment, MedicalKnowledge, Pharmacy",
                "version", "2.0"
        ));
    }
}