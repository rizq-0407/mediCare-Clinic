import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [emrRecords, setEmrRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [emrLoading, setEmrLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [toastMsg, setToastMsg] = useState(null);
<<<<<<< HEAD
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

    // userId stored by Login.jsx (e.g. PAT001)
    const patientUserId = localStorage.getItem('userId') || '';
=======

    const storedFullName = sessionStorage.getItem('fullName') || 'Patient';
    const storedUserId = sessionStorage.getItem('userId') || '';
    const storedUsername = sessionStorage.getItem('username') || '';
    const storedRole = sessionStorage.getItem('role') || 'PATIENT';

    const [userProfile] = useState({
        name: storedFullName,
        id: storedUserId,
        username: storedUsername,
        role: storedRole,
        email: '',
        phone: '',
        address: '',
        bloodGroup: '',
        allergies: ''
    });
>>>>>>> 45e23be (“emr”)

    useEffect(() => {
        fetchPrescriptions();
        fetchEmrRecords();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToastMsg({ text: msg, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
<<<<<<< HEAD
            // Use the patient-specific endpoint with JWT auth
            const response = await API.get(`/prescriptions/patient/${patientUserId}`);
            setPrescriptions(response.data);
            setError(null);
        } catch (err) {
            setError('⚠️ Could not connect to the backend server. (' + (err.response?.data?.message || err.message) + ')');
=======
            const response = await API.get('/prescriptions');
            setPrescriptions(response.data || []);
            setError(null);
        } catch (err) {
            console.warn('Could not fetch prescriptions:', err.message);
            setError('⚠️ Could not load prescriptions. (' + (err.response?.status || err.message) + ')');
>>>>>>> 45e23be (“emr”)
        } finally {
            setLoading(false);
        }
    };

    const fetchEmrRecords = async () => {
        try {
            setEmrLoading(true);
            const response = await API.get('/emr');
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
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const isPending = !status || status === 'Pending' || status === 'NEW' || status === 'PENDING';
        if (isPending) {
            return { label: 'Pending', cls: 'badge-danger' };
        }
        return { label: 'Dispensed', cls: 'badge-success' };
    };

    const getEmrStatusStyle = (status) => {
        switch (status) {
            case 'Active':
                return {
                    background: 'rgba(16,185,129,0.12)',
                    color: '#059669'
                };
            case 'Critical':
                return {
                    background: 'rgba(239,68,68,0.12)',
                    color: '#dc2626'
                };
            case 'Follow-Up':
                return {
                    background: 'rgba(245,158,11,0.12)',
                    color: '#d97706'
                };
            case 'Discharged':
                return {
                    background: 'rgba(59,130,246,0.12)',
                    color: '#2563eb'
                };
            default:
                return {
                    background: 'rgba(16,185,129,0.12)',
                    color: '#059669'
                };
        }
    };

    return (
        <div className="dashboard-layout animate-fade-in">
            <div className="bg-decor-container">
                <div className="float-circle"></div>
                <div className="float-symbol">☤</div>
            </div>

            <aside
                className="glass-panel"
                style={{
                    margin: '1rem',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem'
                }}
            >
                <div className="logo" style={{ marginBottom: '2.5rem', padding: '0.5rem' }}>
                    <div className="logo-m">M</div>
                    <span>MediCare</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-soft'}`}
                        onClick={() => setActiveTab('overview')}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Overview
                    </button>

                    <button
                        className={`btn ${activeTab === 'prescriptions' ? 'btn-primary' : 'btn-soft'}`}
                        onClick={() => setActiveTab('prescriptions')}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Prescriptions
                    </button>

                    <button
                        className={`btn ${activeTab === 'medical-records' ? 'btn-primary' : 'btn-soft'}`}
                        onClick={() => setActiveTab('medical-records')}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
                        </svg>
                        Medical Records
                    </button>

                    <button
                        className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-soft'}`}
                        onClick={() => setActiveTab('profile')}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                    </button>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                    <button
                        className="btn btn-soft"
                        onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}
                        style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--primary)' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8V4H8"></path>
                            <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                            <path d="M2 14h2"></path>
                            <path d="M20 14h2"></path>
                            <path d="M15 13v2"></path>
                            <path d="M9 13v2"></path>
                        </svg>
                        Ask AI Assistant
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
                    <div
                        className="soft-card"
                        style={{
                            padding: '1rem 1.5rem',
                            marginBottom: '2rem',
                            borderLeft: '6px solid var(--danger)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</span>
                        <button onClick={() => setError(null)} className="btn-soft" style={{ padding: '0.4rem' }}>
                            ✕
                        </button>
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
                                <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(67,97,238,0.1)' }}>
                                    🏥
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Medical Records</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{emrRecords.length}</div>
                                </div>
                            </div>

                            <div className="soft-card stat-card">
                                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(56, 176, 0, 0.1)' }}>
                                    ⚕️
                                </div>
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
                                    <button className="btn btn-soft" onClick={() => setActiveTab('prescriptions')}>
                                        View All
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {prescriptions.slice(0, 3).map((p) => {
                                        const badge = getStatusBadge(p.status);
                                        return (
                                            <div
                                                key={p.id}
                                                className="glass-panel"
                                                style={{
                                                    padding: '1rem 1.5rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                                        💊
                                                    </div>
                                                    <div>
<<<<<<< HEAD
                                                        <div style={{ fontWeight: '700' }}>{p.medicineName || p.medicineId || 'Unknown Medicine'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(p.createdAt)} • {p.dosage}</div>
=======
                                                        <div style={{ fontWeight: '700' }}>{p.medicineId}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {formatDate(p.createdAt)} • {p.dosage}
                                                        </div>
>>>>>>> 45e23be (“emr”)
                                                    </div>
                                                </div>
                                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                            </div>
                                        );
                                    })}
                                    {prescriptions.length === 0 && (
                                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No records yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="soft-card" style={{ padding: '2rem' }}>
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        className="btn btn-soft"
                                        style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }}
                                        onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                                                🤖 Smart Consultation
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                Chat with our AI medical assistant
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        className="btn btn-soft"
                                        style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', marginBottom: '0.2rem' }}>📝 Update Health Profile</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                Modify your medical history
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        className="btn btn-soft"
                                        style={{ width: '100%', justifyContent: 'flex-start', padding: '1.5rem' }}
                                        onClick={() => setActiveTab('medical-records')}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                                                🏥 My Medical Records
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                View your EMR records
                                            </div>
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
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>
                                    ⏳
                                </div>
                                <p>Loading clinical records...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
<<<<<<< HEAD
                                {prescriptions.map(rx => {
                                    const badge = getStatusBadge(rx.status);
                                    return (
                                        <div key={rx.id} className="soft-card" style={{ padding: '1.5rem', borderTop: `5px solid ${badge.label === 'Pending' ? 'var(--danger)' : 'var(--success)'}` }}>
=======
                                {prescriptions.map((script) => {
                                    const badge = getStatusBadge(script.status);
                                    return (
                                        <div
                                            key={script.id}
                                            className="soft-card"
                                            style={{
                                                padding: '1.5rem',
                                                borderTop: `5px solid ${badge.label === 'Pending' ? 'var(--danger)' : 'var(--success)'}`
                                            }}
                                        >
>>>>>>> 45e23be (“emr”)
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                                <div className="badge badge-info">ID: #{rx.id}</div>
                                                <span className={`badge ${badge.cls}`}>{badge.label}</span>
                                            </div>
<<<<<<< HEAD
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
=======

                                            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{script.medicineId}</h3>

                                            <div
                                                style={{
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-secondary)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Dosage:</span>
                                                    <strong style={{ color: 'var(--text-main)' }}>{script.dosage}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Duration:</span>
                                                    <strong style={{ color: 'var(--text-main)' }}>{script.duration}</strong>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Doctor:</span>
                                                    <strong style={{ color: 'var(--text-main)' }}>{script.doctorId || 'Hospital Staff'}</strong>
                                                </div>
                                            </div>

                                            {script.instructions && (
                                                <div
                                                    style={{
                                                        marginTop: '1.2rem',
                                                        padding: '0.8rem',
                                                        background: 'var(--primary-soft)',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontStyle: 'italic'
                                                    }}
                                                >
                                                    Note: {script.instructions}
>>>>>>> 45e23be (“emr”)
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
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem' }}>
                                    📂
                                </div>
                                <h3>No prescriptions found.</h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'medical-records' && (
                    <div className="animate-fade-in soft-card" style={{ padding: '2.5rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2>My Medical Records</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Your complete Electronic Medical Records (EMR) from clinic visits.
                            </p>
                        </div>

                        {emrLoading ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>
                                    ⏳
                                </div>
                                <p>Loading medical records...</p>
                            </div>
                        ) : emrRecords.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
                                <h3>No Medical Records Found</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Your medical records will appear here after clinic visits.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {emrRecords.map((record) => {
                                    const statusStyle = getEmrStatusStyle(record.status);
                                    return (
                                        <div
                                            key={record.id}
                                            className="glass-panel"
                                            style={{
                                                padding: '1.5rem',
                                                borderLeft: '5px solid var(--primary)',
                                                borderRadius: '16px'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1.2rem',
                                                    flexWrap: 'wrap',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem' }}>
                                                        🏥 Visit on{' '}
                                                        {record.visitDate
                                                            ? new Date(record.visitDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })
                                                            : '—'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            color: 'var(--text-secondary)',
                                                            marginTop: '0.2rem'
                                                        }}
                                                    >
                                                        Doctor: {record.attendingDoctor || 'Hospital Staff'}
                                                    </div>
                                                </div>

                                                <span
                                                    style={{
                                                        padding: '0.3rem 0.9rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        background: statusStyle.background,
                                                        color: statusStyle.color
                                                    }}
                                                >
                                                    {record.status || 'Active'}
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                    gap: '1rem',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Patient Name
                                                    </div>
                                                    <div style={{ fontWeight: '600' }}>{record.patientFullName || userProfile.name}</div>
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Patient Username
                                                    </div>
                                                    <div style={{ fontWeight: '600' }}>{record.patientUsername || userProfile.username || '—'}</div>
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Gender
                                                    </div>
                                                    <div style={{ fontWeight: '600' }}>{record.gender || '—'}</div>
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Blood Group
                                                    </div>
                                                    <div style={{ fontWeight: '600' }}>{record.bloodGroup || '—'}</div>
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Date of Birth
                                                    </div>
                                                    <div style={{ fontWeight: '600' }}>
                                                        {record.dateOfBirth
                                                            ? new Date(record.dateOfBirth).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })
                                                            : '—'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-secondary)',
                                                            fontWeight: '700',
                                                            marginBottom: '0.3rem'
                                                        }}
                                                    >
                                                        Next Visit
                                                    </div>
                                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                        {record.nextVisitFollowUpDate
                                                            ? new Date(record.nextVisitFollowUpDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })
                                                            : '—'}
                                                    </div>
                                                </div>
                                            </div>

                                            {record.allergies && (
                                                <div
                                                    style={{
                                                        marginTop: '1rem',
                                                        padding: '0.8rem',
                                                        background: 'var(--primary-soft, rgba(67,97,238,0.06))',
                                                        borderRadius: '10px',
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    📝 Allergies: {record.allergies}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                        <div className="soft-card" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                                <div
                                    className="stat-icon"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        fontSize: '3rem',
                                        fontWeight: '800'
                                    }}
                                >
                                    {userProfile.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '2rem' }}>{userProfile.name}</h2>
                                    {userProfile.id && <p className="badge badge-info">ID: {userProfile.id}</p>}
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                                        @{userProfile.username}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label className="form-label">Role</label>
                                    <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>
                                        {userProfile.role}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Username</label>
                                    <div className="soft-card" style={{ padding: '1rem', boxShadow: 'var(--soft-shadow-sm)' }}>
                                        {userProfile.username}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="soft-card" style={{ padding: '2rem', height: 'fit-content' }}>
                            <h3>Security & Access</h3>
                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div
                                    className="glass-panel"
                                    style={{
                                        padding: '1.2rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '700' }}>2-Factor Auth</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Off</div>
                                    </div>
                                    <button className="btn btn-soft" style={{ padding: '0.5rem 1rem' }}>
                                        Enable
                                    </button>
                                </div>

                                <div
                                    className="glass-panel"
                                    style={{
                                        padding: '1.2rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
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

                {toastMsg && (
                    <div
                        style={{
                            position: 'fixed',
                            right: '1.5rem',
                            bottom: '1.5rem',
                            background: toastMsg.type === 'error' ? 'var(--danger)' : 'var(--success)',
                            color: '#fff',
                            padding: '0.9rem 1.2rem',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                            zIndex: 9999,
                            fontWeight: 700
                        }}
                    >
                        {toastMsg.text}
                    </div>
                )}
            </main>
        </div>
    );
}