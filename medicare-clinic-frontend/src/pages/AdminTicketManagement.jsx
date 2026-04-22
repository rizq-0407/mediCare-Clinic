import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/TicketManagement.css';

export default function AdminTicketManagement() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [stats, setStats] = useState(null);
    
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    const adminId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetchData();
    }, [filterStatus, filterPriority]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsResponse, statsResponse] = await Promise.all([
                API.get('/tickets'),
                API.get('/tickets/admin/stats')
            ]);
            setTickets(ticketsResponse.data);
            setStats(statsResponse.data);
            setError(null);
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            const response = await API.patch(`/tickets/${ticketId}/assign/${adminId}`);
            setTickets(tickets.map(t => t.ticketId === ticketId ? response.data : t));
            alert('Ticket assigned to you');
        } catch (err) {
            alert('Failed to assign ticket');
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        try {
            const response = await API.patch(`/tickets/${ticketId}/status`, { status });
            setTickets(tickets.map(t => t.ticketId === ticketId ? response.data : t));
            if (selectedTicket?.ticketId === ticketId) {
                setSelectedTicket(response.data);
            }
        } catch (err) {
            alert('Failed to update ticket status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': '#ff6b6b',
            'IN-PROGRESS': '#ffd43b',
            'WAITING-FOR-PATIENT': '#74c0fc',
            'RESOLVED': '#69db7c',
            'CLOSED': '#868e96'
        };
        return colors[status] || '#6c757d';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'URGENT': '#ff6b6b',
            'HIGH': '#ff922b',
            'MEDIUM': '#ffd43b',
            'LOW': '#69db7c'
        };
        return colors[priority] || '#6c757d';
    };

    let filteredTickets = tickets;
    if (filterStatus !== 'ALL') {
        filteredTickets = filteredTickets.filter(t => t.status === filterStatus);
    }
    if (filterPriority !== 'ALL') {
        filteredTickets = filteredTickets.filter(t => t.priority === filterPriority);
    }
    if (searchTerm) {
        filteredTickets = filteredTickets.filter(t =>
            t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return (
        <div className="admin-ticket-page">
            <div className="page-header">
                <h1>Ticket Management Dashboard</h1>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card glass-panel">
                        <h4>Total Tickets</h4>
                        <p className="stat-value">{stats.totalTickets}</p>
                    </div>
                    <div className="stat-card glass-panel">
                        <h4>Open Tickets</h4>
                        <p className="stat-value" style={{ color: getStatusColor('OPEN') }}>{stats.openTickets}</p>
                    </div>
                    <div className="stat-card glass-panel">
                        <h4>In Progress Tickets</h4>
                        <p className="stat-value" style={{ color: getStatusColor('IN-PROGRESS') }}>{stats.inProgressTickets}</p>
                    </div>
                    <div className="stat-card glass-panel">
                        <h4>Unassigned Tickets</h4>
                        <p className="stat-value">{stats.unassignedTickets}</p>
                    </div>
                </div>
            )}

            <div className="filters-section glass-panel">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">All</option>
                        <option value="OPEN">Open</option>
                        <option value="IN-PROGRESS">In Progress</option>
                        <option value="WAITING-FOR-PATIENT">Waiting</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Priority:</label>
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="ALL">All</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>

                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search by ticket ID or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="loading">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
                <div className="empty-state glass-panel">
                    <p>No tickets found</p>
                </div>
            ) : (
                <div className="tickets-table-container">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Created</th>
                                <th>Assigned</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.ticketId}>
                                    <td className="ticket-id">{ticket.ticketId}</td>
                                    <td>{ticket.subject}</td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getStatusColor(ticket.status) }}
                                        >
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span 
                                            className="badge" 
                                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                        >
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>{ticket.assignedAdminId ? 'Yes' : 'No'}</td>
                                    <td>
                                        <button 
                                            className="btn btn-small btn-primary"
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showDetailModal && selectedTicket && (
                <AdminTicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTicket(null);
                    }}
                    onAssign={() => handleAssignTicket(selectedTicket.ticketId)}
                    onStatusChange={(status) => handleUpdateStatus(selectedTicket.ticketId, status)}
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
}

