export default function EmrRecordList({ records, onEdit, onDelete, isAdmin }) {

    const getStatusClass = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'active': return 'status-active';
            case 'follow-up': return 'status-follow-up';
            case 'discharged': return 'status-discharged';
            case 'critical': return 'status-critical';
            default: return 'status-active';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch { return dateStr; }
    };

    return (
        <div className="emr-table-wrapper">
            <table className="emr-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Patient Username</th>
                        <th>Doctor</th>
                        <th>Visit Date</th>
                        <th>Next Visit</th>
                        <th>Status</th>
                        {isAdmin && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr key={record.id}>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {index + 1}
                            </td>
                            <td>
                                <div style={{ fontWeight: '700' }}>{record.patientFullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {record.gender} • {record.bloodGroup}
                                </div>
                            </td>
                            <td>
                                <span style={{
                                    background: 'rgba(67,97,238,0.09)',
                                    color: '#4361ee',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '8px',
                                    fontSize: '0.78rem',
                                    fontWeight: '700'
                                }}>
                                    {record.patientUsername || '—'}
                                </span>
                            </td>
                            <td>{record.attendingDoctor || '—'}</td>
                            <td>{formatDate(record.visitDate)}</td>
                            <td>{formatDate(record.nextVisitFollowUpDate)}</td>
                            <td>
                                <span className={`status-badge ${getStatusClass(record.status)}`}>
                                    {record.status || 'Active'}
                                </span>
                            </td>
                            {isAdmin && (
                                <td>
                                    <div className="action-cell">
                                        <button
                                            className="btn-edit"
                                            onClick={() => onEdit(record)}
                                            title="Edit Record"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => onDelete(record.id)}
                                            title="Delete Record"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
