import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [schedules, setSchedules] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    // Search Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSpecialization, setSearchSpecialization] = useState('Any Specialization');
    const [searchDate, setSearchDate] = useState('');

    const [userProfile, setUserProfile] = useState({
        name: localStorage.getItem('fullName') || 'Unknown Patient',
        id: localStorage.getItem('userId') || 'PAT001',
        age: 24,
        email: 'Loading...',
        phone: 'Loading...',
        address: 'Loading...',
        bloodGroup: 'O+',
        allergies: 'None'
    });

    // userId stored by Login.jsx
    const patientUserId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetchPrescriptions();
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await API.get('/schedules');
            // Show only schedules with available slots
            setSchedules(response.data.filter(s => s.availableSlots > 0));
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('doctor', searchTerm);
            if (searchSpecialization && searchSpecialization !== 'Any Specialization') params.append('specialization', searchSpecialization);
            if (searchDate) params.append('date', searchDate);

            const response = await API.get(`/schedules/search?${params.toString()}`);
            setSchedules(response.data.filter(s => s.availableSlots > 0));
            // Switch to show results if not already there
            setActiveTab('booking');
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = async (scheduleId) => {
        try {
            setBookingLoading(true);
            // Calling the backend booking endpoint
            await API.post(`/schedules/book/${scheduleId}?patientId=${patientUserId}`);
            showToast('✅ Appointment booked successfully!');
            fetchSchedules(); // Refresh slots
        } catch (err) {
            alert('Booking failed: ' + (err.response?.data || err.message));
        } finally {
            setBookingLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToastMsg({ text: msg, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/prescriptions/patient/${patientUserId}`);
            setPrescriptions(response.data);
            setError(null);
        } catch (err) {
            setError('⚠️ Could not connect to the backend server. (' + (err.response?.data?.message || err.message) + ')');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const isPending = !status || status === 'Pending' || status === 'NEW' || status === 'PENDING';
        if (isPending) {
            return { label: 'Pending', cls: 'badge-danger' };
        }
        return { label: 'Dispensed', cls: 'badge-success' };
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            <div className="bg-decor-container">
                <div className="float-circle"></div>
                <div className="float-symbol">☤</div>
            </div>

            {/* Sidebar */}
            <aside className="glass-panel" style={{ margin: '1rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                <div className="logo" style={{ marginBottom: '2.5rem', padding: '0.5rem' }}>
                    <div className="logo-m">M</div>
                    <span>MediCare</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                    <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('overview')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Overview
                    </button>
                    <button className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('prescriptions')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Prescriptions
                    </button>
                    <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('profile')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profile
                    </button>
                    <button
                        className={`btn ${activeTab === 'booking' ? 'btn-primary' : 'btn-soft'}`}
                        onClick={() => setActiveTab('booking')}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Book Appointment
                    </button>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                    <button className="btn btn-soft" onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                        Ask AI Assistant
                    </button>

                    {/* === BILLING NAVIGATION BUTTON === */}
                    <button
                        // Passing the patient ID perfectly via state!
                        onClick={() => navigate('/patient-billing', { state: { patientId: userProfile.id } })}
                        className="btn"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: '700', marginTop: '0.5rem' }}
                    >
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💳</span>
                        Billing & Payments
                    </button>
                </nav>

                <button className="btn btn-soft" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header-row">
                    <div>
                        <h1>Patient Portal</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {userProfile.name.split(' ')[1]}</p>
                    </div>

                    <div className="soft-card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="badge badge-info">ID: {userProfile.id}</div>
                        <span style={{ fontWeight: '600' }}>Active Account</span>
                    </div>
                </header>

                {error && (
                    <div className="soft-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderLeft: '6px solid var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</span>
                        <button onClick={() => setError(null)} className="btn-soft" style={{ padding: '0.4rem' }}>✕</button>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <div className="stat-grid">
                            <div className="soft-card stat-card">
                                <div className="stat-icon">📄</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Prescriptions</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{prescriptions.length}</div>
                                </div>
                            </div>
                            <div className="soft-card stat-card">
                                <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(230, 57, 70, 0.1)' }}>🩸</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Type</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{userProfile.bloodGroup}</div>
                                </div>
                            </div>
                            <div className="soft-card stat-card">
                                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(56, 176, 0, 0.1)' }}>⚕️</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Primary Clinic</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>Colombo Center</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                            <div className="soft-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3>Recent Prescriptions</h3>
                                    <button className="btn btn-soft" onClick={() => setActiveTab('prescriptions')}>View All</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {prescriptions.slice(0, 3).map(p => {
                                        const badge = getStatusBadge(p.status);
                                        return (
                                            <div key={p.id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>💊</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700' }}>{p.medicineName || p.medicineId || 'Unknown Medicine'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(p.createdAt)} • {p.dosage}</div>
                                                    </div>
                                                </div>
                                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                        );
                                    })}
                                    {prescriptions.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No records yet.</p>}
                                </div>
                            </div>

                            <div className="soft-card" style={{ padding: '2rem' }}>
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                                    {/* === QUICK ACTION BILLING BUTTON === */}
                                    <button
                                        className="btn btn-soft"
                                        style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem', border: '1px solid #bae6fd', background: '#f0f9ff' }}
                                        onClick={() => navigate('/patient-billing', { state: { patientId: userProfile.id } })}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: '#0284c7', marginBottom: '0.2rem' }}>💳 View & Pay Bills</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Access your secure payment portal</div>
                                        </div>
                                    </button>

                                    <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }} onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.2rem' }}>🤖 Smart Consultation</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chat with our AI medical assistant</div>
                                        </div>
                                    </button>
                                    <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }} onClick={() => setActiveTab('profile')}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>📝 Update Health Profile</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Modify your medical history</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'booking' && (
                    <div className="animate-fade-in">
                        {/* 🏥 CHANNEL YOUR DOCTOR - COMPACT SEARCH BAR */}
                        <div className="soft-card" style={{ maxWidth: '1000px', margin: '0 auto 2.5rem', padding: '1.2rem 2rem', boxShadow: '0 12px 30px rgba(0,119,182,0.08)', borderRadius: '24px', border: '1px solid rgba(0,119,182,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: '160px' }}>
                                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Channel Doctor</h2>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Find clinical sessions</p>
                                </div>

                                <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div className="glass-panel" style={{ flex: 1.2, display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', minWidth: '220px', border: '1px solid rgba(0,119,182,0.1)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.8rem' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                        <input 
                                            type="text" 
                                            placeholder="Doctor Name..." 
                                            className="form-input" 
                                            style={{ border: 'none', padding: '0', fontSize: '0.95rem', background: 'transparent', width: '100%', outline: 'none', fontWeight: '600' }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            maxLength={20}
                                        />
                                    </div>

                                    <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', minWidth: '180px', border: '1px solid rgba(0,119,182,0.1)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.8rem' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                                        <select 
                                            className="form-input" 
                                            style={{ border: 'none', padding: '0', fontSize: '0.95rem', background: 'transparent', flex: 1, outline: 'none', fontWeight: '600', cursor: 'pointer' }}
                                            value={searchSpecialization}
                                            onChange={(e) => setSearchSpecialization(e.target.value)}
                                        >
                                            <option value="Any Specialization">Any Specialization</option>
                                            <option value="General">General Physician</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                        </select>
                                    </div>

                                    <div className="glass-panel" style={{ flex: 0.8, display: 'flex', alignItems: 'center', padding: '0.6rem 1.2rem', borderRadius: '14px', background: 'rgba(255,255,255,0.6)', minWidth: '160px', border: '1px solid rgba(0,119,182,0.1)' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.8rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        <input 
                                            type="date" 
                                            className="form-input" 
                                            style={{ border: 'none', padding: '0', fontSize: '0.95rem', background: 'transparent', flex: 1, color: searchDate ? 'var(--text-main)' : 'var(--text-secondary)', outline: 'none', fontWeight: '600' }}
                                            value={searchDate}
                                            onChange={(e) => setSearchDate(e.target.value)}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', background: 'var(--primary)', borderRadius: '14px', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.2)' }}>
                                        Search
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* 📅 RESULTS LIST - SESSION VIEW */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
                                <h3>{schedules.length} Available Sessions Found</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>MEDI-CARE COLOMBO CENTER SESSIONS</p>
                            </div>

                            {schedules.length === 0 ? (
                                <div className="soft-card" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div className="stat-icon" style={{ margin: '0 auto 1.5rem', background: 'var(--primary-soft)' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    </div>
                                    <h3 style={{ color: 'var(--text-secondary)' }}>No matching sessions currently available.</h3>
                                    <p>Try broadening your search criteria.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--primary-soft)', border: '1px solid var(--primary-soft)', borderRadius: '16px', overflow: 'hidden' }}>
                                    {schedules.map(s => (
                                        <div key={s.id} className="glass-panel" style={{ padding: '1.5rem 2rem', borderRadius: '0', display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 1.5fr 1fr 1fr 1fr', alignItems: 'center', gap: '2rem', background: '#fff' }}>
                                            
                                            {/* Doctor Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--primary-soft)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.1rem' }}>Dr. {s.doctorName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>{s.specialization.toUpperCase()}</div>
                                                </div>
                                            </div>

                                            {/* Session Date & Time */}
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    {new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                   {new Date('2024-01-01T' + (s.time.length === 5 ? s.time : s.time.substring(0,5))).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                                                </div>
                                            </div>

                                            {/* Appointments Stats */}
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Available Slots</div>
                                                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--primary)' }}>
                                                    {s.availableSlots < 10 ? `0${s.availableSlots}` : s.availableSlots}
                                                </div>
                                            </div>

                                            {/* Booking Action */}
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ background: 'var(--primary)', padding: '0.7rem 1.6rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.25)' }}
                                                    disabled={bookingLoading}
                                                    onClick={() => handleBookAppointment(s.id)}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        Book
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{ textAlign: 'right' }}>
                                                <span className={`badge ${s.availableSlots > 0 ? 'badge-info' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                                    {s.availableSlots > 0 ? 'Open' : 'Full'}
                                                </span>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2>Medical History & Prescriptions</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Full history of your clinical records.</p>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>⏳</div>
                                <p>Loading clinical records...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {prescriptions.map(rx => {
                                    const badge = getStatusBadge(rx.status);
                                    return (
                                        <div key={rx.id} className="soft-card" style={{ padding: '1.5rem', borderTop: `5px solid ${badge.label === 'Pending' ? 'var(--danger)' : 'var(--success)'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                                <div className="badge badge-info">ID: #{rx.id}</div>
                                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{rx.medicineName || rx.medicineId || 'Unknown Medicine'}</h3>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dosage:</span> <strong style={{ color: 'var(--text-main)' }}>{rx.dosage || '—'}</strong></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Duration:</span> <strong style={{ color: 'var(--text-main)' }}>{rx.duration || '—'}</strong></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Doctor:</span> <strong style={{ color: 'var(--text-main)' }}>{rx.doctorName || rx.doctorId || 'Hospital Staff'}</strong></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Prescription ID:</span> <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>#{rx.id}</strong></div>
                                            </div>
                                            {rx.instructions && (
                                                <div style={{ marginTop: '1.2rem', padding: '0.8rem', background: 'var(--primary-soft)', borderRadius: '12px', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                                    Note: {rx.instructions}
                                                </div>
                                            )}
                                            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🗓 {formatDate(rx.createdAt)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {prescriptions.length === 0 && !loading && (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem' }}>📂</div>
                                <h3>No prescriptions found.</h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                        <div className="soft-card" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                                <div className="stat-icon" style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '3rem', fontWeight: '800' }}>
                                    {userProfile.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '2rem' }}>{userProfile.name}</h2>
                                    <p className="badge badge-info">ID: {userProfile.id}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label className="form-label">Email</label>
                                    <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>{userProfile.email}</div>
                                </div>
                                <div>
                                    <label className="form-label">Phone</label>
                                    <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>{userProfile.phone}</div>
                                </div>
                                <div>
                                    <label className="form-label">Age</label>
                                    <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>{userProfile.age} Years</div>
                                </div>
                                <div>
                                    <label className="form-label">Blood Group</label>
                                    <div className="soft-card" style={{ padding: '1rem', fontWeight: '800', color: 'var(--danger)', boxShadow: 'var(--soft-shadow-sm)' }}>{userProfile.bloodGroup}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <label className="form-label">Address</label>
                                <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>{userProfile.address}</div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <label className="form-label">Allergies</label>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                    {userProfile.allergies.split(',').map(tag => (
                                        <span key={tag} className="badge badge-danger" style={{ padding: '0.6rem 1rem' }}>{tag.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="soft-card" style={{ padding: '2rem', height: 'fit-content' }}>
                            <h3>Security & Access</h3>
                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>2-Factor Auth</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Off</div>
                                    </div>
                                    <button className="btn btn-soft" style={{ padding: '0.5rem 1rem' }}>Enable</button>
                                </div>
                                <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>Data Privacy</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Encrypted</div>
                                    </div>
                                    <div className="badge badge-success">On</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}