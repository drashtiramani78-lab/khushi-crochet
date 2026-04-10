"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import "../styles/profile.css";

export default function Confirmations() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/confirmations");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">Loading user data...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Confirmations Status</h1>
          <p>Check your account confirmation status</p>
          <Link href="/profile" className="btn btn-secondary">
            ← Back to Profile
          </Link>
        </div>

        <div className="confirmations-section">
          <h2>Account Confirmations</h2>
          <div className="confirmation-status">
            <div className="status-item">
              <span className="status-label">Email Confirmation:</span>
              <span className={`status-badge ${user.emailConfirmed ? "confirmed" : "pending"}`}>
                {user.emailConfirmed ? "✓ Confirmed" : "⏳ Pending"}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">SMS Confirmation:</span>
              <span className={`status-badge ${user.smsConfirmed ? "confirmed" : "pending"}`}>
                {user.smsConfirmed ? "✓ Confirmed" : user.phone ? "⏳ Pending" : "Not provided"}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Account Verification:</span>
              <span className={`status-badge ${user.verified ? "confirmed" : "pending"}`}>
                {user.verified ? "✓ Verified" : "⏳ Pending"}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <h3>Actions</h3>
            <div className="action-buttons">
              {!user.emailConfirmed && (
                <button className="btn btn-primary">
                  📧 Resend Email Confirmation
                </button>
              )}
              {!user.smsConfirmed && user.phone && (
                <button className="btn btn-primary">
                  📱 Resend SMS Confirmation
                </button>
              )}
              <Link href="/account-settings" className="btn btn-secondary">
                ⚙️ Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
