'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from '@/app/styles/account-settings.module.css';

export default function AccountSettings() {
  const router = useRouter();
  const { user, authLoading, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formDataInitial = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account-settings');
    } else if (!authLoading && user) {
      setFormData(formDataInitial);
      setLoading(false);
    }
  }, [authLoading, user, router, formDataInitial]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        await fetchUser();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (e) {
      console.error('Profile update error:', e);
      setError('Error updating profile');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (e) {
      console.error('Password update error:', e);
      setError('Error changing password');
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⚙️ Account Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'password' ? styles.active : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔐 Password
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            📧 Preferences
          </button>
        </div>

        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {activeTab === 'profile' && (
          <form onSubmit={updateProfile} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                className={styles.input}
                disabled
              />
              <small>Email cannot be changed</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="+91 XXXXX XXXXX"
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Save Changes
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={updatePassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Change Password
            </button>
          </form>
        )}

        {activeTab === 'preferences' && (
          <div className={styles.preferences}>
            <div className={styles.preferenceItem}>
              <div>
                <h3>Email Notifications</h3>
                <p>Receive order updates via email</p>
              </div>
              <input type="checkbox" defaultChecked className={styles.checkbox} />
            </div>

            <div className={styles.preferenceItem}>
              <div>
                <h3>SMS Notifications</h3>
                <p>Receive order updates via SMS</p>
              </div>
              <input type="checkbox" defaultChecked className={styles.checkbox} />
            </div>

            <div className={styles.preferenceItem}>
              <div>
                <h3>WhatsApp Notifications</h3>
                <p>Receive order updates via WhatsApp</p>
              </div>
              <input type="checkbox" className={styles.checkbox} />
            </div>

            <div className={styles.preferenceItem}>
              <div>
                <h3>Marketing Emails</h3>
                <p>Receive promotional offers and updates</p>
              </div>
              <input type="checkbox" className={styles.checkbox} />
            </div>

            <button className={styles.submitBtn}>Save Preferences</button>
          </div>
        )}
      </div>
    </div>
  );
}
