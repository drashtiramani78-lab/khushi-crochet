"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  const safeNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
      const cleaned = value.trim().replace(/[^\d.-]/g, "");
      if (!cleaned) return 0;
      const num = Number(cleaned);
      return Number.isFinite(num) ? num : 0;
    }

    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const parseResponseSafely = async (res) => {
    const text = await res.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error("Invalid JSON response:", error, text);
      throw new Error(
        "API returned invalid response. Check if route exists and is returning JSON."
      );
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders", {
        cache: "no-store",
      });

      const text = await res.text();

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        console.error("Invalid JSON from orders API:", error, text);
        setOrders([]);
        return;
      }

      if (!res.ok) {
        console.error("Orders API error:", data);
        setOrders([]);
        return;
      }

      if (Array.isArray(data)) {
        setOrders(data);
      } else if (Array.isArray(data.data)) {
        setOrders(data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const text =
        `${order.name || order.customerName || ""} ` +
        `${order.email || ""} ` +
        `${order.orderStatus || order.status || ""} ` +
        `${order.productType || order.subject || ""} ` +
        `${order.trackingId || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [orders, search]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await parseResponseSafely(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, orderStatus: newStatus } : order
        )
      );

      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: newStatus,
        }));
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseResponseSafely(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete order");
      }

      setOrders((prev) => prev.filter((order) => order._id !== id));

      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  const generateTrackingId = async (id) => {
    try {
      const res = await fetch(`/api/orders/generate-tracking/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await parseResponseSafely(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate tracking ID");
      }

      alert(`Tracking ID generated: ${data.data.trackingId}`);

      setOrders((prev) =>
        prev.map((order) => (order._id === id ? data.data : order))
      );

      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder(data.data);
      }
    } catch (error) {
      console.error("Tracking generation error:", error);
      alert(error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No date";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? "No date"
      : parsed.toLocaleString("en-IN");
  };

  const getDisplayValue = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const renderOrderModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="admin-modal-overlay">
        <div className="admin-modal" style={{ maxWidth: "700px" }}>
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">Order Details</h2>
            <button
              className="admin-modal-close"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
          </div>

          <div
            className="admin-modal-body"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div className="admin-modal-field">
              <strong>Order ID:</strong> {getDisplayValue(selectedOrder._id)}
            </div>

            <div className="admin-modal-field">
              <strong>Tracking ID:</strong>{" "}
              {getDisplayValue(selectedOrder.trackingId)}
            </div>

            <div className="admin-modal-field">
              <strong>Name:</strong>{" "}
              {getDisplayValue(
                selectedOrder.name || selectedOrder.customerName
              )}
            </div>

            <div className="admin-modal-field">
              <strong>Email:</strong> {getDisplayValue(selectedOrder.email)}
            </div>

            <div className="admin-modal-field">
              <strong>Phone:</strong> {getDisplayValue(selectedOrder.phone)}
            </div>

            <div className="admin-modal-field">
              <strong>Status:</strong>{" "}
              {getDisplayValue(selectedOrder.orderStatus)}
            </div>

            <div className="admin-modal-field">
              <strong>Payment Status:</strong>{" "}
              {getDisplayValue(selectedOrder.paymentStatus)}
            </div>

            <div className="admin-modal-field">
              <strong>Amount:</strong> ₹
              {safeNumber(
                selectedOrder.totalAmount ??
                  selectedOrder.amount ??
                  selectedOrder.price ??
                  selectedOrder.budget ??
                  0
              )}
            </div>

            <div className="admin-modal-field">
              <strong>Product Type:</strong>{" "}
              {getDisplayValue(
                selectedOrder.productType || selectedOrder.subject
              )}
            </div>

            <div className="admin-modal-field">
              <strong>Quantity:</strong>{" "}
              {getDisplayValue(selectedOrder.quantity)}
            </div>

            <div className="admin-modal-field">
              <strong>Address:</strong>{" "}
              {getDisplayValue(selectedOrder.address)}
            </div>

            <div className="admin-modal-field">
              <strong>City:</strong> {getDisplayValue(selectedOrder.city)}
            </div>

            <div className="admin-modal-field">
              <strong>State:</strong> {getDisplayValue(selectedOrder.state)}
            </div>

            <div className="admin-modal-field">
              <strong>Pincode:</strong>{" "}
              {getDisplayValue(selectedOrder.pincode)}
            </div>

            <div className="admin-modal-field">
              <strong>Country:</strong>{" "}
              {getDisplayValue(selectedOrder.country)}
            </div>

            <div className="admin-modal-field">
              <strong>Date:</strong>{" "}
              {getDisplayValue(formatDate(selectedOrder.createdAt))}
            </div>

            <div
              className="admin-modal-field"
              style={{ gridColumn: "1 / -1" }}
            >
              <strong>Message / Notes:</strong>{" "}
              {getDisplayValue(
                selectedOrder.message || selectedOrder.description
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

          <Link href="/admin/custom" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">✂️</span>
            Custom Orders
          </Link>

          <Link href="/admin/orders" className="admin-sidebar-link active">
            <span className="admin-sidebar-icon">🛒</span>
            Orders
          </Link>

          <Link href="/admin/messages" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">💌</span>
            Messages
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-subtitle">Manage all placed orders</p>
          </div>

          <div className="admin-search-section">
            <input
              type="text"
              placeholder="Search orders, email, status, tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-card">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-th">Name</th>
                    <th className="admin-th">Email</th>
                    <th className="admin-th">Amount</th>
                    <th className="admin-th">Status</th>
                    <th className="admin-th">Tracking ID</th>
                    <th className="admin-th">Date</th>
                    <th className="admin-th">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="admin-td-empty">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="admin-td-empty">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const amount = safeNumber(
                        order.totalAmount ??
                          order.amount ??
                          order.price ??
                          order.budget ??
                          0
                      );

                      return (
                        <tr key={order._id}>
                          <td className="admin-td">
                            {order.name || order.customerName || "N/A"}
                          </td>

                          <td className="admin-td">{order.email || "N/A"}</td>

                          <td className="admin-td">₹{amount}</td>

                          <td className="admin-td">
                            <select
                              value={order.orderStatus || "Pending"}
                              onChange={(e) =>
                                updateStatus(order._id, e.target.value)
                              }
                              className="admin-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="admin-td">
                            {order.trackingId ? (
                              <span style={{ fontWeight: 600 }}>
                                {order.trackingId}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => generateTrackingId(order._id)}
                                style={{
                                  padding: "8px 12px",
                                  background: "#b59a7a",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                }}
                              >
                                Generate ID
                              </button>
                            )}
                          </td>

                          <td className="admin-td">
                            {formatDate(order.createdAt)}
                          </td>

                          <td className="admin-td">
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="admin-btn admin-btn-primary admin-btn-small"
                                onClick={() => setSelectedOrder(order)}
                              >
                                View
                              </button>

                              <button
                                className="admin-btn admin-btn-danger admin-btn-small"
                                onClick={() => deleteOrder(order._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {renderOrderModal()}
    </div>
  );
}