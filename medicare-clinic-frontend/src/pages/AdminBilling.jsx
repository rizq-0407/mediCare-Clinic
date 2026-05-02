import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidWrapper from '../components/LiquidWrapper';

export default function AdminBilling() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [formData, setFormData] = useState({ patientId: '', patientName: '', totalAmount: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [adminCheckout, setAdminCheckout] = useState(null);
    const [amountTendered, setAmountTendered] = useState('');

    const getAuthHeaders = () => {
        const token = sessionStorage.getItem("token");
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchInvoices = () => {
        fetch('http://localhost:8080/api/billing/all', {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem("token")}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => setInvoices(data))
            .catch(err => {
                console.error("Fetch error:", err);
                setInvoices([]); // Safety fallback to prevent crashes
            });
    };

    useEffect(() => { 
        if (!sessionStorage.getItem("token")) {
            navigate('/login');
        } else {
            fetchInvoices(); 
        }
    }, [navigate]);

    const handleCreateInvoice = (e) => {
        e.preventDefault();
        fetch('http://localhost:8080/api/billing', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...formData, totalAmount: parseFloat(formData.totalAmount), status: 'UNPAID' })
        })
            .then(res => {
                if (res.ok) {
                    setFormData({ patientId: '', patientName: '', totalAmount: '' });
                    fetchInvoices();
                } else {
                    alert("Database blocked creation! Check Patient ID.");
                }
            });
    };

    const handleProcessPayment = (invoiceId, method) => {
        fetch(`http://localhost:8080/api/billing/${invoiceId}/pay?method=${method}`, { 
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem("token")}` }
        })
            .then(res => {
                if(res.ok) {
                    setAdminCheckout(null);
                    setAmountTendered('');
                    fetchInvoices();
                }
            });
    };

    const handleDelete = (invoiceId) => {
        if(window.confirm(`Delete invoice ${invoiceId}?`)) {
            fetch(`http://localhost:8080/api/billing/${invoiceId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem("token")}` }
            })
                .then(res => { if(res.ok) fetchInvoices(); });
        }
    };

    const handlePatientIdInput = (e) => {
        let val = e.target.value.toUpperCase();
        if (/^\d/.test(val)) val = 'PAT' + val.padStart(3, '0');
        setFormData({...formData, patientId: val});
    };

    // THE SAFETY PATCH: Fallback to empty array if backend fails
    const filteredInvoices = (invoices || []).filter(inv => {
        const s = searchTerm.toLowerCase();
        return (inv.invoiceId?.toLowerCase().includes(s) ||
            inv.patientId?.toLowerCase().includes(s) ||
            inv.patientName?.toLowerCase().includes(s));
    });

    const changeDue = amountTendered ? (parseFloat(amountTendered) - adminCheckout?.totalAmount).toFixed(2) : '0.00';

    return (
        <LiquidWrapper>
            <div className="animate-fade-in" style={{ minHeight: '100vh', position: 'relative' }}>

                {/* Background decorations */}
                <div className="bg-decor-container">
                    <div className="float-circle"></div>
                    <div className="float-symbol">☤</div>
                </div>

                {/* Top Navigation */}
                <nav className="top-nav">
                    <div className="logo">
                        <div className="logo-m">M</div>
                        <span>Global Billing</span>
                    </div>
                    <button onClick={() => navigate('/admin')} className="btn btn-soft">
                        Return to Dashboard
                    </button>
                </nav>

                <main className="main-content">
                    <header className="header-row">
                        <div>
                            <h1>Admin Billing & Invoices</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Manage patient transactions and checkout.</p>
                        </div>
                    </header>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Issue New Bill Card */}
                        <div className="soft-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Issue New Bill</h3>
                            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <input type="text" placeholder="Patient ID (e.g., PAT001)" required value={formData.patientId} onChange={handlePatientIdInput} className="form-input" />
                                </div>
                                <div style={{ flex: 2 }}>
                                    <input type="text" placeholder="Patient Full Name" required value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="form-input" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input type="number" placeholder="Amount (Rs.)" required step="0.01" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} className="form-input" />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Generate</button>
                            </form>
                        </div>

                        {/* Search Bar */}
                        <div className="soft-card" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className="stat-icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem', background: 'transparent' }}>🔍</span>
                            <input type="text" placeholder="Search by Invoice # or Patient ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input" style={{ border: 'none', boxShadow: 'none', background: 'transparent', padding: '0', fontSize: '1.1rem' }} />
                        </div>

                        {/* Data Table */}
                        <div className="soft-card" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <tr>
                                    <th style={{ padding: '1.5rem' }}>Invoice #</th>
                                    <th style={{ padding: '1.5rem' }}>Patient Info</th>
                                    <th style={{ padding: '1.5rem' }}>Amount</th>
                                    <th style={{ padding: '1.5rem' }}>Status</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.invoiceId} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }} className="hover:bg-white/50">
                                        <td style={{ padding: '1.5rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem' }}>{inv.invoiceId}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{inv.patientName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{inv.patientId}</div>
                                        </td>
                                        <td style={{ padding: '1.5rem', fontWeight: '800', fontSize: '1.2rem' }}>Rs. {inv.totalAmount?.toFixed(2)}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                                <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                                                    {inv.status}
                                                </span>
                                        </td>
                                        <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                            {inv.status === 'UNPAID' ? (
                                                <button onClick={() => setAdminCheckout(inv)} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Checkout</button>
                                            ) : (
                                                <button className="btn btn-soft" style={{ padding: '0.6rem 1.2rem', opacity: '0.5', cursor: 'not-allowed' }} disabled>Paid</button>
                                            )}
                                            <button onClick={() => handleDelete(inv.invoiceId)} className="btn btn-soft" style={{ padding: '0.6rem 1rem', color: 'var(--danger)' }}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            No invoices found in the system.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Checkout POS Modal */}
                    {adminCheckout && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                            <div className="soft-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Clinic POS</h3>
                                    <button onClick={() => setAdminCheckout(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                                </div>

                                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-sidebar)' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Paying for: <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{adminCheckout.patientName}</strong></p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                        <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Amount Due:</span>
                                        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>Rs. {adminCheckout.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Cash Received (Rs.)</label>
                                    <input type="number" value={amountTendered} onChange={(e) => setAmountTendered(e.target.value)} className="form-input" style={{ fontSize: '2rem', fontWeight: '800', padding: '1.2rem', textAlign: 'center' }} placeholder="0.00" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Change Due:</span>
                                    <span style={{ fontWeight: '800', fontFamily: 'monospace', color: changeDue >= 0 ? 'var(--success)' : 'var(--danger)' }}>Rs. {changeDue}</span>
                                </div>

                                <button onClick={() => handleProcessPayment(adminCheckout.invoiceId, 'CASH')} disabled={changeDue < 0} className={`btn ${changeDue >= 0 ? 'btn-primary' : 'btn-soft'}`} style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
                                    {changeDue < 0 ? 'Insufficient Funds' : 'Complete Transaction'}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </LiquidWrapper>
    );
}