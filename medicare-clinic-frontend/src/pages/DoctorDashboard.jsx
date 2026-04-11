import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import PrescriptionForm from '../components/PrescriptionForm';

export default function DoctorDashboard({ user }) {
  const [activeTab, setActiveTab]       = useState('shifts');
  const [schedules, setSchedules]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [requestForms, setRequestForms] = useState({});
  const [medicines, setMedicines]       = useState([]);
  const [patients, setPatients]         = useState([]);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [toastMsg, setToastMsg]         = useState(null);
  const [loadingRx, setLoadingRx]       = useState(false);

  // The logged-in doctor's userId (e.g. DOC001) stored by Login.jsx
  const doctorUserId = localStorage.getItem('userId') || '';

  // ── helpers ────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const formatAMPM = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const formatDate = (ds) => {
    if (!ds) return 'Today';
    return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ── data fetching ──────────────────────────────────────────────────────
  const fetchSchedules = async () => {
    try {
      const res = await API.get('/schedules');
      if (Array.isArray(res.data)) {
        const docName = user?.username || '';
        setSchedules(res.data.filter(s => s.doctorName === docName));
      }
    } catch (err) {
      if (!err.response) {
        setSchedules([
          { id: 1, doctorName: user?.username, specialization: 'General', date: '2026-04-10', time: '10:00', roomNumber: 'Room 101', availableSlots: 5, updateRequest: null, adminResponse: 'Success: Previous request approved' },
          { id: 4, doctorName: user?.username, specialization: 'General', date: '2026-04-15', time: '08:30', roomNumber: 'Room 102', availableSlots: 12, updateRequest: 'PENDING', requestedDate: '2026-04-16', requestedTime: '09:00', requestedRoom: 'Room 105' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await API.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error('Could not load medicines:', err.message);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await API.get('/users/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Could not load patients:', err.message);
    }
  };

  const fetchMyPrescriptions = async () => {
    if (!doctorUserId) return;
    setLoadingRx(true);
    try {
      const res = await API.get('/prescriptions');
      // filter to only this doctor's prescriptions
      setMyPrescriptions(res.data.filter(p => p.doctorId === doctorUserId));
    } catch (err) {
      console.error('Could not load prescriptions:', err.message);
    } finally {
      setLoadingRx(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchMedicines();
    fetchPatients();
    fetchMyPrescriptions();
  }, [user]);

  // ── shift-request handlers ─────────────────────────────────────────────
  const handleInputChange = (id, field, value) => {
    setRequestForms(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { requestedDate: '', requestedTime: '', requestedRoom: 'Room 101' }),
        [field]: value
      }
    }));
  };

  const handleRequestChange = async (id) => {
    const form = requestForms[id];
    if (!form || !form.requestedDate || !form.requestedTime) {
      alert('Please fill in all requested fields (Date, Time, Room).');
      return;
    }
    try {
      await API.put(`/schedules/${id}/request`, form);
      showToast('Update request sent to Admin.');
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        showToast('Mock request sent! (Checking for conflicts...)', 'info');
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, updateRequest: 'PENDING', ...form } : s));
      } else {
        alert(err.response?.data || 'Failed to send request.');
      }
    }
  };

  // ── prescription handler ───────────────────────────────────────────────
  const handleCreatePrescription = async (formData) => {
    const payload = {
      ...formData,
      doctorId: doctorUserId,   // always set to the logged-in doctor
    };
    try {
      const res = await API.post('/prescriptions', payload);
      showToast(`✅ Prescription created! ID: ${res.data.id}`);
      setMyPrescriptions(prev => [res.data, ...prev]);
      setActiveTab('my-prescriptions');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(`❌ Failed: ${msg}`, 'error');
    }
  };

  // ── derived ────────────────────────────────────────────────────────────
  const isPending   = s => !s || s === 'Pending' || s === 'NEW' || s === 'PENDING';
  const isDispensed = s => s === 'Dispensed' || s === 'COMPLETED';

  const getStatusBadge = (status) => {
    if (isPending(status))   return { label: 'Pending',   cls: 'badge-warning' };
    if (isDispensed(status)) return { label: 'Dispensed', cls: 'badge-success' };
    return { label: status || 'Unknown', cls: 'badge-info' };
  };

  // ── sidebar items ──────────────────────────────────────────────────────
  const navItems = [
    { id: 'shifts',            icon: '📅', label: 'My Shifts' },
    { id: 'create-rx',         icon: '✍️', label: 'New Prescription' },
    { id: 'my-prescriptions',  icon: '📋', label: 'My Prescriptions' },
  ];

  const navigate = useNavigate();

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="bg-decor-container">
        <div className="float-circle"></div>
        <div className="float-symbol">☤</div>
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: '700',
          background: toastMsg.type === 'error' ? 'var(--danger)' : toastMsg.type === 'info' ? 'var(--primary)' : 'var(--success)',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease'
        }}>
          {toastMsg.text}
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="glass-panel" style={{ margin: '1rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div className="logo" style={{ marginBottom: '2.5rem', padding: '0.5rem' }}>
          <div className="logo-m">M</div>
          <span>MediCare</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-soft'}`}
              style={{ width: '100%', justifyContent: 'flex-start', gap: '0.8rem' }}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        {/* AI Assistant shortcut */}
        <button
          className="btn btn-soft"
          style={{
            marginTop: '1rem', width: '100%', justifyContent: 'flex-start',
            gap: '0.8rem', background: 'rgba(16,185,129,0.08)',
            color: '#10b981', border: '1px solid rgba(16,185,129,0.2)'
          }}
          onClick={() => navigate('/agent-chat', { state: { role: 'doctor', patientId: doctorUserId } })}
        >
          🤖 AI Assistant
        </button>

        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Logged in as</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Dr. {user?.username || 'Guest'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>ID: {doctorUserId}</div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <header className="header-row">
          <div>
            <h1>Doctor Control Panel</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back, Dr. {user?.username || 'Guest'} — {
                activeTab === 'shifts'           ? 'manage your clinical shifts' :
                activeTab === 'create-rx'        ? 'create a new prescription' :
                                                   'view prescriptions you issued'
              }
            </p>
          </div>
          <div className="soft-card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="badge badge-success">Online</div>
            <span style={{ fontWeight: '600' }}>Provider Portal</span>
          </div>
        </header>

        {/* ═══════════════════ TAB: My Shifts ═══════════════════ */}
        {activeTab === 'shifts' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>⏳</div>
              <p>Retrieving your clinical schedule...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="soft-card" style={{ padding: '4rem', textAlign: 'center' }}>
              <div className="stat-icon" style={{ margin: '0 auto 1.5rem' }}>📅</div>
              <h3>No assigned shifts found.</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Please contact administration if you believe this is an error.</p>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {schedules.map(schedule => (
                <div key={schedule.id} className="soft-card" style={{ padding: '2rem', borderTop: schedule.updateRequest === 'PENDING' ? '5px solid var(--warning)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary)' }}>{schedule.roomNumber}</div>
                    <span className={`badge ${schedule.availableSlots > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {schedule.availableSlots} slots left
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      📅 {schedule.date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      🕐 {formatAMPM(schedule.time)}
                    </div>
                  </div>

                  {schedule.adminResponse && (
                    <div className="glass-panel" style={{
                      marginBottom: '1.5rem', padding: '1rem',
                      background: schedule.adminResponse.startsWith('Success') ? 'rgba(56, 176, 0, 0.05)' : 'rgba(230, 57, 70, 0.05)',
                      border: `1px solid ${schedule.adminResponse.startsWith('Success') ? 'var(--success)' : 'var(--danger)'}`,
                      color: schedule.adminResponse.startsWith('Success') ? 'var(--success)' : 'var(--danger)',
                      fontSize: '0.85rem'
                    }}>
                      {schedule.adminResponse}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid var(--primary-soft)', paddingTop: '1.5rem' }}>
                    {schedule.updateRequest === 'PENDING' ? (
                      <div className="glass-panel" style={{ padding: '1.25rem', border: '1px dashed var(--warning)', background: 'rgba(255, 159, 28, 0.05)' }}>
                        <div style={{ fontWeight: '800', color: 'var(--warning)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Request Pending</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          <strong>{schedule.requestedDate}</strong> | <strong>{formatAMPM(schedule.requestedTime)}</strong> | <strong>{schedule.requestedRoom}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1.2rem' }}>Update Clinical Shift</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.7rem' }}>New Date</label>
                            <input type="date" className="form-input" style={{ padding: '0.6rem' }} value={requestForms[schedule.id]?.requestedDate || ''} onChange={e => handleInputChange(schedule.id, 'requestedDate', e.target.value)} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.7rem' }}>New Time</label>
                            <input type="time" className="form-input" style={{ padding: '0.6rem' }} value={requestForms[schedule.id]?.requestedTime || ''} onChange={e => handleInputChange(schedule.id, 'requestedTime', e.target.value)} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Preferred Room</label>
                          <select className="form-input" style={{ padding: '0.6rem' }} value={requestForms[schedule.id]?.requestedRoom || 'Room 101'} onChange={e => handleInputChange(schedule.id, 'requestedRoom', e.target.value)}>
                            {['Room 101','Room 102','Room 103','Room 104','Room 105'].map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleRequestChange(schedule.id)}>
                          Submit Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ═══════════════════ TAB: Create Prescription ═══════════════════ */}
        {activeTab === 'create-rx' && (
          <div className="animate-fade-in">
            {/* Info Banner */}
            <div className="glass-panel" style={{
              padding: '1.2rem 1.8rem', marginBottom: '2rem',
              borderLeft: '5px solid var(--primary)',
              background: 'rgba(67,97,238,0.05)',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <span style={{ fontSize: '1.8rem' }}>🩺</span>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Doctor: {user?.username || 'Dr.'} — ID: {doctorUserId}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  This prescription will be automatically linked to your doctor ID and appear in the patient's dashboard and the pharmacy queue.
                </div>
              </div>
            </div>

            <div className="soft-card" style={{ padding: '2.5rem', maxWidth: '900px' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Create New Prescription</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Select a patient and medicine from the lists below. Your doctor ID is auto-filled.
              </p>

              {patients.length === 0 && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', color: 'var(--warning)', fontSize: '0.9rem', borderLeft: '4px solid var(--warning)' }}>
                  ⚠️ Patient list could not be loaded. Make sure the backend is running.
                </div>
              )}
              {medicines.length === 0 && (
                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', color: 'var(--warning)', fontSize: '0.9rem', borderLeft: '4px solid var(--warning)' }}>
                  ⚠️ Medicine list could not be loaded. Make sure the backend is running.
                </div>
              )}

              <PrescriptionForm
                onSubmit={handleCreatePrescription}
                medicines={medicines}
                patients={patients}
                lockedDoctorId={doctorUserId}
                onCancel={() => setActiveTab('shifts')}
              />
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: My Prescriptions ══════════════════════ */}
        {activeTab === 'my-prescriptions' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>My Issued Prescriptions</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All prescriptions you have created — visible to the patient and pharmacy.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setActiveTab('create-rx')}>✍️ New Prescription</button>
            </div>

            {/*  Stats  */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { icon: '📄', label: 'Total', value: myPrescriptions.length, color: 'var(--primary)' },
                { icon: '⏳', label: 'Pending', value: myPrescriptions.filter(p => isPending(p.status)).length, color: 'var(--warning)' },
                { icon: '✅', label: 'Dispensed', value: myPrescriptions.filter(p => isDispensed(p.status)).length, color: 'var(--success)' },
              ].map(stat => (
                <div key={stat.label} className="soft-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                  <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}18` }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {loadingRx ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px' }}>⏳</div>
                <p>Loading prescriptions...</p>
              </div>
            ) : myPrescriptions.length === 0 ? (
              <div className="soft-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>📭</div>
                <h3>No prescriptions issued yet.</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Click "New Prescription" to get started.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('create-rx')}>✍️ Create First Prescription</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {myPrescriptions.map(rx => {
                  const badge = getStatusBadge(rx.status);
                  return (
                    <div key={rx.id} className="soft-card" style={{ padding: '1.8rem', borderTop: `5px solid ${isPending(rx.status) ? 'var(--warning)' : 'var(--success)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>#{rx.id}</div>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>👤 Patient</span>
                          <strong>{rx.patientName || rx.patientId || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>💊 Medicine</span>
                          <strong style={{ color: 'var(--primary)' }}>{rx.medicineName || rx.medicineId || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>📏 Dosage</span>
                          <strong>{rx.dosage || '—'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>⏱ Duration</span>
                          <strong>{rx.duration || '—'}</strong>
                        </div>
                        {rx.instructions && (
                          <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'var(--primary-soft)', borderRadius: '10px', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            📝 {rx.instructions}
                          </div>
                        )}
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          🗓 {formatDate(rx.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
