import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="landing-layout animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ 
          maxWidth: '900px', 
          width: '100%', 
          padding: '5rem 3rem', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.05)'
        }}>
          {/* Decorative shapes behind text */}
          <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '350px', height: '350px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%' }}></div>

          <div style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: 'rgba(74, 144, 226, 0.1)', color: 'var(--primary)', borderRadius: '30px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '2rem', border: '1px solid rgba(74, 144, 226, 0.2)' }}>
            Welcome to the Future of Healthcare
          </div>

          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: '800', 
            marginBottom: '1.2rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            lineHeight: 1.2
          }}>
            Next-Gen Clinic <br /> Management System
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            Experience seamless clinical workflows, intelligent pharmacy inventory, and interactive patient dashboards—all powered by an advanced Agentic AI system.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 25px rgba(74, 144, 226, 0.4)', transition: 'all 0.3s' }}>
              Access Portal <span style={{ fontSize: '1.4rem' }}>→</span>
            </Link>
            <Link to="/register" className="btn btn-soft" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
              Public Area
            </Link>
          </div>
          
          <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '4rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '3rem' }}>
             <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ fontSize: '2.5rem', background: 'var(--bg-card)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>🤖</div>
               <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>AI Support</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Intelligent diagnostics</div>
             </div>
             <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ fontSize: '2.5rem', background: 'var(--bg-card)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>💊</div>
               <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Smart Pharmacy</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live inventory tracking</div>
             </div>
             <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
               <div style={{ fontSize: '2.5rem', background: 'var(--bg-card)', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>🛡️</div>
               <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Secure Core</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role-based enterprise security</div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
