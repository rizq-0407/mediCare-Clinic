import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import LiquidWrapper from '../components/LiquidWrapper';

// STRIPE KEY
const stripePromise = loadStripe('pk_test_51T7OwxBW2vCuBNMmXzZUZfQWge7ewqFsWCF1oAEXyqxdRFBqZawJTGJvyDril6lbpwEDheO0R46LkyXbbmgMk8PL00AlJDoQzf');

export default function PatientBilling() {
    const location = useLocation();
    const navigate = useNavigate();

    // Grab the patientId passed from the dashboard
    const patientId = location.state?.patientId;

    const [invoices, setInvoices] = useState([]);
    const [patientStripe, setPatientStripe] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (!patientId) navigate('/patient');
        else fetchInvoices();
    }, [patientId, navigate]);

    const fetchInvoices = () => {
        fetch(`http://localhost:8080/api/billing/patient/${patientId}`)
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

    const handleOpenStripe = (inv) => {
        fetch('http://localhost:8080/api/billing/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: inv.totalAmount })
        })
            .then(res => res.json())
            .then(data => {
                setClientSecret(data.clientSecret);
                setPatientStripe(inv);
            });
    };

    const handlePaymentSuccess = (invoiceId, method) => {
        fetch(`http://localhost:8080/api/billing/${invoiceId}/pay?method=${method}`, { method: 'PUT' })
            .then(res => {
                if(res.ok) {
                    setPatientStripe(null);
                    setClientSecret('');
                    fetchInvoices();
                }
            });
    };

    if (!patientId) return null;

    // Safety fallback: Ensure invoices is always an array
    const safeInvoices = invoices || [];

    return (
        <LiquidWrapper>
            <div className="animate-fade-in" style={{ minHeight: '100vh', position: 'relative' }}>

                {/* Background deco*/}
                <div className="bg-decor-container">
                    <div className="float-circle"></div>
                    <div className="float-symbol">💳</div>
                </div>

                {/* Top Navigation */}
                <nav className="top-nav">
                    <div className="logo">
                        <div className="logo-m">M</div>
                        <span>Patient Billing</span>
                    </div>
                    <button onClick={() => navigate('/patient')} className="btn btn-soft">
                        Return to Dashboard
                    </button>
                </nav>

                <main className="main-content">
                    <header className="header-row" style={{ marginBottom: '3rem' }}>
                        <div>
                            <h1>Secure Payment Portal</h1>
                            <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', color: 'var(--primary)' }}>
                                Welcome, {safeInvoices.length > 0 && safeInvoices[0].patientName ? safeInvoices[0].patientName : patientId}
                            </h2>
                        </div>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                        {safeInvoices.map(inv => (
                            <div key={inv.invoiceId} className="soft-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Invoice Ref</p>
                                        <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '800' }}>{inv.invoiceId}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Issued On</p>
                                        <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{new Date(inv.issuedDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Due</p>
                                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>Rs. {inv.totalAmount?.toFixed(2)}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                        <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                            {inv.status}
                                        </span>
                                        {inv.status === 'UNPAID' && (
                                            <button onClick={() => handleOpenStripe(inv)} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                                                Pay Online
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {safeInvoices.length === 0 && (
                            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center' }}>
                                <div className="stat-icon" style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', background: 'var(--primary-soft)', color: 'var(--primary)' }}>✔️</div>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '1.2rem' }}>You have no outstanding medical bills.</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* Stripe Checkout Modal */}
                {patientStripe && clientSecret && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="soft-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-xl)' }}>

                            <div style={{ background: 'var(--bg-sidebar)', padding: '2rem', borderBottom: '1px solid var(--glass-border)', textAlign: 'center', position: 'relative' }}>
                                <button onClick={() => { setPatientStripe(null); setClientSecret(''); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>

                                <div className="stat-icon" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', background: 'var(--primary)', color: 'white' }}>💳</div>
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Secure Payment</h2>
                                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{patientStripe.invoiceId}</p>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginTop: '1rem' }}>
                                    Rs. {patientStripe.totalAmount?.toFixed(2)}
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                    <StripeCheckoutForm invoice={patientStripe} onSuccess={handlePaymentSuccess} onCancel={() => { setPatientStripe(null); setClientSecret(''); }} />
                                </Elements>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </LiquidWrapper>
    );
}