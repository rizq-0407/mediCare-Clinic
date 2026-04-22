import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (['/login', '/register', '/billing-login'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel" style={{ 
      margin: '1rem', 
      padding: '0.75rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '1rem',
      zIndex: 1000
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          width: '35px', 
          height: '35px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}>M</div>
        <h1 style={{ fontSize: '1.25rem', margin: 0, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediCare</h1>
      </Link>

      <div className="nav-links-center" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Home</Link>
        <a href="/#about-section" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>About</a>
        <Link to="/appointments" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Appointment</Link>
        <a href="/#services-section" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Service</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/register" className="btn btn-soft" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
              Register
            </Link>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
              Login
            </Link>
          </div>
      </div>
    </nav>
  );
}
