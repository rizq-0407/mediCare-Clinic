import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendMessage } from "../services/agentService";
import "./AgentChat.css";

// ── Simple markdown→HTML converter (bold, bullets, line breaks) ──────────────
function renderMarkdown(text) {
    if (!text) return "";
    return text
        // Bold  **text** or *text*
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+?)\*/g, "<em>$1</em>")
        // Bullet lines starting with "• " or "- " or "* "
        .replace(/^[•\-\*] (.+)$/gm, "<li>$1</li>")
        // Headings ## or ###
        .replace(/^### (.+)$/gm, "<h4>$1</h4>")
        .replace(/^## (.+)$/gm, "<h3>$1</h3>")
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
        // New lines → <br>
        .replace(/\n/g, "<br/>");
}

// Map role → agent icon & label
const ROLE_META = {
    patient:    { icon: "🧑‍⚕️", label: "Patient AI Chat",     color: "#3b82f6" },
    pharmacist: { icon: "💊",   label: "Pharmacy AI Agent",   color: "#8b5cf6" },
    admin:      { icon: "🛡️",  label: "Admin AI Assistant",  color: "#f59e0b" },
    doctor:     { icon: "🩺",   label: "Doctor AI Support",   color: "#10b981" },
    staff:      { icon: "📋",   label: "Staff AI Support",    color: "#ec4899" },
};

// Suggested quick-prompts per role
const QUICK_PROMPTS = {
    patient: [
        "Book an appointment",
        "What are clinic hours?",
        "I have a headache, what should I do?",
        "Show my prescriptions",
    ],
    pharmacist: [
        "Show low stock medicines",
        "Any medicines expiring soon?",
        "How many prescriptions are pending?",
        "Suggest reorder quantities",
    ],
    admin: [
        "Show inventory summary",
        "Low stock alerts",
        "Pending prescriptions count",
        "Book appointment for patient",
    ],
    doctor: [
        "What is paracetamol used for?",
        "Symptoms of diabetes",
        "Book appointment for patient",
        "Side effects of ibuprofen",
    ],
    staff: [
        "What are clinic hours?",
        "Book appointment for patient",
        "What is hypertension?",
        "Symptoms of flu",
    ],
};

export default function AgentChat() {
    const location = useLocation();
    const navigate = useNavigate();

    // Role comes from navigation state; fall back to localStorage or "patient"
    const role =
        location.state?.role ||
        localStorage.getItem("role")?.toLowerCase() ||
        "patient";

    // Patient ID for personalised context (set by Login.jsx)
    const patientId =
        location.state?.patientId ||
        localStorage.getItem("userId") ||
        null;

    // Session ID — stable across this chat session for appointment multi-step flow
    const [sessionId] = useState(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    const meta = ROLE_META[role] || ROLE_META.patient;
    const quickPrompts = QUICK_PROMPTS[role] || QUICK_PROMPTS.patient;

    const [messages, setMessages] = useState([
        {
            role: "agent",
            text: `Hello! I'm the **Medicare Smart Clinic AI**. ${meta.icon}\n\nI can help you with appointments, health questions, prescriptions, and more.\n\nHow can I assist you today?`,
            agent: "Smart Clinic AI",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [agentStatus, setAgentStatus] = useState("online");
    const [cooldown, setCooldown] = useState(0); // seconds remaining before next send allowed
    const cooldownRef = useRef(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async (text) => {
        const msg = (text || input).trim();
        if (!msg || loading || cooldown > 0) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: msg }]);
        setLoading(true);

        try {
            const data = await sendMessage(msg, role, sessionId, patientId);

            if (!data || !data.response) {
                throw new Error("Empty response from server");
            }

            const isRateLimit = data.response.includes("rate limit") ||
                                data.response.includes("429") ||
                                data.response.includes("AI is temporarily busy");

            setMessages((prev) => [
                ...prev,
                {
                    role: "agent",
                    text: data.response,
                    agent: data.agent || "Smart Clinic AI",
                    sessionId: data.sessionId,
                },
            ]);

            setAgentStatus(isRateLimit ? "error" : "online");

            // Start a cooldown after every send to prevent rapid-fire
            startCooldown(isRateLimit ? 30 : 2);

        } catch (err) {
            console.error("Agent error:", err);
            setAgentStatus("error");
            setMessages((prev) => [
                ...prev,
                {
                    role: "agent",
                    text: "⚠️ **Connection error.** Make sure the backend is running on port 8080 and your Gemini API key is valid.\n\nError: " + err.message,
                    agent: "System",
                },
            ]);
            startCooldown(5);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const startCooldown = (seconds) => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        setCooldown(seconds);
        cooldownRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Cleanup timer on unmount
    useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

    // Back navigation — return to the right dashboard
    const handleBack = () => {
        if (role === "pharmacist") navigate("/pharmacy");
        else if (role === "admin") navigate("/admin");
        else if (role === "doctor") navigate("/doctor");
        else if (role === "staff") navigate("/staff");
        else navigate("/patient-dashboard");
    };

    return (
        <div className="chat-page-wrapper">
            {/* Dynamic Animated Background Elements */}
            <div className="chat-bg-decor chat-bg-1"></div>
            <div className="chat-bg-decor chat-bg-2"></div>
            <div className="chat-bg-decor chat-bg-3"></div>

            <div className="chat-container">
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="chat-header">
                    <button
                        className="back-btn"
                        onClick={handleBack}
                        title="Go back to dashboard"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}
                    >
                        <span>←</span> Back to Dashboard
                    </button>

                    <div className="header-avatar" style={{ background: meta.color + "33", borderColor: meta.color }}>
                        <span style={{ fontSize: "1.5rem" }}>{meta.icon}</span>
                    </div>

                    <div className="header-info">
                        <h2>{meta.label}</h2>
                        <p>
                            <span
                                className={`status-dot ${agentStatus === "online" ? "dot-green" : "dot-red"}`}
                            />
                            {agentStatus === "online" ? "AI System Online" : "Connection Error"}
                            &nbsp;·&nbsp;Role: <strong style={{ textTransform: "capitalize" }}>{role}</strong>
                        </p>
                    </div>
                </div>

                {/* ── Quick Prompts (shown only when no messages sent yet) ──── */}
                {messages.length === 1 && (
                    <div className="quick-prompts">
                        <p className="quick-label">Quick prompts:</p>
                        <div className="quick-chips">
                            {quickPrompts.map((q, i) => (
                                <button
                                    key={i}
                                    className="quick-chip"
                                    onClick={() => handleSend(q)}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Messages ────────────────────────────────────────────────── */}
                <div className="messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.role}`}>
                            {m.role === "agent" && (
                                <span className="agent-badge">{m.agent}</span>
                            )}
                            <div className="message-content">
                                {m.role === "agent" ? (
                                    <p
                                        style={{ margin: 0, lineHeight: "1.65" }}
                                        dangerouslySetInnerHTML={{
                                            __html: renderMarkdown(m.text),
                                        }}
                                    />
                                ) : (
                                    <p style={{ margin: 0, lineHeight: "1.65" }}>{m.text}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Animated typing indicator */}
                    {loading && (
                        <div className="message agent">
                            <span className="agent-badge">Smart Clinic AI</span>
                            <div className="typing-indicator">
                                <div className="dot" />
                                <div className="dot" />
                                <div className="dot" />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input Bar ───────────────────────────────────────────────── */}
                <div className="input-area">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder={
                            cooldown > 0
                                ? `Please wait ${cooldown}s before sending...`
                                : role === "pharmacist"
                                ? "Ask about inventory, stock levels, expiry..."
                                : role === "doctor"
                                ? "Ask about symptoms, treatments, medical knowledge..."
                                : "Ask about appointments, medicines, clinic info..."
                        }
                        disabled={loading || cooldown > 0}
                        id="chat-input"
                    />
                    <button
                        className="send-btn"
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim() || cooldown > 0}
                        id="send-btn"
                    >
                        {loading ? "⏳" : cooldown > 0 ? `${cooldown}s` : "Send ➤"}
                    </button>
                </div>
            </div>
        </div>
    );
}