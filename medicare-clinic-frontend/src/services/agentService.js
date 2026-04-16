const API_BASE = "http://localhost:8080/api/agent";

export const sendMessage = async (message, role = "patient") => {
    const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, role })
    });
    return await response.json();
};