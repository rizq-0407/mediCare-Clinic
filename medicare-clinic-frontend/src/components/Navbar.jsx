import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

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
        {user && user.role === 'PATIENT' && (
          <>
            <Link to="/my-tickets" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>My Tickets</Link>
            <Link to="/feedback" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Feedback</Link>
          </>
        )}
        {user && user.role === 'ADMIN' && (
          <>
            <Link to="/admin/tickets" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Tickets</Link>
            <Link to="/admin/feedback" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>Feedback</Link>
          </>
        )}
        <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem', transition: 'color 0.2s' }}>About Us</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Welcome, <strong style={{ color: 'var(--text-main)' }}>{user.username}</strong> 
              <span className="badge badge-success" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>{user.role}</span>
            </span>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
