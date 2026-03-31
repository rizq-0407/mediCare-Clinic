import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MedicineList from '../components/MedicineList';
import MedicineForm from '../components/MedicineForm';
import PrescriptionForm from '../components/PrescriptionForm';
import './Pharmacy.css';

export default function Pharmacy() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [showMedicineForm, setShowMedicineForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('prescriptions');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api';

    useEffect(() => {
        fetchMedicines();
        fetchPrescriptions();
    }, []);

    const showToast = (msg, type = 'success') => {
        setToastMsg({ text: msg, type });
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/medicines`);
            if (!response.ok) throw new Error(`Server error ${response.status}`);
            const data = await response.json();
            setMedicines(data);
            setError(null);
        } catch (err) {
            setError('⚠️ Could not connect to the backend server. (' + err.message + ')');
        } finally {
            setLoading(false);
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/prescriptions`);
            if (!response.ok) throw new Error(`Server error ${response.status}`);
            const data = await response.json();
            setPrescriptions(data);
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
        }
    };

    // ──── Medicine CRUD ────────────────────────────────────────────────
    const handleAddMedicine = async (medicineData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medicines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicineData)
            });
            if (!response.ok) throw new Error('Failed to add medicine');
            const newMedicine = await response.json();
            setMedicines([...medicines, newMedicine]);
            setShowMedicineForm(false);
            showToast('Medicine added successfully!');
        } catch (err) {
            setError('Error adding medicine: ' + err.message);
        }
    };

    const handleUpdateMedicine = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update medicine');
            const updated = await response.json();
            setMedicines(medicines.map(m => m.id === id ? updated : m));
            setEditingMedicine(null);
            setShowMedicineForm(false);
            showToast('Medicine updated!');
        } catch (err) {
            setError('Error updating medicine: ' + err.message);
        }
    };

    const handleDeleteMedicine = async (id) => {
        if (window.confirm('Delete this medicine from stock?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/medicines/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const errData = await response.json().catch(() => null);
                    throw new Error((errData && errData.error) ? errData.error : 'Failed to delete medicine');
                }
                setMedicines(medicines.filter(m => m.id !== id));
                showToast('Medicine removed from stock.', 'info');
            } catch (err) {
                setError('Error deleting medicine: ' + err.message);
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
            const response = await fetch(`${API_BASE_URL}/prescriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prescriptionData)
            });
            if (!response.ok) throw new Error('Failed to add prescription');
            const newPrescription = await response.json();
            setPrescriptions([...prescriptions, newPrescription]);
            setShowPrescriptionForm(false);
            showToast('Prescription sent to pharmacy (Pending)!');
        } catch (err) {
            setError('Error adding prescription: ' + err.message);
        }
    };

    // ──── Pharmacist: update prescription status ────────────────────────
    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Failed to update status');
            const updated = await response.json();
            setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, status: updated.status } : p));
            showToast(`✅ Prescription marked as ${newStatus}!`);
        } catch (err) {
            setError('Error updating status: ' + err.message);
        }
    };

    const handleDeletePrescription = async (id) => {
        if (window.confirm('Delete this prescription?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete prescription');
                setPrescriptions(prescriptions.filter(p => p.id !== id));
                showToast('Prescription deleted.', 'info');
            } catch (err) {
                setError('Error deleting prescription: ' + err.message);
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

    const mockPatients = [
        { id: 'PAT001', name: 'Patient Rizquan' },
        { id: 'PAT002', name: 'Patient John' }
    ];

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
                    <button
                        id="tab-prescriptions"
                        className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        <span className="nav-icon">📋</span>
                        <span>Prescriptions</span>
                        {pendingCount > 0 && <span className="nav-badge nav-badge-warn">{pendingCount}</span>}
                    </button>
                    <button
                        id="tab-medicines"
                        className={`nav-item ${activeTab === 'medicines' ? 'active' : ''}`}
                        onClick={() => setActiveTab('medicines')}
                    >
                        <span className="nav-icon">💊</span>
                        <span>Medicine Stock</span>
                        {lowStockCount > 0 && <span className="nav-badge nav-badge-warn">{lowStockCount}</span>}
                    </button>
                    <button
                        id="tab-new-prescription"
                        className={`nav-item ${activeTab === 'new-prescription' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('new-prescription'); setShowPrescriptionForm(true); }}
                    >
                        <span className="nav-icon">✍️</span>
                        <span>New Prescription</span>
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
                        <h1 className="topbar-title">
                            {activeTab === 'prescriptions' && 'Prescription Dashboard'}
                            {activeTab === 'medicines' && 'Medicine Stock'}
                            {activeTab === 'new-prescription' && 'Create Prescription'}
                        </h1>
                        <p className="topbar-subtitle">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
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
                        {/* Stats row */}
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="stat-card stat-pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <span className="stat-value">{pendingCount}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                            </div>
                            <div className="stat-card stat-completed">
                                <div className="stat-icon">💊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{dispensedCount}</span>
                                    <span className="stat-label">Dispensed</span>
                                </div>
                            </div>
                            <div className="stat-card stat-total">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <span className="stat-value">{prescriptions.length}</span>
                                    <span className="stat-label">Total</span>
                                </div>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="filter-bar">
                            <span className="filter-label">Filter by Status:</span>
                            {['ALL', 'Pending', 'Dispensed'].map(f => (
                                <button
                                    key={f}
                                    className={`filter-btn ${statusFilter === f ? 'filter-active' : ''}`}
                                    onClick={() => setStatusFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Prescriptions list */}
                        <div className="prescriptions-grid">
                            {filteredPrescriptions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📭</div>
                                    <h3>No prescriptions found</h3>
                                    <p>
                                        {statusFilter !== 'ALL'
                                            ? `No ${statusFilter.toLowerCase()} prescriptions at this time.`
                                            : 'No prescriptions have been sent yet.'}
                                    </p>
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
                                                    <span className="pcard-icon">📄</span>
                                                    <span>#{script.id}</span>
                                                </div>
                                                <span className={`status-badge ${badge.cls}`}>{badge.label}</span>
                                            </div>

                                            <div className="pcard-body">
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">👤 Patient</span>
                                                    <span className="pcard-field-val">{script.patientId || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">🩺 Doctor</span>
                                                    <span className="pcard-field-val">{script.doctorId || '—'}</span>
                                                </div>
                                                <div className="pcard-row">
                                                    <span className="pcard-field-label">💊 Medicine</span>
                                                    <span className="pcard-field-val">{script.medicineId || '—'}</span>
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
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Medicine Inventory</h2>
                                <p className="section-sub">{medicines.length} items in stock</p>
                            </div>
                            <button
                                className="ph-btn ph-btn-primary"
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
                                patients={mockPatients}
                                onCancel={() => setActiveTab('prescriptions')}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}