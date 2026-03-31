import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendMessage } from "../services/agentService";
import "./AgentChat.css";

export default function AgentChat() {
    const location = useLocation();
    const role = location.state?.role || "patient";

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const data = await sendMessage(input, role);
            setMessages(prev => [...prev, {
                role: "agent",
                text: data.response || "Server didn't return a text response.",
                agent: data.agent || "System Error"
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "agent",
                text: "⚠️ Connection error. Make sure the backend is running & your API key is valid.",
                agent: "System"
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>✨ Smart Clinic Assistant</h2>
            </div>
            <div className="messages">
                {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role}`}>
                        {m.role === "agent" && (
                            <span className="agent-badge">{m.agent}</span>
                        )}
                        <div className="message-content">
                            <p style={{ margin: 0 }}>{m.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message agent">
                        <span className="agent-badge">Smart Clinic AI</span>
                        <p>⏳ Agent is thinking... (may take a few seconds)</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Ask about appointments, medicines, doctors..."
                />
                <button className="send-btn" onClick={handleSend}>Send</button>
            </div>
        </div>

    );
}