function AdminTicketDetailModal({ ticket, onClose, onAssign, onStatusChange, onRefresh }) {
    const [reply, setReply] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [attachments, setAttachments] = useState([]);

    useEffect(() => {
        fetchAttachments();
    }, []);

    const fetchAttachments = async () => {
        try {
            const response = await API.get(`/attachments/ticket/${ticket.ticketId}`);
            setAttachments(response.data);
        } catch (err) {
            console.error('Failed to load attachments', err);
        }
    };

    const handleDownloadAttachment = async (attachmentId, fileName) => {
        try {
            const response = await API.get(`/attachments/download/${attachmentId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentElement.removeChild(link);
        } catch (err) {
            alert('Failed to download attachment');
        }
    };

    const handleSubmitReply = async () => {
        if (!reply.trim()) {
            alert('Please enter a reply');
            return;
        }

        setSubmitting(true);
        try {
            const adminId = localStorage.getItem('userId');
            if (!adminId) {
                alert('Admin session not found. Please log in again.');
                setSubmitting(false);
                return;
            }

            await API.put(`/tickets/${ticket.ticketId}/reply`, {
                adminId,
                reply
            });
            setReply('');
            onRefresh();
            alert('Reply sent successfully');
            onClose();
        } catch (err) {
            alert('Failed to send reply: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{ticket.subject}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h4>Ticket Details</h4>
                        <div className="detail-grid">
                            <div>
                                <label>Ticket ID:</label>
                                <p>{ticket.ticketId}</p>
                            </div>
                            <div>
                                <label>Status:</label>
                                <select 
                                    value={ticket.status}
                                    onChange={(e) => onStatusChange(e.target.value)}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN-PROGRESS">In Progress</option>
                                    <option value="WAITING-FOR-PATIENT">Waiting</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label>Priority:</label>
                                <p>{ticket.priority}</p>
                            </div>
                            <div>
                                <label>Patient ID:</label>
                                <p>{ticket.patientId}</p>
                            </div>
                            <div>
                                <label>Created:</label>
                                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label>Assigned:</label>
                                <p>{ticket.assignedAdminId || 'Unassigned'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Description</h4>
                        <p>{ticket.description}</p>
                    </div>

                    {attachments.length > 0 && (
                        <div className="detail-section">
                            <h4>Attachments</h4>
                            <div className="attachments-list">
                                {attachments.map(att => (
                                    <div key={att.attachmentId} className="attachment-item">
                                        <span>{att.fileName}</span>
                                        <button
                                            className="btn btn-small btn-primary"
                                            onClick={() => handleDownloadAttachment(att.attachmentId, att.fileName)}
                                        >
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="detail-section">
                        <h4>Reply to Ticket</h4>
                        <textarea
                            className="admin-reply-textarea"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Enter your response..."
                            rows="5"
                        />
                    </div>

                    {ticket.adminReply && (
                        <div className="detail-section admin-reply">
                            <h4>Current Response</h4>
                            <p>{ticket.adminReply}</p>
                            {ticket.repliedBy && <p className="reply-by">Response by: {ticket.repliedBy}</p>}
                            {ticket.firstResponseAt && (
                                <p className="reply-by">First response at: {new Date(ticket.firstResponseAt).toLocaleString()}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-soft" onClick={onClose}>Close</button>
                    {!ticket.assignedAdminId && (
                        <button className="btn btn-warning" onClick={onAssign}>
                            Assign to Me
                        </button>
                    )}
                    <button 
                        className="btn btn-primary"
                        onClick={handleSubmitReply}
                        disabled={submitting}
                    >
                        {submitting ? 'Sending...' : ticket.adminReply ? 'Update Reply' : 'Send Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
}
