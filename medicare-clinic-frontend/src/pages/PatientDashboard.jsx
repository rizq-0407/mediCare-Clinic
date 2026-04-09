import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [toastMsg, setToastMsg] = useState(null);
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
    }, []);

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