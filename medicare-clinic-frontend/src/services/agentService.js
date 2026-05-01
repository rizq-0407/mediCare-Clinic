const API_BASE = "http://localhost:8080/api/agent";

/**
 * Send a message to the AI agent backend.
 * @param {string} message   - The user's message
 * @param {string} role      - "patient" | "pharmacist" | "admin" | "doctor" | "staff"
 * @param {string} [sessionId]  - Session ID for multi-turn appointment booking
 * @param {string} [patientId]  - Patient user ID for personalised context (e.g. PAT001)
 *
 * Security note:
 *  - When a user is logged in, the JWT token is attached as "Authorization: Bearer ..."
 *  - The backend (AgentController) reads the role from the JWT SecurityContext (trusted)
 *    and ignores the request body "role" field, preventing role spoofing.
 *  - When no token is present (unauthenticated/public AI chat), the request body role is used.
 */
export const sendMessage = async (message, role = "patient", sessionId = null, patientId = null) => {
    const body = { message, role };
    if (sessionId) body.sessionId = sessionId;
    if (patientId) body.patientId = patientId;

    // Attach JWT token if the user is logged in
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
    }

    return await response.json();
};

/**
 * Health-check: confirms the AI backend is online.
 */
export const checkAgentStatus = async () => {
    const response = await fetch(`${API_BASE}/status`);
    return await response.json();
};