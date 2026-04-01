import '../styles/MedicineList.css';

export default function MedicineList({ medicines, onEdit, onDelete }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
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
        const options = { month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="medicine-list-container">
            <table className="medicine-table">
                <thead>
                    <tr>
                        <th style={{ width: '30%' }}>Medicine & Identity</th>
                        <th style={{ width: '15%' }}>Category</th>
                        <th style={{ width: '15%' }}>Inventory</th>
                        <th style={{ width: '15%' }}>Expiry</th>
                        <th style={{ width: '15%' }}>Unit Price</th>
                        <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.map((medicine) => (
                        <tr key={medicine.id} className={isExpired(medicine.expiryDate) ? 'row-expired' : ''}>
                            <td className="medicine-identity-cell">
                                <div className="medicine-name">{medicine.name}</div>
                                <div className="medicine-manufacturer">{medicine.manufacturer || 'General Pharma'}</div>
                            </td>
                            <td>
                                <span className="category-badge">{medicine.category || 'Medicine'}</span>
                            </td>
                            <td>
                                <div className={`stock-badge ${getStockClass(medicine.stock)}`}>
                                    <span className="status-indicator">{getStockStatus(medicine.stock)}</span>
                                    <div className="stock-count">
                                        {medicine.stock} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UNITS</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className={`expiry-info ${isExpired(medicine.expiryDate) ? 'expired' : ''}`}>
                                    <div className="expiry-date">{formatDate(medicine.expiryDate)}</div>
                                    <div className="expiry-status">
                                        {isExpired(medicine.expiryDate) ? '⚠️ EXPIRED' : 'VALID'}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="price-tag">
                                    <span className="price-currency">PKR</span>
                                    {formatPrice(medicine.price)}
                                </div>
                            </td>
                            <td>
                                <div className="actions-cell">
                                    <button 
                                        className="action-btn btn-edit" 
                                        onClick={() => onEdit(medicine)}
                                        title="Edit"
                                    >
                                        ✎
                                    </button>
                                    <button 
                                        className="action-btn btn-delete" 
                                        onClick={() => onDelete(medicine.id)}
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}