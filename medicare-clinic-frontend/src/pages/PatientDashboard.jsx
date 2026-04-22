import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

import MyTickets from './MyTickets';
import SubmitTicket from './SubmitTicket';
import PatientFeedback from './PatientFeedback';

export default function PatientDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [emrRecords, setEmrRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [emrLoading, setEmrLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Automatically switch tabs if routed with state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const [schedules, setSchedules] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [toastMsg, setToastMsg] = useState(null);

    // Search Filters (Preserved from integration-V1)
    const [searchTerm, setSearchTerm] = useState('');
    const [searchSpecialization, setSearchSpecialization] = useState('Any Specialization');
    const [searchDate, setSearchDate] = useState('');

    // Uniform User identification using sessionStorage
    const storedFullName = sessionStorage.getItem('fullName') || localStorage.getItem('fullName') || 'Patient';
    const storedUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';
    const storedUsername = sessionStorage.getItem('username') || localStorage.getItem('username') || '';
    const storedRole = sessionStorage.getItem('role') || localStorage.getItem('role') || 'PATIENT';

    const [userProfile, setUserProfile] = useState({
        name: storedFullName,
        id: storedUserId,
        username: storedUsername,
        role: storedRole,
        email: 'Loading...',
        phone: 'Loading...',
        address: 'Loading...',
        bloodGroup: 'O+',
        allergies: 'None'
    });

    const patientUserId = storedUserId;

    useEffect(() => {
        fetchPrescriptions();
        fetchSchedules();
        fetchEmrRecords();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await API.get('/schedules');
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
            await API.post(`/schedules/book/${scheduleId}?patientId=${patientUserId}`);
            showToast('✅ Appointment booked successfully!');
            fetchSchedules();
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
            setPrescriptions(response.data || []);
            setError(null);
        } catch (err) {
            setError('⚠️ Could not load prescriptions. (' + (err.response?.data?.message || err.message) + ')');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmrRecords = async () => {
        try {
            setEmrLoading(true);
            const response = await API.get('/emr');
            // Assuming the EMR endpoint returns all and we filter, or it's already patient-scoped
            setEmrRecords(response.data || []);
        } catch (err) {
            console.warn('Could not fetch EMR records:', err.response?.data || err.message);
            setEmrRecords([]);
        } finally {
            setEmrLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const isPending = !status || ['Pending', 'NEW', 'PENDING'].includes(status);
        if (isPending) return { label: 'Pending', cls: 'badge-danger' };
        return { label: 'Dispensed', cls: 'badge-success' };
    };

    const getEmrStatusStyle = (status) => {
        const styles = {
            'Active': { background: 'rgba(16,185,129,0.12)', color: '#059669' },
            'Critical': { background: 'rgba(239,68,68,0.12)', color: '#dc2626' },
            'Follow-Up': { background: 'rgba(245,158,11,0.12)', color: '#d97706' },
            'Discharged': { background: 'rgba(59,130,246,0.12)', color: '#2563eb' }
        };
        return styles[status] || styles['Active'];
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            <div className="bg-decor-container">
                <div className="float-circle"></div>
                <div className="float-symbol">☤</div>
            </div>

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        Prescriptions
                    </button>
                    <button className={`btn ${activeTab === 'medical-records' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('medical-records')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                        Medical Records
                    </button>
                    <button className={`btn ${activeTab === 'booking' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('booking')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Book Appointment
                    </button>
                    <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('profile')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profile
                    </button>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                    <button className="btn btn-soft" onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })} style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8V4H8"></path><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                        Ask AI Assistant
                    </button>

                    <button onClick={() => navigate('/patient-billing', { state: { patientId: userProfile.id } })} className="btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: '700', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💳</span>
                        Billing & Payments
                    </button>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                    <button className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('tickets')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🎫</span>
                        Support Tickets
                    </button>
                    <button className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('feedback')} style={{ width: '100%', justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💬</span>
                        Feedback
                    </button>
                </nav>

                <button className="btn btn-soft" onClick={handleLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <header className="header-row">
                    <div>
                        <h1>Patient Portal</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {userProfile.name}</p>
                    </div>
                    <div className="soft-card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {userProfile.id && <div className="badge badge-info">ID: {userProfile.id}</div>}
                        <span style={{ fontWeight: '600' }}>Active Account</span>
                    </div>
                </header>

                {error && (
                    <div className="soft-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', borderLeft: '6px solid var(--danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</span>
                        <button onClick={() => setError(null)} className="btn-soft">✕</button>
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
                                <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(67,97,238,0.1)' }}>🏥</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Medical Records</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{emrRecords.length}</div>
                                </div>
                            </div>
                            <div className="soft-card stat-card">
                                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(56, 176, 0, 0.1)' }}>⚕️</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Primary Clinic</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>MediCare Center</div>
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
                                    {prescriptions.slice(0, 3).map(p => (
                                        <div key={p.id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>💊</div>
                                                <div>
                                                    <div style={{ fontWeight: '700' }}>{p.medicineName || p.medicineId || 'Unknown Medicine'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(p.createdAt)} • {p.dosage}</div>
                                                </div>
                                            </div>
                                            <span className={`badge ${getStatusBadge(p.status).cls}`}>{getStatusBadge(p.status).label}</span>
                                        </div>
                                    ))}
                                    {prescriptions.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No records yet.</p>}
                                </div>
                            </div>

                            <div className="soft-card" style={{ padding: '2rem' }}>
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem', border: '1px solid #bae6fd', background: '#f0f9ff' }} onClick={() => navigate('/patient-billing', { state: { patientId: userProfile.id } })}>
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
                                    <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }} onClick={() => setActiveTab('medical-records')}>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--secondary)', marginBottom: '0.2rem' }}>🏥 My Medical Records</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View your EMR records</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'booking' && (
                    <div className="animate-fade-in">
                        <div className="soft-card" style={{ maxWidth: '1000px', margin: '0 auto 2.5rem', padding: '1.2rem 2rem', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: '160px' }}>
                                    <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: '800', margin: 0 }}>Channel Doctor</h2>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Find clinical sessions</p>
                                </div>
                                <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <input type="text" placeholder="Doctor Name..." className="form-input" style={{ flex: 1.2, minWidth: '200px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    <select className="form-input" style={{ flex: 1, minWidth: '180px' }} value={searchSpecialization} onChange={(e) => setSearchSpecialization(e.target.value)}>
                                        <option value="Any Specialization">Any Specialization</option>
                                        <option value="General">General Physician</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                    </select>
                                    <input type="date" className="form-input" style={{ flex: 0.8, minWidth: '150px' }} value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem' }}>Search</button>
                                </form>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {schedules.map(s => (
                                <div key={s.id} className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr', alignItems: 'center', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>Dr. {s.doctorName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.specialization.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>🗓 {formatDate(s.date)}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>🕒 {s.time}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>SLOTS</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{s.availableSlots}</div>
                                    </div>
                                    <button className="btn btn-primary" disabled={bookingLoading} onClick={() => handleBookAppointment(s.id)}>Book Now</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Prescription History</h2>
                        {loading ? <p>Loading...</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {prescriptions.map(rx => (
                                    <div key={rx.id} className="soft-card" style={{ padding: '1.5rem', borderTop: `5px solid ${getStatusBadge(rx.status).label === 'Pending' ? 'var(--danger)' : 'var(--success)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span className="badge badge-info">#{rx.id}</span>
                                            <span className={`badge ${getStatusBadge(rx.status).cls}`}>{getStatusBadge(rx.status).label}</span>
                                        </div>
                                        <h3 style={{ color: 'var(--primary)' }}>{rx.medicineName || rx.medicineId}</h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                            <div>Dose: {rx.dosage}</div>
                                            <div>Doctor: {rx.doctorName || 'Staff'}</div>
                                            <div style={{ marginTop: '0.5rem' }}>🗓 {formatDate(rx.createdAt)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'medical-records' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>My Medical Records</h2>
                        {emrLoading ? <p>Loading...</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {emrRecords.map(record => (
                                    <div key={record.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '5px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: '800' }}>🏥 Visit: {formatDate(record.visitDate)}</div>
                                            <span style={{ padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.75rem', ...getEmrStatusStyle(record.status) }}>{record.status}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                            <div><strong>Doctor:</strong> {record.attendingDoctor}</div>
                                            <div><strong>Blood Group:</strong> {record.bloodGroup}</div>
                                            <div style={{ gridColumn: 'span 2' }}><strong>Allergies:</strong> {record.allergies || 'None'}</div>
                                        </div>
                                    </div>
                                ))}
                                {emrRecords.length === 0 && <p>No medical records found.</p>}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
                            <div className="stat-icon" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>{userProfile.name.charAt(0)}</div>
                            <div>
                                <h2>{userProfile.name}</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>@{userProfile.username}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div><strong>User ID:</strong> {userProfile.id}</div>
                            <div><strong>Role:</strong> {userProfile.role}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <MyTickets onNavigateToSubmit={() => setActiveTab('submit-ticket')} />
                    </div>
                )}

                {activeTab === 'submit-ticket' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <button className="btn btn-soft" onClick={() => setActiveTab('tickets')}>← Back to Tickets</button>
                        </div>
                        <SubmitTicket />
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <PatientFeedback />
                    </div>
                )}

                {toastMsg && (
                    <div style={{ position: 'fixed', right: '1.5rem', bottom: '1.5rem', background: 'var(--success)', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', zIndex: 10000 }}>
                        {toastMsg.text}
                    </div>
                )}
            </main>
        </div>
    );
}