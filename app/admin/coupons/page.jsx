"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../admin-styles.css";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: 1,
    validFrom: "",
    validTill: "",
    isActive: true
  });
  const [showForm, setShowForm] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/admin-login";
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingCoupon ? "PUT" : "POST";
      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon._id}` 
        : "/api/admin/coupons";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, validFrom: new Date(formData.validFrom), validTill: new Date(formData.validTill) }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingCoupon(null);
        setFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "",
          maxDiscount: "",
          usageLimit: "",
          perUserLimit: 1,
          validFrom: "",
          validTill: "",
          isActive: true
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error("Coupon save error:", error);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCoupons();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit || "",
      perUserLimit: coupon.perUserLimit || 1,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validTill: new Date(coupon.validTill).toISOString().split('T')[0],
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const activeCount = coupons.filter(c => c.isActive).length;
  const usageStats = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <Image
            src="/logo.png"
            alt="Khushi Crochet"
            width={40}
            height={40}
            className="admin-logo"
          />
          <div className="admin-header-brand">Khushi Crochet Admin</div>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <div className="admin-user-avatar">DR</div>
            <div>
              <div style={{ fontWeight: 600 }}>Drashti Ramani</div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>
                Administrator
              </div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <div className="admin-sidebar-section">
          <div className="admin-sidebar-title">Navigation</div>
          <Link href="/admin" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🏠</span>
            Dashboard
          </Link>
          <Link href="/admin/products" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🧵</span>
            Products
          </Link>
          <Link href="/admin/coupons" className="admin-sidebar-link active">
            <span className="admin-sidebar-icon">🎟️</span>
            Coupons
          </Link>
          <Link href="/admin/custom" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">✂️</span>
            Custom Orders
          </Link>
          <Link href="/admin/orders" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🛒</span>
            Orders
          </Link>
          <Link href="/admin/messages" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">💌</span>
            Messages
          </Link>
        </div>
        <div className="admin-sidebar-section">
          <div className="admin-sidebar-title">System</div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-link"
            style={{
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <span className="admin-sidebar-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-subtitle">Manage discount coupons</p>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="admin-stat-number">{coupons.length}</div>
            <div className="admin-stat-label">Total Coupons</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number" style={{color: 'var(--success)'}}>{activeCount}</div>
            <div className="admin-stat-label">Active</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-number">{usageStats}</div>
            <div className="admin-stat-label">Total Usage</div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              All Coupons {loading && <span className="admin-loading">Loading...</span>}
            </h2>
            <button 
              className="admin-btn primary" 
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              {editingCoupon ? "Edit" : "Create New"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-grid">
                <div>
                  <label>Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed Amount ₹</option>
                  </select>
                </div>
                <div>
                  <label>Value *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <label>Min Order ₹</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label>Max Discount ₹</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: parseFloat(e.target.value) || null})}
                  />
                </div>
                <div>
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value) || null})}
                  />
                </div>
                <div>
                  <label>Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({...formData, perUserLimit: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
                <div>
                  <label>Valid From *</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Valid Till *</label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({...formData, validTill: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active
                </label>
                <button type="submit" className="admin-btn primary" style={{marginLeft: 'auto'}}>
                  {editingCoupon ? "Update" : "Create"}
                </button>
                <button 
                  type="button" 
                  className="admin-btn secondary" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                    setFormData({
                      code: "",
                      description: "",
                      discountType: "percentage",
                      discountValue: "",
                      minOrderAmount: "",
                      maxDiscount: "",
                      usageLimit: "",
                      perUserLimit: 1,
                      validFrom: "",
                      validTill: "",
                      isActive: true
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type/Value</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Valid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="admin-empty">Loading coupons...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan="7" className="admin-empty">No coupons created yet</td></tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td style={{fontWeight: 600, fontFamily: 'monospace'}}>{coupon.code}</td>
                      <td>
                        <div>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</div>
                        {coupon.description && <small>{coupon.description}</small>}
                      </td>
                      <td>₹{coupon.minOrderAmount || 0}</td>
                      <td>{coupon.usageCount || 0}/{coupon.usageLimit || '∞'}</td>
                      <td>{new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTill).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-badge ${coupon.isActive ? 'success' : 'danger'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="admin-btn primary small" onClick={() => editCoupon(coupon)}>Edit</button>
                        <button className="admin-btn danger small" onClick={() => deleteCoupon(coupon._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
