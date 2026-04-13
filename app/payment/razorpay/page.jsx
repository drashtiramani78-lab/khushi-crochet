"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RazorpayPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount') || '0';

  useEffect(() => {
    if (!orderId) {
      setError('Order ID missing');
      setLoading(false);
      return;
    }

    // Simulate Razorpay checkout (test mode)
    loadPayment();
  }, [orderId]);

  const loadPayment = async () => {
    try {
      const response = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const data = await response.json();
      setOrderData(data);
      setLoading(false);

      // In production, load Razorpay script and open checkout
      // For demo: simulate success after 3s
      setTimeout(() => {
        simulatePaymentSuccess();
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    try {
      const verifyResponse = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentId: `pay_${Date.now()}`,
        }),
      });

      if (verifyResponse.ok) {
        router.push(`/confirmations?orderId=${orderId}`);
      }
    } catch (err) {
      setError('Payment verification failed');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Initializing Razorpay...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <h1>Razorpay Payment</h1>
        </div>

        {error ? (
          <div style={styles.errorBox}>
            <h3>Payment Error</h3>
            <p>{error}</p>
            <Link href="/checkout" style={styles.retryBtn}>
              Retry Checkout
            </Link>
          </div>
        ) : orderData ? (
          <div style={styles.successBox}>
            <div style={styles.checkmark}>✓</div>
            <h2>Processing Payment...</h2>
            <p>Order ID: {orderId}</p>
            <p>Amount: ₹{orderData.amount / 100}</p>
            <p>Razorpay Order: {orderData.razorpayOrderId}</p>
            <div style={styles.loader}></div>
          </div>
        ) : null}

        <div style={styles.footer}>
          <Link href="/orders" style={styles.link}>
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f5f0 0%, #e8e0d5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(47,39,35,0.1)',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  header: {
    marginBottom: '30px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    color: '#2f2723',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #b59a7a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    color: '#dc3545',
  },
  successBox: {
    color: '#27ae60',
  },
  checkmark: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #27ae60',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '20px auto',
  },
  retryBtn: {
    display: 'inline-block',
    background: '#2f2723',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '25px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '20px',
  },
  link: {
    color: '#b59a7a',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
};

