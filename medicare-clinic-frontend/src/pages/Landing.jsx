import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="landing-layout animate-fade-in" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.65)), url('/bg-landing.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '3rem' }}>
        {/* ── Main Panel ── */}
        <div className="glass-panel" style={{ 
          maxWidth: '900px', 
          width: '100%', 
          padding: '5rem 3rem', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.1)'
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
              Login <span style={{ fontSize: '1.4rem' }}>→</span>
            </Link>
            <Link to="/register" className="btn btn-soft" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.05)' }}>
              Register
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

        {/* ── Key System Capabilities ── */}
        <div id="services-section" style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '0 1rem'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Agentic AI Orchestrator</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Our proprietary AI orchestrator automatically routes your requests to specialized agents—Doctor, Pharmacy, or Appointment specialists—ensuring expert precision for every interaction.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Real-time Analytics</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Dashboards update in real-time with prescription status, patient flow, and inventory levels, providing administrators with a bird's-eye view of clinic efficiency.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Enterprise Security</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Secured with industry-standard JWT authentication and granular role-based access control, ensuring sensitive medical data remains private and protected.</p>
          </div>
        </div>

        {/* ── About Our System ── */}
        <div id="about-section" style={{
          maxWidth: '900px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          color: '#1e293b'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>About Our System</h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
            MediCare Artificial Intelligence System is a revolutionary approach to clinical management. Built from the ground up to empower both patients and healthcare providers, it bridges the gap between complex medical operations and intuitive, conversational interfaces.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <div style={{ flex: '1 1 200px', background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(255, 255, 255, 0.8)' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.6rem', fontWeight: '700' }}>For Patients</h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>Instantly ask health questions and get verified AI guidance.</p>
            </div>
            <div style={{ flex: '1 1 200px', background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(255, 255, 255, 0.8)' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.6rem', fontWeight: '700' }}>For Doctors</h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>Access patient records, schedules, and clinical insights effortlessly.</p>
            </div>
            <div style={{ flex: '1 1 200px', background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(255, 255, 255, 0.8)' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.6rem', fontWeight: '700' }}>For Pharmacy</h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>Smart inventory tracking and automated restock warnings.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
