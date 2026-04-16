import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Pharmacy from "./pages/Pharmacy";
import Login from "./pages/Login";
import AgentChat from "./pages/AgentChat";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import MyTickets from "./pages/MyTickets";
import SubmitTicket from "./pages/SubmitTicket";
import PatientFeedback from "./pages/PatientFeedback";
import AdminTicketManagement from "./pages/AdminTicketManagement";
import AdminFeedbackManagement from "./pages/AdminFeedbackManagement";
import './index.css';

function App() {
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
    };

    return (
        <Router>
            <div className="bg-decor-container">
                <div className="float-orb" style={{ top: '-100px', right: '-100px' }}></div>
                <div className="float-orb" style={{ bottom: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(114, 9, 183, 0.05) 0%, transparent 70%)' }}></div>
                <div className="float-symbol" style={{ top: '10%', left: '-5%', opacity: 0.3 }}>☤</div>
                <div className="float-symbol" style={{ bottom: '0', right: '-10%', fontSize: '20rem', opacity: 0.1 }}>💊</div>
            </div>
            {user && <Navbar user={user} onLogout={handleLogout} />}
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/patient" element={<Navigate to="/patient-dashboard" replace />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/submit-ticket" element={<SubmitTicket />} />
                <Route path="/feedback" element={<PatientFeedback />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tickets" element={<AdminTicketManagement />} />
                <Route path="/admin/feedback" element={<AdminFeedbackManagement />} />
                <Route path="/doctor" element={<DoctorDashboard user={user} />} />
                <Route path="/agent-chat" element={<AgentChat />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;