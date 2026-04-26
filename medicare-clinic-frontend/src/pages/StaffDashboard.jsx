import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './StaffDashboard.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatAMPM = (time24) => {
  if (!time24) return '—';
  const [h, m] = time24.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${m} ${ampm}`;
};

const statusColor = (status) => {
  const map = {
    Scheduled: '#0ea5e9',
    Completed: '#10b981',
    Cancelled: '#ef4444',
    Pending: '#f59e0b',
    Dispensed: '#6366f1',
  };
  return map[status] || '#64748b';
};

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ icon, label, tabKey, activeTab, onClick }) => (
  <button
    className={`staff-nav-item ${activeTab === tabKey ? 'active' : ''}`}
    onClick={() => onClick(tabKey)}
    id={`staff-nav-${tabKey}`}
  >
    <span className="staff-nav-icon">{icon}</span>
    <span className="staff-nav-label">{label}</span>
    {activeTab === tabKey && <span className="staff-nav-indicator" />}
  </button>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="staff-stat-card" style={{ '--accent-color': color }}>
    <div className="staff-stat-icon" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="staff-stat-body">
      <div className="staff-stat-label">{label}</div>
      <div className="staff-stat-value">{value}</div>
      {sub && <div className="staff-stat-sub">{sub}</div>}
    </div>
  </div>
);

// ─── Toast Notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`staff-toast staff-toast-${type}`}>
    <span>{message}</span>
    <button onClick={onClose}>✕</button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function StaffDashboard() {
  const navigate = useNavigate();

  // Auth
  const staffUsername = localStorage.getItem('username') || '';
  const staffFullName = localStorage.getItem('fullName') || 'Staff Member';
  const staffId = localStorage.getItem('userId') || '';

  // UI
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [emrRecords, setEmrRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState({ appts: false, schedules: false, emr: false, patients: false });

  // Appointment booking form
  const [bookingForm, setBookingForm] = useState({
    patientUsername: '',
    scheduleId: '',
    symptoms: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // EMR search
  const [emrSearch, setEmrSearch] = useState('');
  const [emrPatientFilter, setEmrPatientFilter] = useState('');

  // EMR Create Form
  const [emrForm, setEmrForm] = useState({
    patientFullName: '',
    patientUsername: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    allergies: '',
    attendingDoctor: '',
    visitDate: new Date().toISOString().split('T')[0],
    nextVisitFollowUpDate: '',
    status: 'Active',
  });
  const [emrSubmitting, setEmrSubmitting] = useState(false);

  // Appointment filter
  const [apptStatusFilter, setApptStatusFilter] = useState('all');

  // ── Show toast ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(prev => ({ ...prev, appts: true }));
    try {
      const res = await API.get('/appointments');
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Fallback mock
      setAppointments([
        { id: 1, patientUsername: 'johndoe', employeeUsername: 'drjames', appointmentDate: '2026-04-22T10:00:00', status: 'Scheduled', symptoms: 'Fever and cough' },
        { id: 2, patientUsername: 'janesmith', employeeUsername: 'drjames', appointmentDate: '2026-04-23T14:00:00', status: 'Completed', symptoms: 'Headache' },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, appts: false }));
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(prev => ({ ...prev, schedules: true }));
    try {
      const res = await API.get('/schedules');
      setSchedules(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSchedules([
        { id: 1, doctorName: 'drjames', specialization: 'Cardiology', date: '2026-04-22', time: '10:00', roomNumber: 'Room 101', availableSlots: 5 },
        { id: 2, doctorName: 'drjames', specialization: 'General', date: '2026-04-23', time: '14:00', roomNumber: 'Room 203', availableSlots: 3 },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, schedules: false }));
    }
  }, []);

  const fetchEmr = useCallback(async () => {
    setLoading(prev => ({ ...prev, emr: true }));
    try {
      const res = await API.get('/emr');
      setEmrRecords(Array.isArray(res.data) ? res.data : []);
    } catch {
      setEmrRecords([
        { id: 1, patientUsername: 'johndoe', doctorName: 'Dr. James Wilson', diagnosis: 'Hypertension', treatmentPlan: 'Medication + Lifestyle changes', visitDate: '2026-04-10', notes: 'Follow up in 30 days' },
        { id: 2, patientUsername: 'janesmith', doctorName: 'Dr. James Wilson', diagnosis: 'Migraine', treatmentPlan: 'Pain management', visitDate: '2026-04-15', notes: 'Avoid triggers' },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, emr: false }));
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    setLoading(prev => ({ ...prev, patients: true }));
    try {
      const res = await API.get('/users');
      const patientList = Array.isArray(res.data)
        ? res.data.filter(u => u.role === 'PATIENT' || u.role === 'Patient')
        : [];
      setPatients(patientList);
    } catch {
      setPatients([
        { id: 1, username: 'johndoe', fullName: 'John Doe', email: 'john@gmail.com', contactNumber: '5550101' },
        { id: 2, username: 'janesmith', fullName: 'Jane Smith', email: 'jane@gmail.com', contactNumber: '5550102' },
      ]);
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  }, []);

  // ── Load data on tab switch ─────────────────────────────────────────────────
  useEffect(() => {
    fetchPatients();
    fetchSchedules();
    if (activeTab === 'overview' || activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'overview' || activeTab === 'emr') fetchEmr();
  }, [activeTab]);

  // ── Book appointment ────────────────────────────────────────────────────────
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingForm.patientUsername || !bookingForm.scheduleId) {
      showToast('Please select a patient and a schedule slot.', 'error');
      return;
    }
    setBookingLoading(true);
    try {
      await API.post(
        `/schedules/book/${bookingForm.scheduleId}`,
        null,
        { params: { patientId: bookingForm.patientUsername } }
      );
      showToast('Appointment booked successfully!');
      setBookingForm({ patientUsername: '', scheduleId: '', symptoms: '' });
      fetchAppointments();
      fetchSchedules();
    } catch (err) {
      // Offline fallback
      const selSchedule = schedules.find(s => String(s.id) === bookingForm.scheduleId);
      if (selSchedule) {
        const newAppt = {
          id: Date.now(),
          patientUsername: bookingForm.patientUsername,
          employeeUsername: selSchedule.doctorName,
          appointmentDate: `${selSchedule.date}T${selSchedule.time}:00`,
          status: 'Scheduled',
          symptoms: bookingForm.symptoms,
        };
        setAppointments(prev => [newAppt, ...prev]);
        showToast('Appointment booked (offline mode)!');
        setBookingForm({ patientUsername: '', scheduleId: '', symptoms: '' });
      } else {
        showToast(err.response?.data?.message || 'Booking failed.', 'error');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Cancel appointment ──────────────────────────────────────────────────────
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      fetchAppointments();
      showToast('Appointment cancelled.');
    } catch {
      setAppointments(prev => prev.filter(a => a.id !== id));
      showToast('Appointment removed (offline mode).');
    }
  };

  // ── Approve appointment ─────────────────────────────────────────────────────
  const handleApproveAppointment = async (id) => {
    try {
      await API.patch(`/appointments/${id}/status`, { status: 'Scheduled' });
      fetchAppointments();
      showToast('Appointment approved successfully!');
    } catch (err) {
      showToast('Failed to approve appointment.', 'error');
    }
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const availableSlots = schedules.reduce((acc, s) => acc + (s.availableSlots || 0), 0);

  const filteredAppointments = apptStatusFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === apptStatusFilter);

  const filteredEmr = emrRecords.filter(r => {
    const q = emrSearch.toLowerCase();
    return (
      (r.patientUsername || '').toLowerCase().includes(q) ||
      (r.diagnosis || '').toLowerCase().includes(q) ||
      (r.doctorName || '').toLowerCase().includes(q)
    ) && (!emrPatientFilter || r.patientUsername === emrPatientFilter);
  });

  // ── Create EMR ─────────────────────────────────────────────────────────────
  const handleCreateEmr = async (e) => {
    e.preventDefault();
    if (!emrForm.patientUsername || !emrForm.patientFullName || !emrForm.visitDate) {
      showToast('Patient name, username, and visit date are required.', 'error');
      return;
    }
    setEmrSubmitting(true);
    try {
      // Clean up empty strings for dates
      const payload = { ...emrForm };
      if (!payload.dateOfBirth) payload.dateOfBirth = null;
      if (!payload.nextVisitFollowUpDate) payload.nextVisitFollowUpDate = null;
      
      await API.post('/emr', payload);
      showToast('Medical record created successfully!');
      setEmrForm({
        patientFullName: '',
        patientUsername: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        allergies: '',
        attendingDoctor: '',
        visitDate: new Date().toISOString().split('T')[0],
        nextVisitFollowUpDate: '',
        status: 'Active',
      });
      setActiveTab('emr');
      fetchEmr();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create record.', 'error');
    } finally {
      setEmrSubmitting(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="staff-layout">
      {/* Background decor */}
      <div className="staff-bg">
        <div className="staff-orb staff-orb-1" />
        <div className="staff-orb staff-orb-2" />
        <div className="staff-bg-symbol">☤</div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="staff-sidebar">
        <div className="staff-logo">
          <div className="staff-logo-mark">M</div>
          <div>
            <div className="staff-logo-text">MediCare</div>
            <div className="staff-logo-sub">Staff Portal</div>
          </div>
        </div>

        <nav className="staff-nav">
          <NavItem icon="🏠" label="Overview"     tabKey="overview"     activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="📅" label="Appointments" tabKey="appointments" activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="➕" label="Book Appointment" tabKey="book"     activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="📋" label="EMR Records"  tabKey="emr"          activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="📝" label="Create EMR"   tabKey="create-emr"   activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="🏥" label="Schedules"    tabKey="schedules"    activeTab={activeTab} onClick={setActiveTab} />
          <NavItem icon="👥" label="Patients"     tabKey="patients"     activeTab={activeTab} onClick={setActiveTab} />
        </nav>

        <div className="staff-sidebar-footer">
          <div className="staff-user-card">
            <div className="staff-avatar">{staffFullName.charAt(0).toUpperCase()}</div>
            <div className="staff-user-info">
              <div className="staff-user-name">{staffFullName}</div>
              <div className="staff-user-role">
                <span className="staff-role-badge">STAFF</span>
                {staffId && <span className="staff-user-id">{staffId}</span>}
              </div>
            </div>
          </div>
          <button className="staff-logout-btn" onClick={() => navigate('/agent-chat', { state: { role: 'staff' } })} style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', marginBottom: '0.5rem', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span>🤖</span> AI Assistant
          </button>
          <button className="staff-logout-btn" onClick={handleLogout} id="staff-logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="staff-main">
        {/* Header */}
        <header className="staff-header">
          <div>
            <h1 className="staff-page-title">
              {activeTab === 'overview' && '👋 Welcome Back'}
              {activeTab === 'appointments' && '📅 Appointment Management'}
              {activeTab === 'book' && '➕ Book an Appointment'}
              {activeTab === 'emr' && '📋 Patient EMR Records'}
              {activeTab === 'create-emr' && '📝 Create New EMR Record'}
              {activeTab === 'schedules' && '🏥 Doctor Schedules'}
              {activeTab === 'patients' && '👥 Patient Directory'}
            </h1>
            <p className="staff-page-subtitle">
              {activeTab === 'overview' && `Hello, ${staffFullName}. Here's your daily summary.`}
              {activeTab === 'appointments' && 'View and manage all patient appointments.'}
              {activeTab === 'book' && 'Schedule a new appointment for a patient.'}
              {activeTab === 'emr' && 'Browse and search patient medical records.'}
              {activeTab === 'create-emr' && 'Formally register a new clinical visit or medical record.'}
              {activeTab === 'schedules' && 'View available doctor schedule slots.'}
              {activeTab === 'patients' && 'All registered patients in the system.'}
            </p>
          </div>
          <div className="staff-header-badge">
            <span className="staff-online-dot" />
            <span>System Online</span>
          </div>
        </header>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="staff-tab-content animate-fade-in">
            <div className="staff-stats-grid">
              <StatCard icon="📅" label="Total Appointments" value={appointments.length}   color="#0ea5e9" sub={`${scheduledCount} upcoming`} />
              <StatCard icon="✅" label="Completed Today"    value={completedCount}         color="#10b981" sub="appointments done" />
              <StatCard icon="🏥" label="Available Slots"   value={availableSlots}          color="#6366f1" sub="across all doctors" />
              <StatCard icon="📋" label="EMR Records"        value={emrRecords.length}       color="#f59e0b" sub="in the system" />
              <StatCard icon="👥" label="Registered Patients" value={patients.length}        color="#ec4899" sub="active patients" />
            </div>

            {/* Quick actions */}
            <div className="staff-quick-actions">
              <button className="staff-quick-btn" style={{ '--qc': '#0ea5e9' }} onClick={() => setActiveTab('book')} id="quick-book-btn">
                <span className="staff-quick-icon">➕</span>
                <div>
                  <div className="staff-quick-title">Book Appointment</div>
                  <div className="staff-quick-desc">Schedule a patient visit</div>
                </div>
              </button>
              <button className="staff-quick-btn" style={{ '--qc': '#6366f1' }} onClick={() => setActiveTab('emr')} id="quick-emr-btn">
                <span className="staff-quick-icon">📋</span>
                <div>
                  <div className="staff-quick-title">View EMR</div>
                  <div className="staff-quick-desc">Browse patient records</div>
                </div>
              </button>
              <button className="staff-quick-btn" style={{ '--qc': '#10b981' }} onClick={() => setActiveTab('appointments')} id="quick-appt-btn">
                <span className="staff-quick-icon">📅</span>
                <div>
                  <div className="staff-quick-title">Appointments</div>
                  <div className="staff-quick-desc">Manage all bookings</div>
                </div>
              </button>
              <button className="staff-quick-btn" style={{ '--qc': '#f59e0b' }} onClick={() => setActiveTab('schedules')} id="quick-schedule-btn">
                <span className="staff-quick-icon">🏥</span>
                <div>
                  <div className="staff-quick-title">Schedules</div>
                  <div className="staff-quick-desc">Check doctor availability</div>
                </div>
              </button>
            </div>

            {/* Recent appointments preview */}
            <div className="staff-card" style={{ marginTop: '2rem' }}>
              <div className="staff-card-header">
                <h3>Recent Appointments</h3>
                <button className="staff-link-btn" onClick={() => setActiveTab('appointments')}>View all →</button>
              </div>
              {appointments.slice(0, 4).map(appt => (
                <div key={appt.appointmentId || appt.id} className="staff-appt-row">
                  <div className="staff-appt-avatar">{(appt.patientName || appt.patientUsername || 'P').charAt(0).toUpperCase()}</div>
                  <div className="staff-appt-info">
                    <div className="staff-appt-patient">{appt.patientName || appt.patientUsername}</div>
                    <div className="staff-appt-meta">
                      👨‍⚕️ {appt.doctorName || appt.employeeUsername} &nbsp;·&nbsp;
                      🕒 {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleString() : '—'}
                    </div>
                  </div>
                  <span className="staff-status-badge" style={{ background: `${statusColor(appt.status)}18`, color: statusColor(appt.status) }}>
                    {appt.status}
                  </span>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="staff-empty">No appointments found.</div>
              )}
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ─────────────────────────────────────────── */}
        {activeTab === 'appointments' && (
          <div className="staff-tab-content animate-fade-in">
            {/* Filter bar */}
            <div className="staff-filter-bar">
              {['all', 'Pending', 'Scheduled', 'Completed', 'Cancelled'].map(s => (
                <button
                  key={s}
                  className={`staff-filter-chip ${apptStatusFilter === s ? 'active' : ''}`}
                  onClick={() => setApptStatusFilter(s)}
                  id={`filter-${s.toLowerCase()}`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
              <div className="staff-filter-count">{filteredAppointments.length} records</div>
            </div>

            {loading.appts ? (
              <div className="staff-loading">
                <div className="staff-spinner" />
                <p>Loading appointments…</p>
              </div>
            ) : (
              <div className="staff-card">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date & Time</th>
                      <th>Symptoms</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(appt => (
                      <tr key={appt.appointmentId || appt.id}>
                        <td>
                          <div className="staff-table-user">
                            <div className="staff-table-avatar">{(appt.patientName || appt.patientUsername || 'P').charAt(0).toUpperCase()}</div>
                            <span>{appt.patientName || appt.patientUsername}</span>
                          </div>
                        </td>
                        <td><span className="staff-doc-name">👨‍⚕️ {appt.doctorName || appt.employeeUsername}</span></td>
                        <td>
                          <span className="staff-date-chip">
                            {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString() : '—'}
                          </span>
                          <span className="staff-time-chip">
                            {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td className="staff-symptoms">{appt.symptoms || '—'}</td>
                        <td>
                          <span className="staff-status-badge" style={{ background: `${statusColor(appt.status)}18`, color: statusColor(appt.status) }}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          {appt.status === 'Pending' && (
                            <button
                              className="staff-btn"
                              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', marginRight: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={() => handleApproveAppointment(appt.appointmentId || appt.id)}
                              id={`approve-appt-${appt.appointmentId || appt.id}`}
                            >
                              Approve
                            </button>
                          )}
                          {(appt.status === 'Scheduled' || appt.status === 'Pending') && (
                            <button
                              className="staff-danger-btn"
                              onClick={() => handleCancelAppointment(appt.appointmentId || appt.id)}
                              id={`cancel-appt-${appt.appointmentId || appt.id}`}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                  <div className="staff-empty">No appointments match the selected filter.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── BOOK APPOINTMENT TAB ─────────────────────────────────────── */}
        {activeTab === 'book' && (
          <div className="staff-tab-content animate-fade-in">
            <div className="staff-book-layout">
              {/* Booking Form */}
              <div className="staff-card staff-book-form-card">
                <div className="staff-card-header">
                  <h3>📝 New Appointment</h3>
                  <span className="staff-badge">Staff Action</span>
                </div>
                <form onSubmit={handleBookAppointment} id="book-appt-form">
                  <div className="staff-form-group">
                    <label className="staff-label">Patient *</label>
                    <select
                      className="staff-select"
                      value={bookingForm.patientUsername}
                      onChange={e => setBookingForm(prev => ({ ...prev, patientUsername: e.target.value }))}
                      required
                      id="book-patient-select"
                    >
                      <option value="">— Select Patient —</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.username}>
                          {p.fullName || p.username} ({p.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="staff-form-group">
                    <label className="staff-label">Doctor Schedule Slot *</label>
                    <select
                      className="staff-select"
                      value={bookingForm.scheduleId}
                      onChange={e => setBookingForm(prev => ({ ...prev, scheduleId: e.target.value }))}
                      required
                      id="book-schedule-select"
                    >
                      <option value="">— Select Schedule —</option>
                      {schedules.filter(s => (s.availableSlots || 0) > 0).map(s => (
                        <option key={s.id} value={s.id}>
                          Dr. {s.doctorName} | {s.specialization} | {s.date} {formatAMPM(s.time)} | Room {s.roomNumber} | {s.availableSlots} slots
                        </option>
                      ))}
                    </select>
                    {schedules.filter(s => (s.availableSlots || 0) > 0).length === 0 && (
                      <div className="staff-hint">⚠️ No available schedule slots found.</div>
                    )}
                  </div>

                  <div className="staff-form-group">
                    <label className="staff-label">Symptoms / Reason</label>
                    <textarea
                      className="staff-textarea"
                      rows={4}
                      placeholder="Describe the patient's symptoms or reason for visit…"
                      value={bookingForm.symptoms}
                      onChange={e => setBookingForm(prev => ({ ...prev, symptoms: e.target.value }))}
                      id="book-symptoms-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="staff-primary-btn"
                    disabled={bookingLoading}
                    id="confirm-book-btn"
                  >
                    {bookingLoading ? (
                      <><span className="staff-spinner-sm" /> Booking…</>
                    ) : (
                      <><span>📅</span> Confirm Appointment</>
                    )}
                  </button>
                </form>
              </div>

              {/* Available Slots Preview */}
              <div className="staff-slots-panel">
                <div className="staff-card">
                  <div className="staff-card-header">
                    <h3>🏥 Doctor Availability</h3>
                    <button className="staff-link-btn" onClick={fetchSchedules}>↺ Refresh</button>
                  </div>
                  {loading.schedules ? (
                    <div className="staff-loading"><div className="staff-spinner" /></div>
                  ) : schedules.length === 0 ? (
                    <div className="staff-empty">No schedules available.</div>
                  ) : (
                    schedules.map(s => (
                      <div
                        key={s.id}
                        className={`staff-slot-card ${(s.availableSlots || 0) === 0 ? 'staff-slot-full' : ''}`}
                        onClick={() => {
                          if ((s.availableSlots || 0) > 0)
                            setBookingForm(prev => ({ ...prev, scheduleId: String(s.id) }));
                        }}
                        style={{ cursor: (s.availableSlots || 0) > 0 ? 'pointer' : 'not-allowed' }}
                      >
                        <div className="staff-slot-header">
                          <span className="staff-slot-doc">👨‍⚕️ Dr. {s.doctorName}</span>
                          <span className={`staff-slot-badge ${(s.availableSlots || 0) > 0 ? 'available' : 'full'}`}>
                            {(s.availableSlots || 0) > 0 ? `${s.availableSlots} slots` : 'Full'}
                          </span>
                        </div>
                        <div className="staff-slot-spec">{s.specialization}</div>
                        <div className="staff-slot-meta">
                          <span>📆 {s.date}</span>
                          <span>🕒 {formatAMPM(s.time)}</span>
                          <span>🚪 {s.roomNumber}</span>
                        </div>
                        {bookingForm.scheduleId === String(s.id) && (
                          <div className="staff-slot-selected">✓ Selected</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EMR RECORDS TAB ──────────────────────────────────────────── */}
        {activeTab === 'emr' && (
          <div className="staff-tab-content animate-fade-in">
            {/* Search / filter bar */}
            <div className="staff-emr-toolbar">
              <div className="staff-search-wrap">
                <span className="staff-search-icon">🔍</span>
                <input
                  type="text"
                  className="staff-search-input"
                  placeholder="Search by patient, diagnosis, doctor…"
                  value={emrSearch}
                  onChange={e => setEmrSearch(e.target.value)}
                  id="emr-search-input"
                />
              </div>
              <button className="staff-primary-btn" style={{ width: 'auto', padding: '0 1.5rem', height: '40px' }} onClick={() => setActiveTab('create-emr')}>
                ➕ New Record
              </button>
              <select
                className="staff-select staff-emr-filter"
                value={emrPatientFilter}
                onChange={e => setEmrPatientFilter(e.target.value)}
                id="emr-patient-filter"
              >
                <option value="">All Patients</option>
                {patients.map(p => (
                  <option key={p.id} value={p.username}>
                    {p.fullName || p.username}
                  </option>
                ))}
              </select>
              <div className="staff-filter-count">{filteredEmr.length} records</div>
            </div>

            {loading.emr ? (
              <div className="staff-loading">
                <div className="staff-spinner" />
                <p>Loading EMR records…</p>
              </div>
            ) : (
              <div className="staff-emr-grid">
                {filteredEmr.length === 0 && (
                  <div className="staff-empty" style={{ gridColumn: '1/-1' }}>No records match your search.</div>
                )}
                {filteredEmr.map(record => (
                  <div key={record.id} className="staff-emr-card">
                    <div className="staff-emr-card-header">
                      <div className="staff-emr-patient">
                        <div className="staff-emr-avatar">{(record.patientUsername || 'P').charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="staff-emr-name">{record.patientUsername}</div>
                          <div className="staff-emr-date">
                            📅 {record.visitDate ? new Date(record.visitDate).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      </div>
                      <span className="staff-badge">EMR</span>
                    </div>
                    <div className="staff-emr-doctor">👨‍⚕️ {record.doctorName || '—'}</div>
                    <div className="staff-emr-section">
                      <div className="staff-emr-field-label">Diagnosis</div>
                      <div className="staff-emr-field-value">{record.diagnosis || '—'}</div>
                    </div>
                    <div className="staff-emr-section">
                      <div className="staff-emr-field-label">Treatment Plan</div>
                      <div className="staff-emr-field-value">{record.treatmentPlan || record.treatment || '—'}</div>
                    </div>
                    {record.notes && (
                      <div className="staff-emr-notes">
                        <span>📝</span> {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CREATE EMR TAB ─────────────────────────────────────────── */}
        {activeTab === 'create-emr' && (
          <div className="staff-tab-content animate-fade-in">
            <div className="staff-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="staff-card-header">
                <h3>📝 Clinical Visit Record</h3>
                <span className="staff-badge">Medical Intake</span>
              </div>
              <form onSubmit={handleCreateEmr} className="staff-emr-form" id="create-emr-form">
                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label className="staff-label">Patient Selection *</label>
                    <select
                      className="staff-select"
                      value={emrForm.patientUsername}
                      onChange={e => {
                        const p = patients.find(pat => pat.username === e.target.value);
                        setEmrForm(prev => ({ 
                          ...prev, 
                          patientUsername: e.target.value,
                          patientFullName: p ? (p.fullName || p.username) : ''
                        }));
                      }}
                      required
                    >
                      <option value="">— Select Patient —</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.username}>{p.fullName || p.username} (@{p.username})</option>
                      ))}
                    </select>
                  </div>
                  <div className="staff-form-group">
                    <label className="staff-label">Medical Status *</label>
                    <select
                      className="staff-select"
                      value={emrForm.status}
                      onChange={e => setEmrForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Discharged">Discharged</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label className="staff-label">Date of Birth</label>
                    <input
                      type="date"
                      className="staff-input"
                      value={emrForm.dateOfBirth}
                      onChange={e => setEmrForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label className="staff-label">Gender</label>
                    <select
                      className="staff-select"
                      value={emrForm.gender}
                      onChange={e => setEmrForm(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="staff-form-group">
                    <label className="staff-label">Blood Group</label>
                    <select
                      className="staff-select"
                      value={emrForm.bloodGroup}
                      onChange={e => setEmrForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="staff-form-row">
                  <div className="staff-form-group">
                    <label className="staff-label">Attending Doctor</label>
                    <input
                      type="text"
                      className="staff-input"
                      placeholder="Doctor Name"
                      value={emrForm.attendingDoctor}
                      onChange={e => setEmrForm(prev => ({ ...prev, attendingDoctor: e.target.value }))}
                    />
                  </div>
                  <div className="staff-form-group">
                    <label className="staff-label">Visit Date *</label>
                    <input
                      type="date"
                      className="staff-input"
                      value={emrForm.visitDate}
                      onChange={e => setEmrForm(prev => ({ ...prev, visitDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="staff-form-group">
                    <label className="staff-label">Follow-up Date</label>
                    <input
                      type="date"
                      className="staff-input"
                      value={emrForm.nextVisitFollowUpDate}
                      onChange={e => setEmrForm(prev => ({ ...prev, nextVisitFollowUpDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label className="staff-label">Allergies</label>
                  <input
                    type="text"
                    className="staff-input"
                    placeholder="List allergies or 'None'…"
                    value={emrForm.allergies}
                    onChange={e => setEmrForm(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>

                <div className="staff-form-group">
                  <label className="staff-label">Diagnosis / Reason for Visit *</label>
                  <input
                    type="text"
                    className="staff-input"
                    placeholder="Brief diagnosis…"
                    value={emrForm.diagnosis}
                    onChange={e => setEmrForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    required
                  />
                </div>

                <div className="staff-form-group">
                  <label className="staff-label">Clinical Notes & Treatment Plan</label>
                  <textarea
                    className="staff-textarea"
                    rows={4}
                    placeholder="Detailed medical notes and advice…"
                    value={emrForm.notes}
                    onChange={e => setEmrForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="staff-primary-btn" disabled={emrSubmitting} id="save-emr-btn">
                    {emrSubmitting ? <><span className="staff-spinner-sm" /> Saving…</> : '💾 Save Medical Record'}
                  </button>
                  <button type="button" className="staff-soft-btn" onClick={() => setActiveTab('emr')} style={{ width: 'auto' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── SCHEDULES TAB ────────────────────────────────────────────── */}
        {activeTab === 'schedules' && (
          <div className="staff-tab-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="staff-primary-btn" style={{ width: 'auto', padding: '0.7rem 1.5rem' }} onClick={fetchSchedules}>
                ↺ Refresh Schedules
              </button>
            </div>
            {loading.schedules ? (
              <div className="staff-loading"><div className="staff-spinner" /></div>
            ) : (
              <div className="staff-schedule-grid">
                {schedules.length === 0 && <div className="staff-empty" style={{ gridColumn: '1/-1' }}>No schedules found.</div>}
                {schedules.map(s => (
                  <div key={s.id} className="staff-schedule-card">
                    <div className="staff-schedule-top">
                      <div className="staff-schedule-doc">Dr. {s.doctorName}</div>
                      <span className={`staff-slot-badge ${(s.availableSlots || 0) > 0 ? 'available' : 'full'}`}>
                        {(s.availableSlots || 0) > 0 ? `${s.availableSlots} slots` : 'Full'}
                      </span>
                    </div>
                    <div className="staff-schedule-spec">{s.specialization}</div>
                    <div className="staff-schedule-details">
                      <div className="staff-schedule-detail"><span>📆</span>{s.date}</div>
                      <div className="staff-schedule-detail"><span>🕒</span>{formatAMPM(s.time)}</div>
                      <div className="staff-schedule-detail"><span>🚪</span>{s.roomNumber}</div>
                    </div>
                    {(s.availableSlots || 0) > 0 && (
                      <button
                        className="staff-primary-btn"
                        style={{ marginTop: '1rem', padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => { setBookingForm(prev => ({ ...prev, scheduleId: String(s.id) })); setActiveTab('book'); }}
                        id={`book-from-schedule-${s.id}`}
                      >
                        📅 Book This Slot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATIENTS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'patients' && (
          <div className="staff-tab-content animate-fade-in">
            {loading.patients ? (
              <div className="staff-loading"><div className="staff-spinner" /></div>
            ) : (
              <div className="staff-card">
                <div className="staff-card-header">
                  <h3>Patient Directory</h3>
                  <div className="staff-filter-count">{patients.length} patients</div>
                </div>
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>User ID</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="staff-table-user">
                            <div className="staff-table-avatar">{(p.fullName || p.username).charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{p.fullName || '—'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{p.username}</div>
                            </div>
                          </div>
                        </td>
                        <td><code className="staff-code">{p.userId || '—'}</code></td>
                        <td>{p.email || '—'}</td>
                        <td>{p.contactNumber || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="staff-soft-btn"
                              onClick={() => { setBookingForm(prev => ({ ...prev, patientUsername: p.username })); setActiveTab('book'); }}
                              id={`book-for-${p.username}`}
                            >
                              📅 Book
                            </button>
                            <button
                              className="staff-soft-btn"
                              onClick={() => { setEmrPatientFilter(p.username); setActiveTab('emr'); }}
                              id={`emr-for-${p.username}`}
                            >
                              📋 EMR
                            </button>
                            <button
                              className="staff-soft-btn"
                              onClick={() => { 
                                setEmrForm(prev => ({ 
                                  ...prev, 
                                  patientUsername: p.username,
                                  patientFullName: p.fullName || p.username 
                                })); 
                                setActiveTab('create-emr'); 
                              }}
                              id={`create-emr-for-${p.username}`}
                            >
                              📝 Intake
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {patients.length === 0 && (
                      <tr><td colSpan={5}><div className="staff-empty">No patients found.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
