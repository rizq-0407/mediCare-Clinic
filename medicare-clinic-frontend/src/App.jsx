import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Pharmacy from "./pages/Pharmacy";
import Login from "./pages/Login";
import AgentChat from "./pages/AgentChat";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import EmrDashboard from "./pages/EmrDashboard";
import EmrFormPage from "./pages/EmrFormPage";
import Navbar from "./components/Navbar";
import MyTickets from "./pages/MyTickets";
import SubmitTicket from "./pages/SubmitTicket";
import PatientFeedback from "./pages/PatientFeedback";
import AdminTicketManagement from "./pages/AdminTicketManagement";
import AdminFeedbackManagement from "./pages/AdminFeedbackManagement";
import './index.css';

// === BILLING IMPORTS ===
import BillingLogin from './pages/BillingLogin';
import AdminBilling from './pages/AdminBilling';
import PatientBilling from './pages/PatientBilling';

function App() {
    const [user, setUser] = useState(null);

    // Restore user session from sessionStorage on page load/refresh
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            setUser({
                username: sessionStorage.getItem("username") || "",
                userId: sessionStorage.getItem("userId") || "",
                role: sessionStorage.getItem("role") || "",
                fullName: sessionStorage.getItem("fullName") || "",
                token: token,
            });
        }
    }, []);

    const handleLogout = () => {
        // Clear all auth data from sessionStorage
        sessionStorage.clear();
        setUser(null);
    };

    return (
        <Router>
            <div className="bg-decor-container">
                <div className="float-orb" style={{ top: '-100px', right: '-100px' }}></div>
                <div className="float-orb" style={{ bottom: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(114, 9, 183, 0.05) 0%, transparent 70%)' }}></div>
                <div className="float-symbol" style={{ top: '10%', left: '-5%', opacity: 0.3 }}>☤</div>
                <div className="float-symbol" style={{ bottom: '0', right: '-10%', fontSize: '20rem', opacity: 0.1 }}>💊</div>
            </div>
            {!user && <Navbar user={user} onLogout={handleLogout} />}
            <Routes>
                {/* ORIGINAL ROUTES */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/patient" element={<Navigate to="/patient-dashboard" replace />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/tickets" element={<AdminTicketManagement />} />
                <Route path="/admin/feedback" element={<AdminFeedbackManagement />} />
                <Route path="/doctor" element={<DoctorDashboard user={user} />} />
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/agent-chat" element={<AgentChat />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/submit-ticket" element={<SubmitTicket />} />
                <Route path="/feedback" element={<PatientFeedback />} />

                {/* === NEW BILLING ROUTES === */}
                <Route path="/billing-login" element={<BillingLogin />} />
                <Route path="/admin-billing" element={<AdminBilling />} />
                <Route path="/patient-billing" element={<PatientBilling />} />

                {/* EMR Routes */}
                <Route path="/emr" element={<EmrDashboard />} />
                <Route path="/emr/new" element={<EmrFormPage />} />

                {/* FALLBACK ROUTE (Must stay at the absolute bottom!) */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;