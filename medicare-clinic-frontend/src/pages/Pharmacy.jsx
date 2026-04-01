import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineList from '../components/MedicineList';
import MedicineForm from '../components/MedicineForm';
import PrescriptionForm from '../components/PrescriptionForm';
import API from '../services/api';
import './Pharmacy.css';

export default function Pharmacy() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [showMedicineForm, setShowMedicineForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('prescriptions');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState(null);

    useEffect(() => {
        fetchMedicines();
        fetchPrescriptions();
        fetchPatients();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToastMsg({ text: msg, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await API.get('/medicines');
            setMedicines(response.data || []);
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            const isNetworkError = !err.response;
            setError(
                isNetworkError
                    ? '🔌 Backend is offline — make sure Spring Boot is running on port 8080.'
                    : `⚠️ Server error: ${msg}`
            );
            setMedicines([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await API.get('/prescriptions');
            setPrescriptions(response.data || []);
        } catch (err) {
            console.error('Error fetching prescriptions:', err.message);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await API.get('/users/patients');
            setPatients(response.data || []);
        } catch (err) {
            console.error('Error fetching patients:', err.message);
        }
    };

    // ──── Medicine CRUD ────────────────────────────────────────────────
    const handleAddMedicine = async (medicineData) => {
        try {
            const response = await API.post('/medicines', medicineData);
            setMedicines([...medicines, response.data]);
            setShowMedicineForm(false);
            showToast('Medicine added successfully!');
        } catch (err) {
            setError('Error adding medicine: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateMedicine = async (id, updatedData) => {
        try {
            const response = await API.put(`/medicines/${id}`, updatedData);
            setMedicines(medicines.map(m => m.id === id ? response.data : m));
            setEditingMedicine(null);
            setShowMedicineForm(false);
            showToast('Medicine updated!');
        } catch (err) {
            setError('Error updating medicine: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (window.confirm('Delete this medicine from stock?')) {
            try {
                await API.delete(`/medicines/${id}`);
                setMedicines(medicines.filter(m => m.id !== id));
                showToast('Medicine removed from stock.', 'info');
            } catch (err) {
                setError('Error deleting medicine: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleEditMedicine = (medicine) => {
        setEditingMedicine(medicine);
        setShowMedicineForm(true);
    };

    // ──── Prescription CRUD ────────────────────────────────────────────
    const handleAddPrescription = async (prescriptionData) => {
        try {
            const response = await API.post('/prescriptions', prescriptionData);
            setPrescriptions([...prescriptions, response.data]);
            setShowPrescriptionForm(false);
            showToast('Prescription sent to pharmacy (Pending)!');
        } catch (err) {
            setError('Error adding prescription: ' + (err.response?.data?.message || err.message));
        }
    };

    // ──── Pharmacist: update prescription status ────────────────────────
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await API.patch(`/prescriptions/${id}/status`, { status: newStatus });
            setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: response.data.status } : p));
            showToast(`✅ Prescription marked as ${newStatus}!`);
        } catch (err) {
            setError('Error updating status: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeletePrescription = async (id) => {
        if (window.confirm('Delete this prescription?')) {
            try {
                await API.delete(`/prescriptions/${id}`);
                setPrescriptions(prescriptions.filter(p => p.id !== id));
                showToast('Prescription deleted.', 'info');
            } catch (err) {
                setError('Error deleting prescription: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    // ──── Stats (Normalized mapping) ──────────────────────────────────
    const isPending = (status) => !status || status === 'Pending' || status === 'NEW' || status === 'PENDING';
    const isDispensed = (status) => status === 'Dispensed' || status === 'COMPLETED';

    const pendingCount = prescriptions.filter(p => isPending(p.status)).length;
    const dispensedCount = prescriptions.filter(p => isDispensed(p.status)).length;
    const lowStockCount = medicines.filter(m => (m.quantity || m.stock || 0) < 10).length;

    // ──── Filtered prescriptions ───────────────────────────────────────
    const filteredPrescriptions = statusFilter === 'ALL'
        ? prescriptions
        : prescriptions.filter(p => {
              if (statusFilter === 'Pending') return isPending(p.status);
              if (statusFilter === 'Dispensed') return isDispensed(p.status);
              return false;
          });

    const formatDate = (dateString) => {
        if (!dateString) return 'Today';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        if (isPending(status)) {
            return { label: 'Pending', cls: 'badge-pending' };
        }
        return { label: 'Dispensed', cls: 'badge-completed' };
    };


    return (
        <div className="ph-layout">
            <aside className="ph-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">💊</span>
                    <div>
                        <h2>MediCare</h2>
                        <p>Pharmacy Module</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
                        <span className="nav-icon">📋</span> Queue
                        {pendingCount > 0 && <span className="nav-badge nav-badge-warn">{pendingCount}</span>}
                    </button>
                    <button className={`nav-item ${activeTab === 'medicines' ? 'active' : ''}`} onClick={() => setActiveTab('medicines')}>
                        <span className="nav-icon">💊</span> Inventory
                        {lowStockCount > 0 && <span className="nav-badge nav-badge-warn">{lowStockCount} low</span>}
                    </button>
                    <button className={`nav-item ${activeTab === 'new-prescription' ? 'active' : ''}`} onClick={() => { setActiveTab('new-prescription'); setShowPrescriptionForm(true); }}>
                        <span className="nav-icon">✍️</span> New Script
                    </button>
                    <button
                        id="tab-ai-agent"
                        className="nav-item"
                        onClick={() => navigate('/agent-chat', { state: { role: 'pharmacist' } })}
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', marginTop: '1rem', borderRadius: '8px' }}
                    >
                        <span className="nav-icon">🤖</span>
                        <span>AI Assistant</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar">P</div>
                        <div>
                            <p className="user-name">Pharmacist</p>
                            <p className="user-role">On Duty</p>
                        </div>
                    </div>
                    <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
                        <span>⏻</span>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="ph-main">
                <header className="ph-topbar">
                    <div>
                        <h1 className="topbar-title">Pharmacy Dashboard</h1>
                        <p className="topbar-subtitle">Manage medication queue and inventory</p>
                    </div>
                    <button className="topbar-logout-btn" onClick={handleLogout}>
                        <span>⏻</span> Logout
                    </button>
                </header>

                {toastMsg && (
                    <div className={`toast toast-${toastMsg.type}`}>
                        {toastMsg.text}
                    </div>
                )}

                {error && (
                    <div className="ph-error">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="tab-content">
                        <div className="stats-grid">
                            <div className="stat-card stat-pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <div className="stat-label">Pending</div>
                                    <div className="stat-value">{pendingCount}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-completed">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <div className="stat-label">Dispensed</div>
                                    <div className="stat-value">{dispensedCount}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-total">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Scripts</div>
                                    <div className="stat-value">{prescriptions.length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="filter-bar">
                            <span className="filter-label">Filter:</span>
                            <button
                                className={`filter-btn ${statusFilter === 'ALL' ? 'filter-active' : ''}`}
                                onClick={() => setStatusFilter('ALL')}
                            >All Scripts</button>
                            <button
                                className={`filter-btn ${statusFilter === 'Pending' ? 'filter-active' : ''}`}
                                onClick={() => setStatusFilter('Pending')}
                            >Pending Only</button>
                            <button
                                className={`filter-btn ${statusFilter === 'Dispensed' ? 'filter-active' : ''}`}
                                onClick={() => setStatusFilter('Dispensed')}
                            >Dispensed Only</button>
                        </div>

                        <div className="prescriptions-grid">
                            {filteredPrescriptions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No prescriptions found</h3>
                                    <p>{statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} prescriptions match your filter.` : 'The pharmacy queue is currently empty.'}</p>
                                </div>
                            ) : (
                                filteredPrescriptions.map(script => {
                                    const badge = getStatusBadge(script.status);
                                    return (
                                        <div
                                            key={script.id}
                                            className={`prescription-card ${badge.cls}`}
                                        >
                                            <div className="pcard-header">
                                                <div className="pcard-id">
                                                    <span className="pcard-icon">💊</span>
                                                    <span>#{script.id}</span>
                                                </div>
                                                <span className={`status-badge ${badge.cls}`}>{badge.label}</span>
                                            </div>

                                            <div className="pcard-body">
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">👤 Patient</span>
                                                    <span className="pcard-field-val" style={{ fontWeight: '700' }}>{script.patientName || script.patientId || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">🩺 Doctor</span>
                                                    <span className="pcard-field-val">{script.doctorName || script.doctorId || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">💊 Medicine</span>
                                                    <span className="pcard-field-val" style={{ color: 'var(--primary)', fontWeight: '700' }}>{script.medicineName || script.medicineId || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">📏 Dosage</span>
                                                    <span className="pcard-field-val">{script.dosage || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">📅 Duration</span>
                                                    <span className="pcard-field-val">{script.duration || '—'}</span>
                                                </div>
                                                {script.instructions && (
                                                    <div className="pcard-notes">
                                                        <span>📝 {script.instructions}</span>
                                                    </div>
                                                )}
                                                <div className="pcard-date">
                                                    🗓 {formatDate(script.createdAt)}
                                                </div>
                                            </div>

                                            <div className="pcard-actions">
                                                {isPending(script.status) && (
                                                    <button
                                                        className="action-btn btn-complete"
                                                        onClick={() => handleUpdateStatus(script.id, 'Dispensed')}
                                                    >
                                                        💊 Mark Dispensed
                                                    </button>
                                                )}
                                                {isDispensed(script.status) && (
                                                    <span className="completed-label">✔ Dispensed</span>
                                                )}
                                                <button
                                                    className="action-btn btn-danger"
                                                    onClick={() => handleDeletePrescription(script.id)}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'medicines' && (
                    <div className="tab-content">
                        <div className="medicine-inventory-header">
                            <div>
                                <h2 className="section-title">Medicine Inventory</h2>
                                <p className="section-sub">{medicines.length} items in stock</p>
                            </div>
                            <button
                                className="ph-btn-primary"
                                onClick={() => { setShowMedicineForm(!showMedicineForm); setEditingMedicine(null); }}
                            >
                                {showMedicineForm ? '✕ Cancel' : '+ Add Medicine'}
                            </button>
                        </div>

                        {showMedicineForm && (
                            <div className="ph-form-panel">
                                <h3>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                                <MedicineForm
                                    onSubmit={editingMedicine
                                        ? (data) => handleUpdateMedicine(editingMedicine.id, data)
                                        : handleAddMedicine}
                                    initialData={editingMedicine}
                                    onCancel={() => { setShowMedicineForm(false); setEditingMedicine(null); }}
                                />
                            </div>
                        )}

                        {loading ? (
                            <div className="ph-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading medicine inventory...</p>
                            </div>
                        ) : medicines.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">💊</div>
                                <h3>No medicines in stock</h3>
                                <p>Add medicines to start tracking inventory.</p>
                            </div>
                        ) : (
                            <MedicineList
                                medicines={medicines}
                                onEdit={handleEditMedicine}
                                onDelete={handleDeleteMedicine}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'new-prescription' && (
                    <div className="tab-content">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Create New Prescription</h2>
                                <p className="section-sub">Doctor fills this form; it will appear in the pharmacy dashboard</p>
                            </div>
                        </div>
                        <div className="ph-form-panel">
                            <PrescriptionForm
                                onSubmit={handleAddPrescription}
                                medicines={medicines}
                                patients={patients}
                                onCancel={() => setActiveTab('prescriptions')}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}