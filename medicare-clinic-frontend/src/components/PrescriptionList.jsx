import '../styles/PrescriptionList.css';

export default function PrescriptionList({ prescriptions, onEdit, onDelete }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="prescription-list-container">
            <table className="prescription-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient ID</th>
                        <th>Doctor ID</th>
                        <th>Medicine ID</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Refills</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions && prescriptions.length > 0 ? (
                        prescriptions.map((script) => (
                            <tr key={script.id || Math.random()}>
                                <td className="script-id">#{script.id}</td>
                                <td>{script.patientId}</td>
                                <td>{script.doctorId}</td>
                                <td>{script.medicineId}</td>
                                <td>{script.dosage}</td>
                                <td>{script.duration}</td>
                                <td>
                                    <span className={`refill-badge ${script.refills > 0 ? 'has-refills' : 'no-refills'}`}>
                                        {script.refills}
                                    </span>
                                </td>
                                <td>{formatDate(script.createdAt || script.date)}</td>
                                <td className="actions">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(script)}
                                            className="btn-edit"
                                            title="Edit prescription"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(script.id)}
                                            className="btn-delete"
                                            title="Delete prescription"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="no-data-cell">No prescriptions available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
