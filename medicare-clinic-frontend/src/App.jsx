import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Pharmacy from "./pages/Pharmacy";
import Login from "./pages/Login";
import AgentChat from "./pages/AgentChat";
import PatientDashboard from "./pages/PatientDashboard";
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/agent-chat" element={<AgentChat />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;