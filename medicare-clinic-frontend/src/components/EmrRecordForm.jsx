import { useState } from 'react';

export default function EmrRecordForm({ onSubmit, initialData, onCancel, apiErrors }) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        patientFullName: initialData?.patientFullName || '',
        patientUsername: initialData?.patientUsername || '',
        dateOfBirth: initialData?.dateOfBirth || '',
        gender: initialData?.gender || 'Male',
        bloodGroup: initialData?.bloodGroup || 'O+',
        allergies: initialData?.allergies || '',
        attendingDoctor: initialData?.attendingDoctor || '',
        visitDate: initialData?.visitDate || today,
        nextVisitFollowUpDate: initialData?.nextVisitFollowUpDate || '',
        status: initialData?.status || 'Active',
    });

    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.dateOfBirth && formData.dateOfBirth > today) {
            setLocalError('Date of birth cannot be in the future.');
            return;
        }

        if (formData.visitDate !== today) {
            setLocalError('Visit date must be today only.');
            return;
        }

        if (formData.nextVisitFollowUpDate && formData.nextVisitFollowUpDate < today) {
            setLocalError('Next visit / follow-up date cannot be in the past.');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {(localError || (apiErrors && Object.keys(apiErrors).length > 0)) && (
                <div
                    className="error-message"
                    style={{
                        marginBottom: '20px',
                        color: 'red',
                        padding: '10px',
                        border: '1px solid red',
                        borderRadius: '5px',
                        backgroundColor: '#ffe6e6'
                    }}
                >
                    {localError ? (
                        <strong style={{ color: 'darkred' }}>{localError}</strong>
                    ) : (
                        <>
                            <strong style={{ color: 'darkred' }}>Please fix the following validation errors:</strong>
                            <ul style={{ marginTop: '5px', paddingLeft: '20px', color: 'darkred' }}>
                                {Object.entries(apiErrors).map(([field, msg]) => (
                                    <li key={field}>{msg}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            <div className="emr-form-grid">
                <div className="form-section-title">Patient Information</div>

                <div className="form-field">
                    <label>Patient Full Name *</label>
                    <input
                        type="text"
                        name="patientFullName"
                        value={formData.patientFullName}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Patient Username</label>
                    <input
                        type="text"
                        name="patientUsername"
                        value={formData.patientUsername}
                        onChange={handleChange}
                        placeholder="e.g. johndoe123"
                    />
                </div>

                <div className="form-field">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        max={today}
                    />
                </div>

                <div className="form-field">
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="">Select...</option>
                    </select>
                </div>

                <div className="form-field">
                    <label>Blood Group</label>
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                    >
                        <option value="">Select...</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <option key={bg} value={bg}>
                                {bg}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>Allergies</label>
                    <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="e.g. Penicillin, Dust"
                    />
                </div>

                <div className="form-section-title">Visit & Clinical Details</div>

                <div className="form-field">
                    <label>Attending Doctor</label>
                    <input
                        type="text"
                        name="attendingDoctor"
                        value={formData.attendingDoctor}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Smith"
                    />
                </div>

                <div className="form-field">
                    <label>Visit Date *</label>
                    <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleChange}
                        min={today}
                        max={today}
                        required
                    />
                </div>

                <div className="form-field">
                    <label>Next Visit / Follow-up Date</label>
                    <input
                        type="date"
                        name="nextVisitFollowUpDate"
                        value={formData.nextVisitFollowUpDate}
                        onChange={handleChange}
                        min={today}
                    />
                </div>

                <div className="form-field">
                    <label>Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Follow-Up">Follow-Up</option>
                        <option value="Discharged">Discharged</option>
                        <option value="Critical">Critical</option>
                        <option value="">Select...</option>
                    </select>
                </div>
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                >
                    {submitting
                        ? '⏳ Saving...'
                        : initialData
                            ? '✅ Update Record'
                            : '💾 Save Record'}
                </button>
            </div>
        </form>
    );
}