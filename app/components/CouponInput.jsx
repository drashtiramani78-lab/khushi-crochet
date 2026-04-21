"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function CouponInput({ cartTotal, onCouponApply, className = '' }) {
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState({ couponCode: '', discount: 0 });

    const applyCoupon = async () => {
      if (!couponCode.trim()) {
        setError('Please enter a coupon code');
        return;
      }

      if (!isAuthenticated) {
        setError('Please login to apply coupons');
        return;
      }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Auth handled server-side via httpOnly cookie

      const res = await fetch(`/api/coupons`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: cartTotal,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        const couponData = {
          couponCode: data.data.couponCode,
          discount: data.data.discount,
          finalTotal: data.data.finalTotal
        };
        setAppliedCoupon(couponData);
        onCouponApply(couponData);
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch (e) {
      console.error('Coupon apply error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setError('');
    setSuccess(false);
    setAppliedCoupon({ couponCode: '', discount: 0 });
    onCouponApply({ couponCode: '', discount: 0, finalTotal: cartTotal });
  };

  return (
    <div className={`coupon-section ${className}`}>
      <h3 className="checkout-section-title">
        Have a Coupon? <span className="text-checkout-accent">Save More!</span>
      </h3>
      
      <div className="coupon-input-group">
        <input
          type="text"
          className="coupon-input"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
        />
        <button 
          className="apply-coupon-btn" 
          onClick={applyCoupon}
          disabled={loading}
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </div>

      {error && <div className="coupon-error">{error}</div>}

      {success && (
        <div className="coupon-success">
          ✅ Coupon <span className="coupon-code-display">{appliedCoupon.couponCode}</span> 
          applied! You saved <span className="coupon-discount">₹{appliedCoupon.discount.toFixed(2)}</span>
          <button className="remove-coupon-btn" onClick={removeCoupon}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
