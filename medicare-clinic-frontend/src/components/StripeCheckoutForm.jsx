import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function StripeCheckoutForm({ invoice, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements, redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(invoice.invoiceId, 'ONLINE_CARD');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
                <PaymentElement />
            </div>

            {errorMessage && (
                <div style={{
                    color: 'var(--danger)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    ⚠️ {errorMessage}
                </div>
            )}

            <button
                disabled={!stripe || isProcessing}
                className="btn btn-primary"
                style={{
                    width: '100%',
                    padding: '1.2rem',
                    fontSize: '1.1rem',
                    opacity: (!stripe || isProcessing) ? 0.7 : 1,
                    cursor: (!stripe || isProcessing) ? 'not-allowed' : 'pointer'
                }}
            >
                {isProcessing ? "Processing Securely..." : `Pay Rs. ${invoice.totalAmount?.toFixed(2)}`}
            </button>

            <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="btn btn-soft"
                style={{
                    width: '100%',
                    padding: '1rem',
                    opacity: isProcessing ? 0.5 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
            >
                Cancel Transaction
            </button>
        </form>
    );
}