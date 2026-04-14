import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmrRecordList from '../components/EmrRecordList';
import API from '../services/api';
import '../styles/Emr.css';

export default function EmrDashboard() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get the current user's role
    const currentRole = sessionStorage.getItem('role');
    const canManageEmr = ['ADMIN', 'DOCTOR', 'PHARMACY'].includes(currentRole);

    // READ - Fetch records on component mount
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const response = await API.get('/emr');
            setRecords(response.data || []);
            setError(null);
        } catch (err) {
            setError('Error fetching records: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    // DELETE - Remove record
    const handleDeleteRecord = async (id) => {
        if (!canManageEmr) {
            alert('Only ADMIN, DOCTOR, or PHARMACY can delete EMR records.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await API.delete(`/emr/${id}`);
                setRecords(records.filter(r => r.id !== id));
                setError(null);
            } catch (err) {
                setError('Error deleting record: ' + (err.response?.data?.message || err.message));
                console.error('Error deleting record:', err);
            }
        }
    };

    const handleEditRecord = (record) => {
        if (!canManageEmr) {
            alert('Only ADMIN, DOCTOR, or PHARMACY can edit EMR records.');
            return;
        }
        navigate('/emr/new', { state: { record } });
    };

    const handleCreateRecord = () => {
        if (!canManageEmr) {
            alert('Only ADMIN, DOCTOR, or PHARMACY can create EMR records.');
            return;
        }
        navigate('/emr/new');
    };

    return (
        <div className="emr-container">
            <div className="emr-header">
                <h1>Receptionist EMR Dashboard</h1>
                <p>Manage Medical Forms & Records</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {canManageEmr && (
                <div className="emr-controls">
                    <button
                        onClick={handleCreateRecord}
                        className="btn-primary"
                    >
                        + Create New Record
                    </button>
                </div>
            )}

            <div className="records-section">
                <h2>Medical Records</h2>
                {loading ? (
                    <p className="loading">Loading records...</p>
                ) : records.length === 0 ? (
                    <p className="no-data">No records found. Create one to get started!</p>
                ) : (
                    <EmrRecordList
                        records={records}
                        onEdit={handleEditRecord}
                        onDelete={handleDeleteRecord}
                        isAdmin={canManageEmr}
                    />
                )}
            </div>
        </div>
    );
}