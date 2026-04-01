import { useState, useEffect } from 'react';
import '../styles/PrescriptionForm.css';

/**
 * PrescriptionForm — shared between Pharmacy and Doctor dashboards.
 *
 * Props:
 *  - onSubmit(formData)   : called with the form data on valid submit
 *  - initialData          : pre-fill for edit mode
 *  - onCancel()           : called when Cancel is clicked
 *  - medicines            : [{ id, name, dosage }]
 *  - patients             : [{ id, name }]
 *  - lockedDoctorId       : if provided, doctor ID field is pre-filled and locked (read-only)
 */
export default function PrescriptionForm({
    onSubmit,
    initialData,
    onCancel,
    medicines = [],
    patients = [],
    lockedDoctorId = ''
}) {
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: lockedDoctorId || '',
        medicineId: '',
        dosage: '',
        duration: '',
        instructions: '',
        refills: 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, doctorId: lockedDoctorId || initialData.doctorId || '' });
        } else {
            setFormData(prev => ({ ...prev, doctorId: lockedDoctorId || prev.doctorId }));
        }
    }, [initialData, lockedDoctorId]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.patientId)        newErrors.patientId  = 'Patient is required';
        if (!formData.doctorId)         newErrors.doctorId   = 'Doctor ID is required';
        if (!formData.medicineId)       newErrors.medicineId = 'Medicine is required';
        if (!formData.dosage?.trim())   newErrors.dosage     = 'Dosage is required';
        if (!formData.duration?.trim()) newErrors.duration   = 'Duration is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
            if (!initialData) {
                setFormData({
                    patientId: '',
                    doctorId: lockedDoctorId || '',
                    medicineId: '',
                    dosage: '',
                    duration: '',
                    instructions: '',
                    refills: 0
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="prescription-form">

            {/* ── Row 1: Patient | Doctor ── */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="patientId">Select Patient *</label>
                    <select
                        id="patientId"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        className={errors.patientId ? 'input-error' : ''}
                    >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} (ID: {patient.id})
                            </option>
                        ))}
                    </select>
                    {errors.patientId && <span className="error-text">{errors.patientId}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="doctorId">Doctor ID *</label>
                    <input
                        type="text"
                        id="doctorId"
                        name="doctorId"
                        placeholder="e.g., DOC001"
                        value={formData.doctorId}
                        onChange={handleChange}
                        readOnly={!!lockedDoctorId}
                        style={lockedDoctorId ? {
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            fontWeight: '700',
                            cursor: 'not-allowed',
                            border: '1.5px solid var(--primary)'
                        } : {}}
                        className={errors.doctorId ? 'input-error' : ''}
                    />
                    {lockedDoctorId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.3rem', display: 'block' }}>
                            🔒 Auto-filled from your login session
                        </span>
                    )}
                    {errors.doctorId && <span className="error-text">{errors.doctorId}</span>}
                </div>
            </div>

            {/* ── Row 2: Medicine | Dosage ── */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="medicineId">Select Medicine *</label>
                    <select
                        id="medicineId"
                        name="medicineId"
                        value={formData.medicineId}
                        onChange={handleChange}
                        className={errors.medicineId ? 'input-error' : ''}
                    >
                        <option value="">-- Choose Medicine --</option>
                        {medicines.map(medicine => (
                            <option key={medicine.id} value={medicine.id}>
                                {medicine.name}{medicine.dosage ? ` (${medicine.dosage})` : ''}
                            </option>
                        ))}
                    </select>
                    {errors.medicineId && <span className="error-text">{errors.medicineId}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="dosage">Dosage *</label>
                    <input
                        type="text"
                        id="dosage"
                        name="dosage"
                        placeholder="e.g., 2 tablets daily"
                        value={formData.dosage}
                        onChange={handleChange}
                        className={errors.dosage ? 'input-error' : ''}
                    />
                    {errors.dosage && <span className="error-text">{errors.dosage}</span>}
                </div>
            </div>

            {/* ── Row 3: Duration | Refills ── */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="duration">Duration *</label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        placeholder="e.g., 7 days, 2 weeks"
                        value={formData.duration}
                        onChange={handleChange}
                        className={errors.duration ? 'input-error' : ''}
                    />
                    {errors.duration && <span className="error-text">{errors.duration}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="refills">Refills</label>
                    <input
                        type="number"
                        id="refills"
                        name="refills"
                        placeholder="0"
                        value={formData.refills}
                        onChange={handleChange}
                        min="0"
                        max="5"
                    />
                </div>
            </div>

            {/* ── Instructions ── */}
            <div className="form-group">
                <label htmlFor="instructions">Special Instructions</label>
                <textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Add any special instructions (take with food, avoid certain activities, etc.)"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows="3"
                />
            </div>

            {/* ── Actions ── */}
            <div className="form-actions">
                <button type="submit" className="btn-submit">
                    {initialData ? '💾 Update Prescription' : '✅ Create Prescription'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}