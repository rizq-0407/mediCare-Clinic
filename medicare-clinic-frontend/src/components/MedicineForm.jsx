import { useState, useEffect } from 'react';
import '../styles/MedicineForm.css';

const MEDICINE_CATEGORIES = [
    'Analgesic',
    'Antibiotic',
    'Antiviral',
    'Antifungal',
    'Antihistamine',
    'Antihypertensive',
    'Antidiabetic',
    'Antidepressant',
    'Anti-inflammatory',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Vitamins & Supplements',
    'Dermatological',
    'Hormonal',
    'Other',
];

export default function MedicineForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        stock: '',
        reorderLevel: '',
        price: '',
        manufacturer: '',
        expiryDate: '',
        description: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock level is required';
        if (!formData.price || formData.price < 0) newErrors.price = 'Valid price is required';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
            if (!initialData) {
                setFormData({
                    name: '',
                    category: '',
                    stock: '',
                    reorderLevel: '',
                    price: '',
                    manufacturer: '',
                    expiryDate: '',
                    description: ''
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="medicine-form">

            {/* Row 1: Medicine Name + Category */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="name">Medicine Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="e.g., Aspirin"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className={errors.category ? 'input-error' : ''}
                    >
                        <option value="">-- Select Category --</option>
                        {MEDICINE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <span className="error-text">{errors.category}</span>}
                </div>
            </div>

            {/* Row 2: Reorder Level + Manufacturer */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="reorderLevel">Reorder Level Alert</label>
                    <input
                        type="number"
                        id="reorderLevel"
                        name="reorderLevel"
                        placeholder="e.g., 10"
                        min="0"
                        value={formData.reorderLevel}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="manufacturer">Manufacturer / Supplier *</label>
                    <input
                        type="text"
                        id="manufacturer"
                        name="manufacturer"
                        placeholder="e.g., Pharma Ltd"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className={errors.manufacturer ? 'input-error' : ''}
                    />
                    {errors.manufacturer && <span className="error-text">{errors.manufacturer}</span>}
                </div>
            </div>

            {/* Row 3: Stock + Price */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="stock">Stock Level *</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        placeholder="0"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        className={errors.stock ? 'input-error' : ''}
                    />
                    {errors.stock && <span className="error-text">{errors.stock}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price (PKR) *</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className={errors.price ? 'input-error' : ''}
                    />
                    {errors.price && <span className="error-text">{errors.price}</span>}
                </div>
            </div>

            {/* Row 4: Expiry Date */}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className={errors.expiryDate ? 'input-error' : ''}
                    />
                    {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                </div>
                <div className="form-group" /> {/* spacer */}
            </div>

            {/* Description */}
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Add any additional information about this medicine..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-submit">
                    {initialData ? 'Update Medicine' : 'Add Medicine'}
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