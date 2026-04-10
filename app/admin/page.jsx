"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/app/hooks/useAdminAuth";
import "../admin-styles.css";

export default function AdminDashboard() {
  const { authLoading, isAuthorized, logout } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

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

  useEffect(() => {
    if (!isAuthorized) return;

    async function safeFetch(url, name) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();

        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          console.error(`Invalid JSON from ${name}:`, err, text);
          return null;
        }

        if (!res.ok) {
          console.error(`${name} API error:`, data);
          return null;
        }

        return data;
      } catch (error) {
        console.error(`Failed to fetch ${name}:`, error);
        return null;
      }
    }

    async function load() {
      try {
        const [productsJson, contactsJson, ordersJson] = await Promise.all([
          safeFetch("/api/products", "products"),
          safeFetch("/api/contact", "contacts"),
          safeFetch("/api/custom-orders", "custom-orders"),
        ]);

        const normalizedProducts = Array.isArray(productsJson)
          ? productsJson
          : Array.isArray(productsJson?.data)
          ? productsJson.data
          : [];

        const normalizedContacts = Array.isArray(contactsJson)
          ? contactsJson
          : Array.isArray(contactsJson?.data)
          ? contactsJson.data
          : [];

        const normalizedOrders = Array.isArray(ordersJson)
          ? ordersJson
          : Array.isArray(ordersJson?.data)
          ? ordersJson.data
          : [];

        setProducts(normalizedProducts);
        setMessages(normalizedContacts);
        setCustomOrders(normalizedOrders);
      } catch (e) {
        console.error("Failed to load admin dashboard data:", e);
        setProducts([]);
        setMessages([]);
        setCustomOrders([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthorized]);

  // Calculate stats with useMemo - MUST BE BEFORE ANY EARLY RETURNS
  const stats = useMemo(() => {
    const totalInventory = products.reduce((sum, product) => {
      const stockValue = safeNumber(product.inventory ?? product.stock ?? 0);
      return sum + stockValue;
    }, 0);

    const unreadMessages = messages.filter((m) => !m.isRead).length;

    return [
      { label: "Total Products", value: products.length, icon: "📦" },
      { label: "Total Orders", value: customOrders.length, icon: "🗂" },
      { label: "Inventory Units", value: totalInventory, icon: "💎" },
      { label: "Unread Messages", value: unreadMessages, icon: "✉️" },
    ];
  }, [products, customOrders, messages]);

  const recentOrders = useMemo(() => {
    return customOrders.slice(0, 5).map((o) => ({
      id: o._id,
      customer: o.name || o.customerName || "Unknown Customer",
      type: o.productType || o.subject || "Custom Request",
      status: o.status || "Pending",
      date: o.createdAt
        ? new Date(o.createdAt).toLocaleDateString("en-IN")
        : "No date",
    }));
  }, [customOrders]);

  const recentProducts = useMemo(() => {
    return products.slice(0, 5).map((p) => ({
      id: p._id,
      name: p.name || "Untitled Product",
      price: safeNumber(p.price),
      stock: safeNumber(p.inventory ?? p.stock ?? 0),
    }));
  }, [products]);

  // NOW we can do conditional rendering/returns
  if (authLoading || !isAuthorized) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <main className="admin-main">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-subtitle">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <Image src="/logo.png" alt="Khushi Crochet" width={40} height={40} className="admin-logo" />
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
          <Link href="/admin" className="admin-sidebar-link active">
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
          <Link href="/admin/orders" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🛒</span>
            Orders
          </Link>
          <Link href="/admin/messages" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">💌</span>
            Messages
          </Link>
          <Link href="/admin/users" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">👥</span>
            Users
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
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Welcome to your admin panel. Monitor your crochet business
            performance.
          </p>
        </div>

        <div className="admin-stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="admin-stat-card">
              <div className="admin-stat-icon">{stat.icon}</div>
              <div className="admin-stat-value">{safeNumber(stat.value)}</div>
              <div className="admin-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Recent Custom Orders</h2>
                <p className="admin-card-subtitle">Latest customer requests</p>
              </div>
              <Link
                href="/admin/custom"
                style={{
                  fontSize: "12px",
                  color: "var(--admin-accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View All →
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ width: "50%" }}>
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>
                            {order.customer}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--admin-text-secondary)",
                            }}
                          >
                            {order.type}
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: "12px",
                            color: "var(--admin-text-secondary)",
                          }}
                        >
                          {order.date}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className={`admin-badge ${String(order.status)
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--admin-text-secondary)",
                  padding: "20px",
                }}
              >
                No orders yet
              </p>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Recent Products</h2>
                <p className="admin-card-subtitle">Latest inventory additions</p>
              </div>
              <Link
                href="/admin/products"
                style={{
                  fontSize: "12px",
                  color: "var(--admin-accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View All →
              </Link>
            </div>

            {recentProducts.length > 0 ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ width: "60%" }}>
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--admin-accent)",
                            }}
                          >
                            ₹{product.price}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            style={{
                              padding: "4px 8px",
                              background:
                                product.stock > 0 ? "#dcfce7" : "#fee2e2",
                              color:
                                product.stock > 0 ? "#15803d" : "#991b1b",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {product.stock} units
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--admin-text-secondary)",
                  padding: "20px",
                }}
              >
                No products yet
              </p>
            )}
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: "20px" }}>
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Quick Actions</h2>
              <p className="admin-card-subtitle">
                Common administrative tasks
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "12px",
            }}
          >
            <Link href="/admin/products" className="admin-action-btn">
              Add Product
            </Link>
            <Link href="/admin/users" className="admin-action-btn">
              Manage Users
            </Link>
            <Link href="/admin/custom" className="admin-action-btn">
              Custom Orders
            </Link>
            <Link href="/admin/messages" className="admin-action-btn">
              Messages
            </Link>
            <Link href="/" className="admin-action-btn">
              View Website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}