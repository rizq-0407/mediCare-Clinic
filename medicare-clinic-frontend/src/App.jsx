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
import './index.css';

// === BILLING IMPORTS ===
import BillingLogin from './pages/BillingLogin';
import AdminBilling from './pages/AdminBilling';
import PatientBilling from './pages/PatientBilling';

function App() {
    const [user, setUser] = useState(null);

    const handleLogout = () => {
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
            {user && <Navbar user={user} onLogout={handleLogout} />}
            <Routes>
                {/* ORIGINAL ROUTES */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login onLogin={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/patient" element={<Navigate to="/patient-dashboard" replace />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/doctor" element={<DoctorDashboard user={user} />} />
                <Route path="/agent-chat" element={<AgentChat />} />

                {/* === NEW BILLING ROUTES === */}
                <Route path="/billing-login" element={<BillingLogin />} />
                <Route path="/admin-billing" element={<AdminBilling />} />
                <Route path="/patient-billing" element={<PatientBilling />} />

                {/* FALLBACK ROUTE (Must stay at the absolute bottom!) */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;