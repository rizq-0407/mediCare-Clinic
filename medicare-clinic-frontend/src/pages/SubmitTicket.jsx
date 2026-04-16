import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/TicketManagement.css';

export default function SubmitTicket() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'MEDIUM',
        category: 'General'
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const patientId = localStorage.getItem('userId') || '';

    const categories = [
        'General',
        'Appointment',
        'Prescription',
        'Medicine',
        'Billing',
        'Technical Issue',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!formData.subject || !formData.description) {
                throw new Error('Subject and description are required');
            }

            // Create ticket
            const ticketResponse = await API.post('/tickets', {
                patientId,
                subject: formData.subject,
                description: formData.description,
                priority: formData.priority,
                category: formData.category
            });

            const ticketId = ticketResponse.data.ticketId;

            // Upload attachment if provided
            if (file) {
                const formDataFile = new FormData();
                formDataFile.append('file', file);
                try {
                    await API.post(`/attachments/upload/${ticketId}`, formDataFile, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } catch (err) {
                    console.warn('Attachment upload failed but ticket created:', err);
                }
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/my-tickets');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="success-message glass-panel">
                <h2>✓ Ticket Created Successfully!</h2>
                <p>Your support ticket has been created. You will be redirected shortly...</p>
            </div>
        );
    }

    return (
        <div className="submit-ticket-page">
            <div className="form-container glass-panel">
                <h1>Submit a Support Ticket</h1>
                <p className="form-subtitle">Tell us what's bothering you and we'll help you out</p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subject">Subject *</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Brief description of your issue"
                            maxLength="255"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Please provide detailed information about your issue"
                            rows="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file">Attachment (Optional)</label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.png,.doc,.docx,.xls,.xlsx"
                        />
                        <p className="file-hint">Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button"
                            className="btn btn-soft"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating Ticket...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
