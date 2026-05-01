import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reusing Login.css for consistent theme

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Always register as PATIENT for public
      const backendRole = 'PATIENT';
      
      const response = await API.post('/auth/register', { 
        username, 
        password, 
        email,
        fullName,
        contactNumber,
        role: backendRole 
      });
      
      alert(`Registration successful! Your System ID is: ${response.data.userId}. Please login using your username.`);
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.message || "Registration failed. Please try again.");
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
      
      <div className="login-card animate-fade-in" style={{ maxWidth: '450px' }}>
        <div className="login-logo">
          <h1>MediCare</h1>
          <p>Join our Smart Clinic System</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <h2>Create Account</h2>
          <p className="login-subtitle">Enter your details to get started</p>

          <div className="login-field">
            <label>Full Name</label>
            <div className="login-input-wrap">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                placeholder="Enter your full name"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Username</label>
            <div className="login-input-wrap">
              <span className="input-icon">🆔</span>
              <input 
                type="text" 
                placeholder="Choose a username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <span className="input-icon">📧</span>
              <input 
                type="email" 
                placeholder="your@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                placeholder="Create a strong password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Contact Number</label>
            <div className="login-input-wrap">
              <span className="input-icon">📞</span>
              <input 
                type="tel" 
                placeholder="e.g., +92 300 1234567"
                value={contactNumber} 
                onChange={(e) => setContactNumber(e.target.value)} 
                required 
              />
            </div>
          </div>


          <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? <span className="btn-spinner"></span> : <>Register Now →</>}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign In here</Link></span>
        </div>
      </div>
    </div>
  );
}
