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
        <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '80vh', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(45deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>✨ Smart Clinic Assistant</h2>
                    <p style={{ color: 'var(--text-light)', margin: 0, marginTop: '0.2rem', fontSize: '0.9rem' }}>AI-powered support for your clinic</p>
                </div>
                
                <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.role}`} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {m.role === "agent" && (
                                <span className="badge badge-primary" style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }}>{m.agent}</span>
                            )}
                            <div className="glass-panel" style={{ 
                                padding: '1rem', 
                                background: m.role === 'user' ? 'var(--gradient-blue)' : 'rgba(255,255,255,0.05)',
                                color: m.role === 'user' ? 'white' : 'var(--text-main)',
                                border: m.role === 'user' ? 'none' : '1px solid var(--surface-border)',
                                borderTopRightRadius: m.role === 'user' ? '0' : 'var(--radius-lg)',
                                borderTopLeftRadius: m.role === 'agent' ? '0' : 'var(--radius-lg)',
                                maxWidth: '85%'
                            }}>
                                <p style={{ margin: 0, lineHeight: '1.5' }}>{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message agent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Smart Clinic AI</span>
                            <div className="glass-panel animate-pulse" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderTopLeftRadius: '0' }}>
                                <p style={{ margin: 0 }}>⏳ Agent is thinking... (may take a few seconds)</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area" style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '1rem' }}>
                    <input
                        className="form-input"
                        style={{ flex: 1 }}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="Ask about appointments, medicines, doctors..."
                    />
                    <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
}