"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import "../styles/profile.css";

export default function Profile() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/account-settings");
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      // Fetch regular orders for this user
      const ordersRes = await fetch('/api/orders/user', {
        credentials: "include",
      });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders((data.data || []).slice(0, 3)); // Get last 3 orders
      }

      // Fetch custom orders for this user
      const customRes = await fetch('/api/custom-orders/user', {
        credentials: "include",
      });
      if (customRes.ok) {
        const data = await customRes.json();
        setCustomOrders((data.data || []).slice(0, 3)); // Get last 3 custom orders
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#ff9800',
      Processing: '#2196f3',
      Shipped: '#9c27b0',
      Delivered: '#4caf50',
      Cancelled: '#f44336',
      "In Progress": '#2196f3',
      Completed: '#4caf50',
    };
    return colors[status] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate total order count
  const totalOrderCount = orders.length + customOrders.length;

  const profileSections = [
    {
      id: "profile",
      title: " Profile Information",
      description: "Edit your personal details and contact information",
      href: "/account-settings",
      icon: "👤",
      color: "#D4AF9E"
    },
    {
      id: "orders",
      title: " My Orders",
      description: "View your order history and track current orders",
      href: "/orders",
      icon: "📦",
      color: "#D4AF9E",
      count: totalOrderCount,
      countLabel: totalOrderCount > 1 ? "orders" : "order"
    },
    {
      id: "confirmations",
      title: " Confirmations",
      description: "Check your email and SMS confirmation status",
      href: "/confirmations",
      icon: "✅",
      color: "#D4AF9E"
    },
    {
      id: "wishlist",
      title: " Wishlist",
      description: "Manage your saved items and favorites",
      href: "/wishlist",
      icon: "❤️",
      color: "#D4AF9E"
    },
    {
      id: "settings",
      title: " Account Settings",
      description: "Manage your account preferences and security",
      href: "/account-settings",
      icon: "⚙️",
      color: "#D4AF9E"
    }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="user-info">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-details">
              <h1>Welcome back, {user.name}!</h1>
              <p>{user.email}</p>
              {user.phone && <p>📱 {user.phone}</p>}
            </div>
          </div>
          <div className="quick-stats">
            <div className="stat-item">

            </div>

          </div>
        </div>

        <div className="profile-navigation">
          <h2>Account Management</h2>
          <div className="nav-grid">
            {profileSections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className="nav-card"
                style={{ borderLeftColor: section.color }}
              >
                <div className="nav-icon" style={{ backgroundColor: section.color }}>
                  {section.icon}
                </div>
                <div className="nav-content">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
                <div className="nav-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="profile-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link href="/products" className="action-btn primary">
              Continue Shopping
            </Link>
            <Link href="/customorder" className="action-btn secondary">
              Create Custom Order
            </Link>
            <Link href="/order-track" className="action-btn secondary">
              Track Order
            </Link>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {ordersLoading ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading your orders...</p>
            ) : orders.length === 0 && customOrders.length === 0 ? (
              <div className="activity-placeholder">
                <p>No orders yet. Start shopping!</p>
                <Link href="/products" className="view-all-link">
                  Browse Products →
                </Link>
              </div>
            ) : (
              <>
                {/* Regular Orders */}
                {orders.length > 0 && (
                  <div className="activity-section">
                    <h3>📦 Orders</h3>
                    {orders.map((order) => (
                      <div key={order._id} className="activity-item" style={{ borderLeft: `4px solid ${getStatusColor(order.orderStatus)}` }}>
                        <div className="activity-header">
                          <span className="activity-type">Order #{order._id.slice(-6).toUpperCase()}</span>
                          <span className="activity-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="activity-details">
                          <p><strong>{order.customerName || 'Customer'}</strong></p>
                          <p className="activity-amount">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Orders */}
                {customOrders.length > 0 && (
                  <div className="activity-section">
                    <h3>🎨 Custom Orders</h3>
                    {customOrders.map((order) => (
                      <div key={order._id} className="activity-item" style={{ borderLeft: `4px solid ${getStatusColor(order.status)}` }}>
                        <div className="activity-header">
                          <span className="activity-type">Custom Order #{order._id.slice(-6).toUpperCase()}</span>
                          <span className="activity-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="activity-details">
                          <p><strong>{order.productType || 'Custom Item'}</strong></p>
                          <p className="activity-amount">₹{parseFloat(order.estimatedPrice || 0).toFixed(2)}</p>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/orders" className="view-all-link" style={{ marginTop: '15px', display: 'block' }}>
                  View All Orders →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
