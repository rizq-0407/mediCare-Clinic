import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

import AdminTicketManagement from './AdminTicketManagement';
import AdminFeedbackManagement from './AdminFeedbackManagement';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules', 'users', 'register', 'tickets', or 'feedback'
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Employee form state
  const [empFormData, setEmpFormData] = useState({
    username: '', password: '', email: '', fullName: '', contactNumber: '', role: 'DOCTOR'
  });
  const [empIsLoading, setEmpIsLoading] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Scheduling Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '', specialization: 'General', date: '', time: '', roomNumber: 'Room 101', availableSlots: 0
  });

  // Bulk Scheduling States
  const [isBulk, setIsBulk] = useState(false);
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

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
      // Fallback for mock/offline testing
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
    if (activeTab === 'schedules') fetchSchedules();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'availableSlots' ? parseInt(value) || 0 : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isBulk) {
        const bulkData = {
          ...formData,
          startDate: formData.date,
          endDate: bulkEndDate,
          daysOfWeek: selectedDays
        };
        if (!bulkEndDate || selectedDays.length === 0) {
          alert("Please select an End Date and at least one Day of the Week.");
          return;
        }
        await API.post('/schedules/bulk', bulkData);
        alert("Bulk schedules created successfully!");
      } else if (isEditing) {
        await API.put(`/schedules/${currentId}`, formData);
      } else {
        await API.post('/schedules', formData);
      }

      handleCancel();
      fetchSchedules();
    } catch (err) {
      if (!err.response) {
        if (isBulk) alert("Bulk mode successfully simulated!");
        else if (isEditing) setSchedules(prev => prev.map(s => s.id === currentId ? { ...formData, id: currentId } : s));
        else setSchedules(prev => [...prev, { ...formData, id: Date.now() }]);
        handleCancel();
      } else {
        alert(err.response?.data || 'Failed to save schedule');
      }
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      doctorName: schedule.doctorName, specialization: schedule.specialization || 'General', date: schedule.date,
      time: schedule.time, roomNumber: schedule.roomNumber || 'Room 101', availableSlots: schedule.availableSlots
    });
    setIsEditing(true); setCurrentId(schedule.id);
  };

  const handleCancel = () => {
    setIsEditing(false); setCurrentId(null);
    setFormData({ doctorName: '', specialization: 'General', date: '', time: '', roomNumber: 'Room 101', availableSlots: 0 });
    setBulkEndDate('');
    setSelectedDays([]);
    setIsBulk(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await API.delete(`/schedules/${id}`);
        fetchSchedules();
      } catch (err) {
        if (!err.response) setSchedules(prev => prev.filter(s => s.id !== id));
        else alert('Failed to delete schedule');
      }
    }
  };

  const handleDeleteUser = async (id, username) => {
    const currentUsername = sessionStorage.getItem('username') || localStorage.getItem('username') || '';
    if (currentUsername === username) {
      alert("You cannot remove your own administrative account.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently remove user "${username}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        if (!err.response) setUsers(prev => prev.filter(u => u.id !== id));
        else alert(`Error: ${err.response.data?.message || err.response.data || 'Failed to remove user'}`);
      }
    }
  };

  const handleEditUser = (user) => {
    setEmpFormData({
      username: user.username,
      password: '',
      email: user.email || '',
      fullName: user.fullName || '',
      contactNumber: user.contactNumber || '',
      role: user.role || 'DOCTOR'
    });
    setIsEditingEmployee(true);
    setEditingEmployeeId(user.id);
    setActiveTab('register');
  };

  const handleCancelUserEdit = () => {
    setIsEditingEmployee(false);
    setEditingEmployeeId(null);
    setEmpFormData({ username: '', password: '', email: '', fullName: '', contactNumber: '', role: 'DOCTOR' });
    setActiveTab('users');
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
      } else alert(err.response.data || "Conflict: This slot is already taken.");
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await API.put(`/schedules/${id}/reject`, { reason: 'Slot already taken' });
      alert("Request marked as TAKEN and Doctor notified.");
      fetchSchedules();
    } catch (err) {
      if (!err.response) setSchedules(prev => prev.map(s => s.id === id ? { ...s, updateRequest: null, adminResponse: 'Taken: Slot already occupied' } : s));
      else alert("Failed to reject request.");
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
      if (isEditingEmployee) {
        await API.put(`/users/${editingEmployeeId}`, empFormData);
        alert("Employee information updated successfully!");
        handleCancelUserEdit();
      } else {
        const response = await API.post('/auth/register-employee', empFormData);
        alert(`Registration successful! Generated System ID for login is: ${response.data.userId}`);
        setEmpFormData({ username: '', password: '', email: '', fullName: '', contactNumber: '', role: 'DOCTOR' });
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Operation failed.");
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

      <aside className="glass-panel" style={{ margin: '1rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div className="logo" style={{ marginBottom: '2.5rem', padding: '0.5rem' }}>
          <div className="logo-m">M</div>
          <span>MediCare</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
          <button className={`btn ${activeTab === 'schedules' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('schedules')} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Schedules
          </button>

          <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('users')} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Personnel
          </button>

          <button className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('register')} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Register Personnel
          </button>



          <button className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('tickets')} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🎫</span>
            Ticket Mgt
          </button>

          <button className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-soft'}`} onClick={() => setActiveTab('feedback')} style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💬</span>
            User Feedback
          </button>

          <div style={{ margin: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
          <button onClick={() => navigate('/admin-billing')} className="btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: '700' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>💳</span>
            Global Billing
          </button>

          <button onClick={() => navigate('/agent-chat', { state: { role: 'admin' } })} className="btn btn-soft" style={{ width: '100%', justifyContent: 'flex-start', padding: '1rem 1.5rem', background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', fontWeight: '700', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🤖</span>
            AI Pharmacy Agent
          </button>
        </nav>

        <div className="glass-panel" style={{ marginTop: 'auto', padding: '1rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Logged in as</div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Administrator</div>
        </div>
        <button className="btn btn-soft" onClick={() => { sessionStorage.clear(); localStorage.clear(); navigate('/'); }} style={{ marginTop: '1rem', color: 'var(--danger)', width: '100%' }}>
            Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="header-row">
          <div>
            <h1>{
                activeTab === 'schedules' ? 'Schedule Management' : 
                activeTab === 'users' ? 'Clinic Personnel' : 
                activeTab === 'register' ? 'Personnel Registration' : 
                activeTab === 'tickets' ? 'Ticket Management' :
                'User Feedback'
            }</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back to the administrator dashboard.</p>
          </div>
          <div className="soft-card" style={{ padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="badge badge-success">Online</div>
            <span style={{ fontWeight: '600' }}>System Portal</span>
          </div>
        </header>

        {activeTab === 'schedules' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
            <section>
              <div className="soft-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Active Clinical Schedules</h3>
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
                              <span>🗓 {schedule.date}</span>
                              <span>🕒 {formatAMPM(schedule.time)}</span>
                              <span>🏢 {schedule.roomNumber}</span>
                            </div>
                          </div>
                          {!schedule.updateRequest && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-soft" onClick={() => handleEdit(schedule)} style={{ padding: '0.5rem' }}>✏️</button>
                              <button className="btn btn-soft" onClick={() => handleDelete(schedule.id)} style={{ padding: '0.5rem', color: 'var(--danger)' }}>🗑</button>
                            </div>
                          )}
                        </div>
                        {schedule.updateRequest === 'PENDING' && (
                          <div className="glass-panel" style={{ marginTop: '1.2rem', padding: '1.2rem', background: 'rgba(255, 159, 28, 0.05)', border: '1px dashed var(--warning)' }}>
                            <div style={{ color: 'var(--warning)', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Change Request</div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>{schedule.date} | {formatAMPM(schedule.time)}</div>
                              <div style={{ color: 'var(--warning)' }}>➔</div>
                              <div style={{ flex: 1, fontWeight: '700', color: 'var(--secondary)' }}>{schedule.requestedDate} | {formatAMPM(schedule.requestedTime)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                              <button className="btn btn-primary" onClick={() => handleApproveRequest(schedule.id)}>Approve</button>
                              <button className="btn btn-soft" style={{ color: 'var(--danger)' }} onClick={() => handleRejectRequest(schedule.id)}>Decline</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <aside>
              <div className="soft-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                <h3>{isEditing ? 'Modify Schedule' : 'New Schedule'}</h3>
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                  {!isEditing && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: 'var(--primary-soft)', borderRadius: '12px' }}>
                      <input type="checkbox" id="bulkToggle" checked={isBulk} onChange={(e) => setIsBulk(e.target.checked)} />
                      <label htmlFor="bulkToggle" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Enable Weekly Bulk Mode</label>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Doctor Username</label>
                    <input type="text" className="form-input" name="doctorName" value={formData.doctorName} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select className="form-input" name="specialization" value={formData.specialization} onChange={handleInputChange}>
                      <option value="General">General Physician</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">{isBulk ? 'Start Date' : 'Date'}</label>
                      <input type="date" className="form-input" name="date" value={formData.date} onChange={handleInputChange} required />
                    </div>
                    {isBulk ? (
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" value={bulkEndDate} onChange={(e) => setBulkEndDate(e.target.value)} required />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">Time</label>
                        <input type="time" className="form-input" name="time" value={formData.time} onChange={handleInputChange} required />
                      </div>
                    )}
                  </div>
                  {isBulk && (
                    <div className="form-group">
                      <label className="form-label">Repeat Days</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                          <button key={day} type="button" className={`btn ${selectedDays.includes(day) ? 'btn-primary' : 'btn-soft'}`} style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}>
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Room</label>
                    <input type="text" className="form-input" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Patient Slots</label>
                    <input type="number" className="form-input" name="availableSlots" value={formData.availableSlots} onChange={handleInputChange} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    {isEditing ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="stat-grid">
              <div className="soft-card stat-card">
                <div>Total Registered</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{users.length}</div>
              </div>
            </div>
            <div className="soft-card" style={{ padding: '2rem', marginTop: '2rem' }}>
              <h3>Personnel Directory</h3>
              <table className="custom-table" style={{ width: '100%', marginTop: '1.5rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--primary-soft)' }}>
                    <th style={{ padding: '1rem' }}>Name / Username</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Contact</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--primary-soft)' }}>
                      <td style={{ padding: '1.2rem 1rem' }}>
                        <div style={{ fontWeight: '700' }}>{user.fullName || 'No Name'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.username}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-success'}`}>{user.role}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>{user.email || '—'}<br/><span style={{ fontSize: '0.8rem' }}>{user.contactNumber}</span></td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button className="btn btn-soft" onClick={() => handleEditUser(user)}>✏️</button>
                        <button className="btn btn-soft" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUser(user.id, user.username)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'register' && (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="soft-card" style={{ padding: '2.5rem' }}>
              <h3>{isEditingEmployee ? 'Edit Personnel' : 'Register New Personnel'}</h3>
              <form onSubmit={handleEmployeeRegistration} style={{ marginTop: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" name="fullName" value={empFormData.fullName} onChange={handleEmpInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" name="username" value={empFormData.username} onChange={handleEmpInputChange} required disabled={isEditingEmployee} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" name="role" value={empFormData.role} onChange={handleEmpInputChange}>
                    <option value="DOCTOR">Doctor</option>
                    <option value="PHARMACY">Pharmacist</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" name="email" value={empFormData.email} onChange={handleEmpInputChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact</label>
                  <input type="tel" className="form-input" name="contactNumber" value={empFormData.contactNumber} onChange={handleEmpInputChange} required />
                </div>
                {!isEditingEmployee && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-input" name="password" value={empFormData.password} onChange={handleEmpInputChange} required />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditingEmployee ? 'Save Changes' : 'Register'}</button>
                  {isEditingEmployee && <button type="button" className="btn btn-soft" onClick={handleCancelUserEdit}>Cancel</button>}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="animate-fade-in soft-card" style={{ padding: '2rem' }}>
            <AdminTicketManagement />
          </div>
        )}
        {activeTab === 'feedback' && (
          <div className="animate-fade-in soft-card" style={{ padding: '2rem' }}>
            <AdminFeedbackManagement />
          </div>
        )}
      </main>
    </div>
  );
}