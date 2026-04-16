import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/TicketManagement.css';

export default function PatientFeedback() {
    const [feedback, setFeedback] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        rating: 5,
        comments: '',
        isPublic: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        rating: 5,
        comments: '',
        isPublic: false
    });

    const patientId = localStorage.getItem('userId') || '';

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/feedback/patient/${patientId}`);
            setFeedback(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load feedback');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await API.post('/feedback', {
                patientId,
                rating: parseInt(formData.rating),
                comments: formData.comments,
                isPublic: formData.isPublic
            });

            setFeedback([response.data, ...feedback]);
            setFormData({ rating: 5, comments: '', isPublic: false });
            setShowForm(false);
            alert('Thank you for your feedback!');
        } catch (err) {
            alert('Failed to submit feedback: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (!window.confirm('Delete this feedback?')) return;

        try {
            await API.delete(`/feedback/${feedbackId}`);
            setFeedback(feedback.filter(f => f.feedbackId !== feedbackId));
        } catch (err) {
            alert('Failed to delete feedback');
        }
    };

    const handleStartEdit = (item) => {
        setEditingId(item.feedbackId);
        setEditData({
            rating: item.rating,
            comments: item.comments || '',
            isPublic: !!item.isPublic
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ rating: 5, comments: '', isPublic: false });
    };

    const handleEditFeedback = async (feedbackId) => {
        try {
            const response = await API.put(`/feedback/${feedbackId}`, {
                patientId,
                rating: parseInt(editData.rating),
                comments: editData.comments,
                isPublic: editData.isPublic
            });
            setFeedback(feedback.map(f => f.feedbackId === feedbackId ? response.data : f));
            handleCancelEdit();
        } catch (err) {
            alert('Failed to update feedback: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="feedback-page">
            <div className="feedback-header">
                <h1>My Feedback & Ratings</h1>
                {!showForm && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        + Submit Feedback
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <div className="feedback-form glass-panel">
                    <h3>Share Your Feedback</h3>
                    <form onSubmit={handleSubmitFeedback}>
                        <div className="form-group">
                            <label>Rating (1-5 stars) *</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star ${parseInt(formData.rating) >= star ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="comments">Comments</label>
                            <textarea
                                id="comments"
                                value={formData.comments}
                                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Share your experience with our service..."
                                rows="4"
                            />
                        </div>

                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                            />
                            <label htmlFor="isPublic">Make this feedback public</label>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button"
                                className="btn btn-soft"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading feedback...</div>
            ) : feedback.length === 0 ? (
                <div className="empty-state glass-panel">
                    <p>You haven't submitted any feedback yet</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Submit Your First Feedback
                    </button>
                </div>
            ) : (
                <div className="feedback-list">
                    {feedback.map(item => (
                        <div key={item.feedbackId} className="feedback-card glass-panel">
                            <div className="feedback-header">
                                <div className="rating-display">
                                    {'★'.repeat(editingId === item.feedbackId ? parseInt(editData.rating) : item.rating)}
                                    <span className="empty-stars">{'☆'.repeat(5 - (editingId === item.feedbackId ? parseInt(editData.rating) : item.rating))}</span>
                                </div>
                                <div className="feedback-actions">
                                    {item.isPublic && <span className="badge badge-public">Public</span>}
                                    {!(item.adminReply && item.adminReply.trim()) && (
                                        <button
                                            className="btn-edit-feedback"
                                            onClick={() => handleStartEdit(item)}
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDeleteFeedback(item.feedbackId)}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <p className="feedback-date">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </p>

                            {editingId === item.feedbackId ? (
                                <div className="detail-section" style={{ marginTop: '0.8rem', marginBottom: 0, paddingBottom: 0 }}>
                                    <div className="form-group">
                                        <label>Rating</label>
                                        <div className="rating-input" style={{ margin: '0.4rem 0 0.8rem' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star ${parseInt(editData.rating) >= star ? 'active' : ''}`}
                                                    onClick={() => setEditData(prev => ({ ...prev, rating: star }))}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Comments</label>
                                        <textarea
                                            rows="4"
                                            value={editData.comments}
                                            onChange={(e) => setEditData(prev => ({ ...prev, comments: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group checkbox">
                                        <input
                                            type="checkbox"
                                            id={`isPublic-${item.feedbackId}`}
                                            checked={editData.isPublic}
                                            onChange={(e) => setEditData(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        />
                                        <label htmlFor={`isPublic-${item.feedbackId}`}>Make this feedback public</label>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: '1rem' }}>
                                        <button className="btn btn-soft" onClick={handleCancelEdit}>Cancel</button>
                                        <button className="btn btn-primary" onClick={() => handleEditFeedback(item.feedbackId)}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="feedback-comments">{item.comments}</p>
                            )}

                            {item.adminReply && (
                                <div className="detail-section admin-reply" style={{ marginTop: '1rem', marginBottom: 0, paddingBottom: '1rem' }}>
                                    <h4>Admin Reply</h4>
                                    <p>{item.adminReply}</p>
                                    {item.repliedBy && <p className="reply-by">Response by: {item.repliedBy}</p>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
