import React, { useState } from 'react';
import axios from 'axios';
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
      // Map frontend roles to Backend Role Enum values
      const backendRole = role.toUpperCase();
      
      await axios.post('http://localhost:8080/api/auth/register', { 
        username, 
        password, 
        email,
        fullName,
        contactNumber,
        role: backendRole 
      });
      
      alert('Registration successful! Please login.');
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

          <div className="login-field">
            <label>Account Type (Role)</label>
            <div className="login-input-wrap">
              <span className="input-icon">🏥</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="PATIENT">Patient (Standard Access)</option>
                <option value="DOCTOR">Doctor (Clinical Access)</option>
                <option value="PHARMACY">Pharmacist (Inventory Access)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
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
