import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Pharmacist');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (role === 'Patient') {
                navigate("/patient-dashboard");
            } else {
                navigate("/pharmacy");
            }
        }, 800);
    };

    return (
        <div className="login-page">
            <div className="login-bg-orb orb-1"></div>
            <div className="login-bg-orb orb-2"></div>
            <div className="login-bg-orb orb-3"></div>

            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">💊</div>
                    <h1>MediCare</h1>
                    <p>Smart Clinic System</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <h2>Welcome Back</h2>
                    <p className="login-subtitle">Sign in to access your dashboard</p>

                    <div className="login-field">
                        <label>Username</label>
                        <div className="login-input-wrap">
                            <span className="input-icon">👤</span>
                            <input
                                id="login-username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label>Password</label>
                        <div className="login-input-wrap">
                            <span className="input-icon">🔒</span>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label>Role</label>
                        <div className="login-input-wrap">
                            <span className="input-icon">🏥</span>
                            <select
                                id="login-role"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option>Patient</option>
                                <option>Pharmacist</option>
                                <option>Doctor</option>
                                <option>Admin</option>
                            </select>
                        </div>
                    </div>

                    <button id="login-btn" type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? (
                            <span className="btn-spinner"></span>
                        ) : (
                            <>Sign In →</>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>🔐 Secured with end-to-end encryption</span>
                </div>
            </div>
        </div>
    );
}

export default Login;