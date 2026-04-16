import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/TicketManagement.css';

export default function AdminFeedbackManagement() {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [filterRating, setFilterRating] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const response = await API.get('/feedback');
            setFeedback(response.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load feedback');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    let filteredFeedback = feedback;

    if (filterRating !== 'ALL') {
        filteredFeedback = filteredFeedback.filter((f) => String(f.rating) === filterRating);
    }

    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filteredFeedback = filteredFeedback.filter((f) =>
            (f.feedbackId || '').toLowerCase().includes(term) ||
            (f.patientId || '').toLowerCase().includes(term) ||
            (f.comments || '').toLowerCase().includes(term)
        );
    }

    const repliedCount = feedback.filter((f) => f.adminReply && f.adminReply.trim()).length;
    const pendingCount = feedback.length - repliedCount;
    const avgRating = feedback.length
        ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
        : '0.0';

    return (
        <div className="admin-ticket-page">
            <div className="page-header">
                <h1>Feedback Management</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <h4>Total Feedback</h4>
                    <p className="stat-value">{feedback.length}</p>
                </div>
                <div className="stat-card glass-panel">
                    <h4>Pending Feedback</h4>
                    <p className="stat-value" style={{ color: '#ff922b' }}>{pendingCount}</p>
                </div>
                <div className="stat-card glass-panel">
                    <h4>Replied Feedback</h4>
                    <p className="stat-value" style={{ color: '#69db7c' }}>{repliedCount}</p>
                </div>
                <div className="stat-card glass-panel">
                    <h4>Average Rating</h4>
                    <p className="stat-value" style={{ color: '#ffd43b' }}>{avgRating}</p>
                </div>
            </div>

            <div className="filters-section glass-panel">
                <div className="filter-group">
                    <label>Rating:</label>
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        <option value="ALL">All</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>

                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search by feedback ID, patient ID, or comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="loading">Loading feedback...</div>
            ) : filteredFeedback.length === 0 ? (
                <div className="empty-state glass-panel">
                    <p>No feedback found</p>
                </div>
            ) : (
                <div className="tickets-table-container">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>Feedback ID</th>
                                <th>Patient ID</th>
                                <th>Rating</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedback.map((item) => {
                                return (
                                    <tr key={item.feedbackId}>
                                        <td className="ticket-id">{item.feedbackId}</td>
                                        <td>{item.patientId}</td>
                                        <td>
                                            {'★'.repeat(item.rating || 0)}
                                            <span className="empty-stars">{'☆'.repeat(5 - (item.rating || 0))}</span>
                                        </td>
                                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <button
                                                className="btn btn-small btn-primary"
                                                onClick={() => {
                                                    setSelectedFeedback(item);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showDetailModal && selectedFeedback && (
                <AdminFeedbackDetailModal
                    feedback={selectedFeedback}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedFeedback(null);
                    }}
                />
            )}
        </div>
    );
}

function AdminFeedbackDetailModal({ feedback, onClose }) {

    const isReplied = !!(feedback.adminReply && feedback.adminReply.trim());

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Feedback {feedback.feedbackId}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h4>Feedback Details</h4>
                        <div className="detail-grid">
                            <div>
                                <label>Feedback ID:</label>
                                <p>{feedback.feedbackId}</p>
                            </div>
                            <div>
                                <label>Patient ID:</label>
                                <p>{feedback.patientId}</p>
                            </div>
                            <div>
                                <label>Rating:</label>
                                <p>
                                    {'★'.repeat(feedback.rating || 0)}
                                    <span className="empty-stars">{'☆'.repeat(5 - (feedback.rating || 0))}</span>
                                </p>
                            </div>
                            <div>
                                <label>Visibility:</label>
                                <p>{feedback.isPublic ? 'Public' : 'Private'}</p>
                            </div>
                            <div>
                                <label>Created:</label>
                                <p>{feedback.createdAt ? new Date(feedback.createdAt).toLocaleString() : '-'}</p>
                            </div>
                            <div>
                                <label>Status:</label>
                                <p>{isReplied ? 'Replied' : 'Pending Reply'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Patient Comments</h4>
                        <p>{feedback.comments || 'No comments provided.'}</p>
                    </div>

                    {isReplied && (
                        <div className="detail-section admin-reply">
                            <h4>Current Admin Reply</h4>
                            <p>{feedback.adminReply}</p>
                            {feedback.repliedBy && <p className="reply-by">Response by: {feedback.repliedBy}</p>}
                        </div>
                    )}

                </div>

                <div className="modal-footer">
                    <button className="btn btn-soft" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
