import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/TicketManagement.css';

export default function MyTickets({ onNavigateToSubmit }) {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('recent');

    const patientId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/tickets/patient/${patientId}`);
            setTickets(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load tickets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedTicket(null);
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;

        try {
            await API.delete(`/tickets/${ticketId}`);
            setTickets(tickets.filter(t => t.ticketId !== ticketId));
            handleCloseModal();
        } catch (err) {
            alert('Failed to delete ticket: ' + (err.response?.data?.message || err.message));
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

    const filteredTickets = filterStatus === 'ALL' 
        ? tickets 
        : tickets.filter(t => t.status === filterStatus);

    const sortedTickets = [...filteredTickets].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'priority') {
            const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
            return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        }
        return 0;
    });

    const handleCreateNew = () => {
        if (onNavigateToSubmit) onNavigateToSubmit();
        else navigate('/submit-ticket');
    };

    return (
        <div className="ticket-management-page">
            <div className="ticket-header">
                <h1>My Support Tickets</h1>
                <button 
                    className="btn btn-primary"
                    onClick={handleCreateNew}
                >
                    Create New Ticket
                </button>
            </div>

            <div className="ticket-filters">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="ALL">All Tickets</option>
                        <option value="OPEN">Open</option>
                        <option value="IN-PROGRESS">In Progress</option>
                        <option value="WAITING-FOR-PATIENT">Waiting for Me</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                        <option value="priority">Priority</option>
                    </select>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="loading">Loading tickets...</div>
            ) : sortedTickets.length === 0 ? (
                <div className="empty-state">
                    <p>No tickets found</p>
                    <button 
                        className="btn btn-primary"
                        onClick={handleCreateNew}
                    >
                        Create Your First Ticket
                    </button>
                </div>
            ) : (
                <div className="tickets-list">
                    {sortedTickets.map(ticket => (
                        <div key={ticket.ticketId} className="ticket-card glass-panel">
                            <div className="ticket-header-row">
                                <div className="ticket-title-section">
                                    <h3>{ticket.subject}</h3>
                                    <p className="ticket-id">#{ticket.ticketId}</p>
                                </div>
                                <div className="ticket-badges">
                                    <span 
                                        className="badge" 
                                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                                    >
                                        {ticket.status}
                                    </span>
                                    <span 
                                        className="badge" 
                                        style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                    >
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="ticket-meta">
                                <span>Category: {ticket.category || 'General'}</span>
                                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                {ticket.assignedAdminId && <span>Assigned: Yes</span>}
                            </div>

                            <p className="ticket-description">{ticket.description.substring(0, 150)}...</p>

                            <div className="ticket-actions">
                                <button 
                                    className="btn btn-soft"
                                    onClick={() => handleViewDetails(ticket)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDetailModal && selectedTicket && (
                <TicketDetailModal 
                    ticket={selectedTicket}
                    onClose={handleCloseModal}
                    onDelete={() => handleDeleteTicket(selectedTicket.ticketId)}
                    onRefresh={fetchTickets}
                />
            )}
        </div>
    );
}

function TicketDetailModal({ ticket, onClose, onDelete, onRefresh }) {
    const [attachments, setAttachments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        subject: ticket.subject || '',
        description: ticket.description || '',
        priority: ticket.priority || 'MEDIUM',
        category: ticket.category || ''
    });

    const canEdit = !(ticket.adminReply && ticket.adminReply.trim());

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

    const handleSaveEdits = async () => {
        if (!editForm.subject.trim() || !editForm.description.trim()) {
            alert('Subject and description are required');
            return;
        }

        setSaving(true);
        try {
            const patientId = localStorage.getItem('userId') || '';
            const payload = {
                patientId,
                subject: editForm.subject.trim(),
                description: editForm.description.trim(),
                priority: editForm.priority,
                category: editForm.category
            };

            // Prefer guarded patient-edit endpoint; fallback keeps compatibility with older backend builds.
            try {
                await API.put(`/tickets/${ticket.ticketId}/patient-edit`, payload);
            } catch (primaryErr) {
                const status = primaryErr?.response?.status;
                const message = String(primaryErr?.response?.data?.message || primaryErr?.message || '');
                const missingEndpoint = status === 404 || message.includes('No static resource');

                if (!missingEndpoint) {
                    throw primaryErr;
                }

                await API.patch(`/tickets/${ticket.ticketId}`, payload);
            }

            await onRefresh();
            alert('Ticket updated successfully');
            onClose();
        } catch (err) {
            alert('Failed to update ticket: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{ticket.subject}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h4>Ticket Information</h4>
                        <div className="detail-grid">
                            <div>
                                <label>Ticket ID:</label>
                                <p>{ticket.ticketId}</p>
                            </div>
                            <div>
                                <label>Status:</label>
                                <p>{ticket.status}</p>
                            </div>
                            <div>
                                <label>Priority:</label>
                                <p>{ticket.priority}</p>
                            </div>
                            <div>
                                <label>Category:</label>
                                <p>{ticket.category || 'General'}</p>
                            </div>
                            <div>
                                <label>Created:</label>
                                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                            {ticket.firstResponseAt && (
                                <div>
                                    <label>First Response:</label>
                                    <p>{new Date(ticket.firstResponseAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Ticket Content</h4>
                        {isEditing ? (
                            <>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        value={editForm.subject}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
                                        >
                                            <option value="URGENT">URGENT</option>
                                            <option value="HIGH">HIGH</option>
                                            <option value="MEDIUM">MEDIUM</option>
                                            <option value="LOW">LOW</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <input
                                            type="text"
                                            value={editForm.category}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="5"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </>
                        ) : (
                            <p>{ticket.description}</p>
                        )}
                    </div>

                    {ticket.adminReply && (
                        <div className="detail-section admin-reply">
                            <h4>Admin Response</h4>
                            <p>{ticket.adminReply}</p>
                            {ticket.repliedBy && <p className="reply-by">Response by: {ticket.repliedBy}</p>}
                        </div>
                    )}

                    {attachments.length > 0 && (
                        <div className="detail-section">
                            <h4>Attachments ({attachments.length})</h4>
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
                </div>

                <div className="modal-footer">
                    <button className="btn btn-soft" onClick={onClose}>Close</button>
                    {canEdit && !isEditing && (
                        <button className="btn btn-warning" onClick={() => setIsEditing(true)}>
                            Edit Ticket
                        </button>
                    )}
                    {canEdit && isEditing && (
                        <>
                            <button className="btn btn-soft" onClick={() => setIsEditing(false)} disabled={saving}>
                                Cancel Edit
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveEdits} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                    {['OPEN', 'IN-PROGRESS', 'WAITING-FOR-PATIENT'].includes(ticket.status) && (
                        <button 
                            className="btn btn-danger"
                            onClick={() => {
                                if (window.confirm('Delete this ticket?')) {
                                    onDelete();
                                }
                            }}
                        >
                            Delete Ticket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
