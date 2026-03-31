import '../styles/MedicineList.css';

export default function MedicineList({ medicines, onEdit, onDelete }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
        }).format(price);
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return 'Out of Stock';
        if (stock < 10) return 'Low Stock';
        return 'In Stock';
    };

    const getStockClass = (stock) => {
        if (stock === 0) return 'stock-out';
        if (stock < 10) return 'stock-low';
        return 'stock-good';
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="medicine-list-container">
            <table className="medicine-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Medicine Name</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Manufacturer</th>
                        <th>Stock / Reorder</th>
                        <th>Expiry Date</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.map((medicine) => (
                        <tr
                            key={medicine.id}
                            className={isExpired(medicine.expiryDate) ? 'row-expired' : ''}
                        >
                            <td className="medicine-id" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{medicine.id || '—'}</td>
                            <td className="medicine-name" style={{ fontWeight: '600' }}>{medicine.name}</td>
                            <td><span className="category-badge">{medicine.category || '—'}</span></td>
                            <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={medicine.description}>
                                {medicine.description || '—'}
                            </td>
                            <td>{medicine.manufacturer}</td>
                            <td>
                                <span className={`stock-badge ${getStockClass(medicine.stock)}`}>
                                    {medicine.stock} {getStockStatus(medicine.stock)}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Reorder at: {medicine.reorderLevel != null ? medicine.reorderLevel : '—'}
                                </div>
                            </td>
                            <td className={isExpired(medicine.expiryDate) ? 'expired' : ''}>
                                {formatDate(medicine.expiryDate)}
                                {isExpired(medicine.expiryDate) && <span className="expired-label"> (Expired)</span>}
                            </td>
                            <td className="price">{formatPrice(medicine.price)}</td>
                            <td className="actions">
                                <button
                                    onClick={() => onEdit(medicine)}
                                    className="btn-edit"
                                    title="Edit medicine"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(medicine.id)}
                                    className="btn-delete"
                                    title="Delete medicine"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}