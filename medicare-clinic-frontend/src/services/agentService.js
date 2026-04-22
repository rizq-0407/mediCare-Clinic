const API_BASE = "http://localhost:8080/api/agent";

/**
 * Send a message to the AI agent backend.
 * @param {string} message - The user's message
 * @param {string} role    - "patient" | "pharmacist" | "admin" | "doctor"
 * @param {string} [sessionId] - Optional session ID for multi-turn appointment booking
 * @param {string} [patientId] - Optional patient user ID for personal context
 */
export const sendMessage = async (message, role = "patient", sessionId = null, patientId = null) => {
    const body = { message, role };
    if (sessionId) body.sessionId = sessionId;
    if (patientId) body.patientId = patientId;

    const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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