import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/login', { username, password });
      const { token, role: userRole, fullName, userId } = response.data;

      // Store auth data in BOTH storages so session restore + dashboard reads both work
      const authData = { token, userId, role: userRole, fullName, username };
      Object.entries(authData).forEach(([k, v]) => {
        localStorage.setItem(k, v);
        sessionStorage.setItem(k, v);
      });

      if (onLogin) {
        onLogin({ username: fullName || username, role: userRole });
      }

      // Redirect based on role
      switch(userRole) {
        case 'PHARMACY': navigate('/pharmacy'); break;
        case 'DOCTOR':   navigate('/doctor'); break;
        case 'ADMIN':    navigate('/admin'); break;
        case 'STAFF':    navigate('/staff'); break;
        case 'PATIENT':  navigate('/patient-dashboard'); break;
        default:         navigate('/patient-dashboard');
      }
    } catch (err) {
      console.error("Login detail:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Link to="/" style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '600', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>&lt;</span> Home
      </Link>
      <div className="bg-decor-container">
        <div className="float-circle"></div>
        <div className="float-symbol">☤</div>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <h1>MediCare</h1>
          <p>Smart Clinic System</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>

          {error && <div className="error-message" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

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


          <button id="login-btn" type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`}>
            {isLoading ? (
              <span className="btn-spinner"></span>
            ) : (
              <>Sign In →</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register here</Link>
          </p>
          <span style={{ display: 'block', marginTop: '1rem' }}>🔐 Secured with end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}

export default Login;