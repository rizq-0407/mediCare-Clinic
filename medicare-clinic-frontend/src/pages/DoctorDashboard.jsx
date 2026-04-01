import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DoctorDashboard({ user }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestForms, setRequestForms] = useState({});

  const formatAMPM = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/schedules');
      const filtered = response.data.filter(s => s.doctorName === user.username);
      setSchedules(filtered);
    } catch (err) {
      if (!err.response) {
        setSchedules([
          { id: 1, doctorName: user.username, specialization: 'General', date: '2026-04-10', time: '10:00', roomNumber: 'Room 101', availableSlots: 5, updateRequest: null, adminResponse: 'Success: Previous request approved' },
          { id: 4, doctorName: user.username, specialization: 'General', date: '2026-04-15', time: '08:30', roomNumber: 'Room 102', availableSlots: 12, updateRequest: 'PENDING', requestedDate: '2026-04-16', requestedTime: '09:00', requestedRoom: 'Room 105' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [user]);

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
      alert("Please fill in all requested fields (Date, Time, Room).");
      return;
    }

    try {
      await axios.put(`/schedules/${id}/request`, form);
      alert("Structured update request sent to Admin.");
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        alert("Mock request sent! (Checking for conflicts...)");
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, updateRequest: 'PENDING', ...form } : s));
      } else {
        alert(err.response?.data || "Failed to send request.");
      }
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="bg-decor-container">
        <div className="float-circle"></div>
        <div className="float-symbol">☤</div>
      </div>
      {/* Sidebar Navigation */}
      <aside className="glass-panel" style={{ margin: '1rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div className="logo" style={{ marginBottom: '2.5rem', padding: '0.5rem' }}>
          <div className="logo-m">M</div>
          <span>MediCare</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            My Shifts
          </button>
        </nav>

        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Logged in as</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Dr. {user.username}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-row">
          <div>
            <h1>Doctor Control Panel</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Dr. {user.username}. Manage your clinical attendance and shift requests.</p>
          </div>

          <div className="soft-card" style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="badge badge-success">Online</div>
            <span style={{ fontWeight: '600' }}>Provider Portal</span>
          </div>
        </header>

        {loading ? (
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
                  <div style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--primary)' }}>
                    {schedule.roomNumber}
                  </div>
                  <span className={`badge ${schedule.availableSlots > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {schedule.availableSlots} slots left
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {schedule.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {formatAMPM(schedule.time)}
                  </div>
                </div>

                {schedule.adminResponse && (
                  <div className="glass-panel" style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
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
                      <div style={{ fontWeight: '800', color: 'var(--warning)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Request Pending
                      </div>
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
                          <option value="Room 101">Room 101</option>
                          <option value="Room 102">Room 102</option>
                          <option value="Room 103">Room 103</option>
                          <option value="Room 104">Room 104</option>
                          <option value="Room 105">Room 105</option>
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
        )}
      </main>
    </div>
  );
}
