import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmrRecordForm from '../components/EmrRecordForm';
import API from '../services/api';
import '../styles/Emr.css';

export default function EmrFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [apiErrors, setApiErrors] = useState({});
    
    // Check if we are editing an existing record passed via state
    const editingRecord = location.state?.record || null;

    // Helper to clean up empty date strings into nulls
    const cleanPayload = (data) => {
        const payload = { ...data };
        if (!payload.dateOfBirth) payload.dateOfBirth = null;
        if (!payload.nextVisitFollowUpDate) payload.nextVisitFollowUpDate = null;
        if (!payload.visitDate) payload.visitDate = null;
        return payload;
    };

    // CREATE - Add new record
    const handleAddRecord = async (recordData) => {
        setError(null);
        setApiErrors({});
        try {
            await API.post('/emr', cleanPayload(recordData));
            navigate('/emr');
        } catch (err) {
            handleApiError(err, 'creating');
        }
    };

    // UPDATE - Edit record
    const handleUpdateRecord = async (id, updatedData) => {
        setError(null);
        setApiErrors({});
        try {
            await API.put(`/emr/${id}`, cleanPayload(updatedData));
            navigate('/emr');
        } catch (err) {
            handleApiError(err, 'updating');
        }
    };

    const handleApiError = (err, action) => {
        console.error(`Error ${action} record:`, err);
        const errResp = err.response?.data;
        if (errResp && typeof errResp === 'object' && !errResp.message) {
            // Field validation errors object from Spring Boot
            if (errResp.error && typeof errResp.error === 'string') {
                setError(`Error ${action} record: ${errResp.error}`);
            } else {
                setApiErrors(errResp);
                setError('Validation failed. Please check the fields below.');
            }
        } else {
            const errorMsg = errResp?.message || err.message;
            setError(`Error ${action} record: ${errorMsg}`);
        }
    };

    const handleCancel = () => {
        navigate('/emr');
    };

    return (
        <div className="emr-container">
            <div className="emr-header">
                <h1>{editingRecord ? 'Edit Medical Record' : 'Create New Medical Record'}</h1>
                <p>Fill out the form below to save the patient's record</p>
            </div>

            {error && <div className="error-message" style={{marginBottom: "20px"}}>{error}</div>}

            <div className="emr-controls">
                <button
                    onClick={handleCancel}
                    className="btn-primary"
                    style={{ backgroundColor: '#6c757d', marginBottom: "20px" }}
                >
                    &larr; Back to Records
                </button>
            </div>

            <div className="emr-form-container">
                <h3>{editingRecord ? 'Edit Record Form' : 'New Record Form'}</h3>
                <EmrRecordForm
                    onSubmit={editingRecord ? 
                        (data) => handleUpdateRecord(editingRecord.id, data) : 
                        handleAddRecord
                    }
                    initialData={editingRecord}
                    onCancel={handleCancel}
                    apiErrors={apiErrors}
                />
            </div>
        </div>
    );
}
