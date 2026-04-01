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
          fontSize: '1.2rem'
        }}>M</div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediCare</h1>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user && (
          <>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Welcome, <strong style={{ color: 'var(--text-main)' }}>{user.username}</strong> 
              <span className="badge badge-success" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>{user.role}</span>
            </span>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
