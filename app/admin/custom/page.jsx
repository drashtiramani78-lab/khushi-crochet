"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminCustomPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/custom-orders", {
        cache: "no-store",
        credentials: "include",
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Invalid JSON:", text);
        setOrders([]);
        return;
      }

      if (!res.ok) {
        console.error("Fetch orders failed:", data);
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`/api/custom-orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      fetchOrders();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/custom-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      fetchOrders();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

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
          <Link href="/admin/custom" className="admin-sidebar-link active">
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
          <h1 className="admin-page-title">Custom Orders</h1>
          <p className="admin-page-subtitle">
            Manage customer custom crochet requests
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">All Custom Orders</h2>
            <p className="admin-card-subtitle">
              {orders.length} custom order{orders.length !== 1 ? "s" : ""}{" "}
              received
            </p>
          </div>

          {loading ? (
            <div className="admin-empty">Loading custom orders...</div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">No custom orders yet</div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Product Type</th>
                    <th>Budget</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600 }}>{order.name || "N/A"}</td>
                      <td>{order.email || "N/A"}</td>
                      <td>{order.productType || "N/A"}</td>
                      <td
                        style={{
                          fontWeight: 600,
                          color: "var(--admin-accent)",
                        }}
                      >
                        {order.budget ? `₹${order.budget}` : "N/A"}
                      </td>
                      <td>
                        {order.referenceImage ? (
                          <span
                            style={{
                              padding: "4px 8px",
                              background: "#e0f2fe",
                              color: "#0369a1",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            Image Attached
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "4px 8px",
                              background: "#f3f4f6",
                              color: "#6b7280",
                              borderRadius: "12px",
                              fontSize: "11px",
                            }}
                          >
                            No Image
                          </span>
                        )}
                      </td>
                      <td>
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          className="admin-select"
                          style={{ minWidth: "120px" }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn danger small"
                          onClick={() => deleteOrder(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}