import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/login', { userId, password });
      const { token, role, fullName } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('fullName', fullName);
      
      // Redirect based on role
      switch(role) {
        case 'PHARMACY': navigate('/pharmacy'); break;
        case 'DOCTOR': navigate('/doctor'); break;
        case 'ADMIN': navigate('/admin'); break;
        case 'PATIENT': navigate('/patient-dashboard'); break;
        default: navigate('/patient-dashboard');
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
            <label>UserID</label>
            <div className="login-input-wrap">
              <span className="input-icon">👤</span>
              <input
                id="login-userid"
                type="text"
                placeholder="Enter your UserID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
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