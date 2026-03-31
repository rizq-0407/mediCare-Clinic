import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [toastMsg, setToastMsg] = useState(null);
    const [userProfile, setUserProfile] = useState({
        name: 'Patient Rizquan',
        id: 'PAT001',
        age: 24,
        email: 'rizquan@medicare.com',
        phone: '+94 77 123 4567',
        address: 'No 123, Main Street, Colombo',
        bloodGroup: 'O+',
        allergies: 'Penicillin, Dust'
    });

    const API_BASE_URL = 'http://localhost:8080/api';

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
            const response = await fetch(`${API_BASE_URL}/prescriptions`);
            if (!response.ok) throw new Error(`Server error ${response.status}`);
            const data = await response.json();
            // Filter prescriptions for this patient (mocked for now)
            setPrescriptions(data.filter(p => !p.patientId || p.patientId === 'PAT001'));
            setError(null);
        } catch (err) {
            setError('⚠️ Could not connect to the backend server. (' + err.message + ')');
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
            return { label: 'Pending', cls: 'badge-pending' };
        }
        return { label: 'Dispensed', cls: 'badge-completed' };
    };

    return (
        <div className="pt-layout">
            <aside className="pt-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">🏥</span>
                    <div>
                        <h2>MediCare</h2>
                        <p>Patient Portal</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <span className="nav-icon">📊</span>
                        <span>Overview</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        <span className="nav-icon">📋</span>
                        <span>My Prescriptions</span>
                        {prescriptions.length > 0 && <span className="nav-badge">{prescriptions.length}</span>}
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <span className="nav-icon">👤</span>
                        <span>Personal Info</span>
                    </button>
                    <button
                        className="nav-item ai-nav-item"
                        onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}
                    >
                        <span className="nav-icon">🤖</span>
                        <span>AI Assistant</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">R</div>
                        <div>
                            <p className="user-name">{userProfile.name}</p>
                            <p className="user-role">#PT-2024-001</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <span>⏻</span> Logout
                    </button>
                </div>
            </aside>

            <main className="pt-main">
                <header className="pt-topbar">
                    <div>
                        <h1 className="topbar-title">
                            {activeTab === 'overview' && 'Good Evening, ' + userProfile.name.split(' ')[1]}
                            {activeTab === 'prescriptions' && 'My Medical Records'}
                            {activeTab === 'profile' && 'Patient Profile'}
                        </h1>
                        <p className="topbar-subtitle">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="topbar-actions">
                        <button className="topbar-btn secondary" onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}>
                             Chat with AI Agent
                        </button>
                        <button className="topbar-logout-btn" onClick={handleLogout}>
                            <span>⏻</span> Logout
                        </button>
                    </div>
                </header>

                {toastMsg && (
                    <div className={`toast toast-${toastMsg.type}`}>
                        {toastMsg.text}
                    </div>
                )}

                {error && (
                    <div className="pt-error">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="overview-container">
                            <div className="pt-stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">💊</div>
                                    <div className="stat-info">
                                        <span className="stat-value">{prescriptions.length}</span>
                                        <span className="stat-label">Prescriptions</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-info">
                                        <span className="stat-value">0</span>
                                        <span className="stat-label">Appointments</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🩸</div>
                                    <div className="stat-info">
                                        <span className="stat-value">{userProfile.bloodGroup}</span>
                                        <span className="stat-label">Blood Type</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📍</div>
                                    <div className="stat-info">
                                        <span className="stat-value">Colombo</span>
                                        <span className="stat-label">Primary Clinic</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-sections">
                                <section className="db-section recent-records">
                                    <div className="section-header">
                                        <h3>Recent Prescriptions</h3>
                                        <button onClick={() => setActiveTab('prescriptions')}>View All</button>
                                    </div>
                                    <div className="records-list">
                                        {prescriptions.slice(0, 3).map(p => {
                                            const badge = getStatusBadge(p.status);
                                            return (
                                                <div key={p.id} className="record-item">
                                                    <div className="record-icon">📄</div>
                                                    <div className="record-details">
                                                        <p className="record-title">{p.medicineId}</p>
                                                        <p className="record-meta">{formatDate(p.createdAt)} • {p.dosage}</p>
                                                    </div>
                                                    <span className={`status-tag ${badge.cls}`}>{badge.label}</span>
                                                </div>
                                            );
                                        })}
                                        {prescriptions.length === 0 && <p className="empty-text">No recent records found.</p>}
                                    </div>
                                </section>

                                <section className="db-section quick-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="actions-grid">
                                        <button className="action-card" onClick={() => navigate('/agent-chat', { state: { role: 'patient' } })}>
                                            <span className="action-icon">🤖</span>
                                            <span>Start AI Chat</span>
                                            <p>Book appointments or ask health questions</p>
                                        </button>
                                        <button className="action-card" onClick={() => setActiveTab('profile')}>
                                            <span className="action-icon">📝</span>
                                            <span>Update Profile</span>
                                            <p>Keep your records up-to-date</p>
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prescriptions' && (
                        <div className="records-container">
                            <div className="section-header">
                                <h2>Prescription History</h2>
                                <p>Detailed records of all medicines prescribed to you</p>
                            </div>

                            {loading ? (
                                <div className="pt-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Retrieving your records...</p>
                                </div>
                            ) : prescriptions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📂</div>
                                    <h3>No prescriptions found</h3>
                                    <p>Your medical prescriptions will appear here once issued by a doctor.</p>
                                </div>
                            ) : (
                                <div className="pt-prescriptions-grid">
                                    {prescriptions.map(script => {
                                        const badge = getStatusBadge(script.status);
                                        return (
                                            <div key={script.id} className={`pt-card ${badge.cls}`}>
                                                <div className="pcard-header">
                                                    <div className="pcard-id">#{script.id}</div>
                                                    <span className={`status-badge ${badge.cls}`}>{badge.label}</span>
                                                </div>
                                                <div className="pcard-main">
                                                    <h3 className="med-name">{script.medicineId}</h3>
                                                    <div className="pcard-info">
                                                        <div className="info-row">
                                                            <span className="label">Dosage:</span>
                                                            <span className="val">{script.dosage}</span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="label">Duration:</span>
                                                            <span className="val">{script.duration}</span>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="label">Doctor:</span>
                                                            <span className="val">{script.doctorId || 'Hospital Staff'}</span>
                                                        </div>
                                                        {script.instructions && (
                                                            <div className="info-notes">
                                                                <p>Note: {script.instructions}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="pcard-footer">
                                                    <span>Issued on {formatDate(script.createdAt)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="profile-container">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar">R</div>
                                    <div className="profile-title">
                                        <h2>{userProfile.name}</h2>
                                        <p>Patient ID: {userProfile.id}</p>
                                    </div>
                                    <button className="edit-profile-btn">Edit Profile</button>
                                </div>
                                <div className="profile-grid">
                                    <div className="info-group">
                                        <label>Email Address</label>
                                        <p>{userProfile.email}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Phone Number</label>
                                        <p>{userProfile.phone}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Age</label>
                                        <p>{userProfile.age} Years</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Blood Group</label>
                                        <p>{userProfile.bloodGroup}</p>
                                    </div>
                                    <div className="info-group full">
                                        <label>Resident Address</label>
                                        <p>{userProfile.address}</p>
                                    </div>
                                    <div className="info-group full">
                                        <label>Medical Allergies</label>
                                        <div className="tag-list">
                                            {userProfile.allergies.split(',').map(tag => (
                                                <span key={tag} className="info-tag">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-panel">
                                <h3>Account Security</h3>
                                <div className="settings-row">
                                    <div>
                                        <p className="setting-name">Two-Factor Authentication</p>
                                        <p className="setting-desc">Secure your account with 2FA telephony</p>
                                    </div>
                                    <button className="toggle-btn">Enable</button>
                                </div>
                                <div className="settings-row">
                                    <div>
                                        <p className="setting-name">Data Encryption</p>
                                        <p className="setting-desc">Your medical records are end-to-end encrypted</p>
                                    </div>
                                    <span className="status-label verified">Active</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
