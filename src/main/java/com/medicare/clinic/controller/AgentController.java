package com.medicare.clinic.controller;

import com.medicare.clinic.orchestrator.AgentOrchestrator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AgentController — REST endpoint for the AI chat system.
 *
 * POST /api/agent/chat
 * Body: { "message": "...", "sessionId": "...", "patientId": "...", "role": "patient|pharmacist|admin" }
 *
 * Response: { "response": "...", "agent": "...", "sessionId": "..." }
 *
 * Security note: /api/agent/** is publicly accessible (permitAll in SecurityConfig).
 * Role enforcement is handled INSIDE the AgentOrchestrator using keyword-based routing.
 * When a valid JWT is present, the role is extracted from it (trusted source).
 * When no JWT is present, the role from the request body is used (guest / public AI chat).
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

        // Optional context fields from frontend
        String sessionId = body.getOrDefault("sessionId", null);
        String patientId = body.getOrDefault("patientId", null);
        String requestRole = body.getOrDefault("role", "patient");

        // ── Role resolution: JWT (trusted) → request body (untrusted fallback) ──
        // If the user is authenticated via JWT, use the role from the token.
        // This prevents clients from spoofing a higher role (e.g. sending role=ADMIN).
        String roleUpper = resolveRoleFromContext(requestRole);

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
     * Extracts the role from the JWT SecurityContext if available.
     * Falls back to the role provided in the request body for unauthenticated (public) usage.
     *
     * JWT authorities are stored as "ROLE_PATIENT", "ROLE_ADMIN", etc. (set by CustomUserDetailsService).
     */
    private String resolveRoleFromContext(String requestBodyRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities() != null
                && !authentication.getAuthorities().isEmpty()) {
            // Extract first authority, strip "ROLE_" prefix → "PATIENT", "ADMIN", etc.
            String jwtRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.replace("ROLE_", ""))
                    .findFirst()
                    .orElse(null);
            if (jwtRole != null) {
                return jwtRole; // trusted — from verified JWT
            }
        }
        // No JWT present (public/guest access) — use request body role
        return requestBodyRole != null ? requestBodyRole.toUpperCase() : "PATIENT";
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