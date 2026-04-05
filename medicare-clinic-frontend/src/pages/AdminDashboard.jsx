import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'users'
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Employee form state
  const [empFormData, setEmpFormData] = useState({
    username: '', password: '', email: '', fullName: '', contactNumber: '', role: 'DOCTOR'
  });
  const [empIsLoading, setEmpIsLoading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialization: 'General',
    date: '',
    time: '',
    roomNumber: 'Room 101',
    availableSlots: 0
  });

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
      const response = await API.get('/schedules');
      if (Array.isArray(response.data)) {
        setSchedules(response.data);
      } else {
        throw new Error("Invalid array data");
      }
    } catch (err) {
      if (!err.response) {
        setSchedules([
          { id: 1, doctorName: 'Smith', specialization: 'Cardiologist', date: '2026-04-10', time: '10:00', roomNumber: 'Room 101', availableSlots: 5, updateRequest: 'PENDING', requestedDate: '2026-04-12', requestedTime: '15:00', requestedRoom: 'Room 102' },
          { id: 2, doctorName: 'Lee', specialization: 'Neurologist', date: '2026-04-12', time: '09:00', roomNumber: 'Room 203', availableSlots: 10 }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await API.get('/users');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        throw new Error("Invalid array data");
      }
    } catch (err) {
      if (!err.response) {
        setUsers([
          { id: 1, username: 'admin', role: 'Staff' },
          { id: 2, username: 'Smith', role: 'Doctor' },
          { id: 3, username: 'john_doe', role: 'Patient' }
        ]);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'availableSlots' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/schedules/${currentId}`, formData);
      } else {
        await API.post('/schedules', formData);
      }

      setFormData({ doctorName: '', specialization: 'General', date: '', time: '', roomNumber: 'Room 101', availableSlots: 0 });
      setIsEditing(false);
      setCurrentId(null);
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        if (isEditing) {
          setSchedules(prev => prev.map(s => s.id === currentId ? { ...formData, id: currentId } : s));
        } else {
          setSchedules(prev => [...prev, { ...formData, id: Date.now() }]);
        }
        handleCancel();
      } else {
        alert(err.response?.data || 'Failed to save schedule');
      }
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      doctorName: schedule.doctorName,
      specialization: schedule.specialization || 'General',
      date: schedule.date,
      time: schedule.time,
      roomNumber: schedule.roomNumber || 'Room 101',
      availableSlots: schedule.availableSlots
    });
    setIsEditing(true);
    setCurrentId(schedule.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await API.delete(`/schedules/${id}`);
        fetchSchedules();
      } catch (err) {
        if (!err.response) {
          setSchedules(prev => prev.filter(s => s.id !== id));
        } else {
          alert('Failed to delete schedule');
        }
      }
    }
  };

  const handleDeleteUser = async (id, username) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.username === username) {
      alert("You cannot remove your own administrative account.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove user "${username}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        if (!err.response) {
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          const errorMsg = err.response.data?.message || err.response.data || 'Failed to remove user - check server logs';
          alert(`Error: ${errorMsg}`);
        }
      }
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await API.put(`/schedules/${id}/approve`);
      alert("Schedule updated and Doctor notified!");
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        setSchedules(prev => prev.map(s => {
          if (s.id === id) {
            return { ...s, date: s.requestedDate, time: s.requestedTime, roomNumber: s.requestedRoom, updateRequest: null, adminResponse: 'Success: Schedule updated!' };
          }
          return s;
        }));
      } else {
        alert(err.response.data || "Conflict: This slot is already taken.");
      }
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await API.put(`/schedules/${id}/reject`, { reason: 'Slot already taken' });
      alert("Request marked as TAKEN and Doctor notified.");
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, updateRequest: null, adminResponse: 'Taken: Slot already occupied' } : s));
      } else {
        alert("Failed to reject request.");
      }
    }
  };

  const handleEmpInputChange = (e) => {
    const { name, value } = e.target;
    setEmpFormData({ ...empFormData, [name]: value });
  };

  const handleEmployeeRegistration = async (e) => {
    e.preventDefault();
    setEmpIsLoading(true);
    try {
      const response = await API.post('/auth/register-employee', empFormData);
      alert(`Registration successful! Generated System ID for login is: ${response.data.userId}`);
      setEmpFormData({ username: '', password: '', email: '', fullName: '', contactNumber: '', role: 'DOCTOR' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Employee registration failed.");
    } finally {
      setEmpIsLoading(false);
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
          <button
            className={`btn ${activeTab === 'schedules' ? 'btn-primary' : 'btn-soft'}`}
            onClick={() => setActiveTab('schedules')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: activeTab === 'schedules' ? '1rem 1.5rem' : '1rem 1.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Schedules
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-soft'}`}
            onClick={() => setActiveTab('users')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: activeTab === 'users' ? '1rem 1.5rem' : '1rem 1.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Personnel
          </button>
          <button
            className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-soft'}`}
            onClick={() => setActiveTab('register')}
            style={{ width: '100%', justifyContent: 'flex-start', padding: activeTab === 'register' ? '1rem 1.5rem' : '1rem 1.5rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Register Employee
          </button>
        </nav>

        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Logged in as</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Administrator</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-row">
          <div>
            <h1>{activeTab === 'schedules' ? 'Schedule Management' : activeTab === 'users' ? 'Clinic Personnel' : 'Employee Registration'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back to the administrator dashboard.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="soft-card" style={{ padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="badge badge-success">Online</div>
              <span style={{ fontWeight: '600' }}>System Portal</span>
            </div>
          </div>
        </header>

        {activeTab === 'schedules' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
            {/* Left: Schedule List */}
            <section>
              <div className="soft-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Active Clinical Schedules</h3>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="stat-icon" style={{ margin: '0 auto 1rem' }}>⏳</div>
                    <p>Loading schedules...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {schedules.map(schedule => (
                      <div key={schedule.id} className="soft-card" style={{ padding: '1.5rem', borderLeft: `6px solid ${schedule.updateRequest === 'PENDING' ? 'var(--warning)' : 'var(--primary)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Dr. {schedule.doctorName}</span>
                              <span className="badge badge-info">{schedule.specialization}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                {schedule.date}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                {formatAMPM(schedule.time)}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                {schedule.roomNumber}
                              </span>
                            </div>
                          </div>

                          {!schedule.updateRequest && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-soft" onClick={() => handleEdit(schedule)} style={{ padding: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button className="btn btn-soft" onClick={() => handleDelete(schedule.id)} style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {schedule.updateRequest === 'PENDING' && (
                          <div className="glass-panel" style={{ marginTop: '1.2rem', padding: '1.2rem', background: 'rgba(255, 159, 28, 0.05)', border: '1px dashed var(--warning)' }}>
                            <div style={{ color: 'var(--warning)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Change Request</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current</div>
                                <div style={{ fontWeight: '600' }}>{formatAMPM(schedule.time)} | {schedule.roomNumber}</div>
                              </div>
                              <div style={{ color: 'var(--warning)' }}>➜</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested</div>
                                <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>{formatAMPM(schedule.requestedTime)} | {schedule.requestedRoom}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => handleApproveRequest(schedule.id)}>Approve</button>
                              <button className="btn btn-soft" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--danger)' }} onClick={() => handleRejectRequest(schedule.id)}>Decline</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Right: Form Sidebar */}
            <aside>
              <div className="soft-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                <h3>{isEditing ? 'Modify Schedule' : 'New Schedule'}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Set up clinical availability</p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Doctor Username</label>
                    <input type="text" className="form-input" name="doctorName" value={formData.doctorName} onChange={handleInputChange} required placeholder="Dr. Name" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select className="form-input" name="specialization" value={formData.specialization} onChange={handleInputChange} required>
                      <option value="General">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" name="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-input" name="time" value={formData.time} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Room</label>
                    <select className="form-input" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required>
                      <option value="Room 101">Room 101</option>
                      <option value="Room 102">Room 102</option>
                      <option value="Room 103">Room 103</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient Slots</label>
                    <input type="number" className="form-input" name="availableSlots" min="1" value={formData.availableSlots} onChange={handleInputChange} required />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {isEditing ? 'Update Schedule' : 'Create Schedule'}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-soft" onClick={handleCancel}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </aside>
          </div>
        ) : activeTab === 'users' ? (
          /* User Management Tab */
          <div className="animate-fade-in">
            <div className="stat-grid">
              <div className="soft-card stat-card">
                <div className="stat-icon">👥</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Registered</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{users.length}</div>
                </div>
              </div>
              <div className="soft-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(56, 176, 0, 0.1)' }}>🩺</div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Doctors</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{users.filter(u => u.role === 'Doctor').length}</div>
                </div>
              </div>
            </div>

            <div className="soft-card" style={{ padding: '2rem' }}>
              <h3>Personnel Directory</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage system access for all registered users.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {users.map(user => (
                  <div key={user.id} className="soft-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '50%', fontSize: '1.2rem' }}>
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{user.username || user.id || 'Unknown User'}</div>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : user.role === 'DOCTOR' ? 'badge-success' : 'badge-info'}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-soft"
                      style={{ padding: '0.5rem', color: 'var(--danger)' }}
                      onClick={() => handleDeleteUser(user.id, user.username)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Employee Registration Tab */
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="soft-card" style={{ padding: '2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Register New Personnel</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Create access accounts for doctors, staff, and admins</p>
              </div>

              <form onSubmit={handleEmployeeRegistration}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" name="fullName" value={empFormData.fullName} onChange={handleEmpInputChange} required placeholder="Dr. Jane Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Username</label>
                    <input type="text" className="form-input" name="username" value={empFormData.username} onChange={handleEmpInputChange} required placeholder="janedoe" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role / Access Level</label>
                  <select className="form-input" name="role" value={empFormData.role} onChange={handleEmpInputChange} required>
                    <option value="DOCTOR">Doctor (Clinical Access)</option>
                    <option value="PHARMACY">Pharmacist (Inventory Access)</option>
                    <option value="STAFF">Staff (Support Access)</option>
                    <option value="ADMIN">Administrator (Full Access)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" name="email" value={empFormData.email} onChange={handleEmpInputChange} required placeholder="email@clinic.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input type="tel" className="form-input" name="contactNumber" value={empFormData.contactNumber} onChange={handleEmpInputChange} required placeholder="+1 234 567 8900" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input type="password" className="form-input" name="password" value={empFormData.password} onChange={handleEmpInputChange} required placeholder="Create secure password" />
                </div>

                <button type="submit" className={`btn btn-primary ${empIsLoading ? 'loading' : ''}`} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1rem' }} disabled={empIsLoading}>
                  {empIsLoading ? 'Registering...' : 'Register Employee & Generate ID'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

