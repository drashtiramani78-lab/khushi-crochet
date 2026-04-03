"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
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
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contact");
      const data = await res.json();

      const formattedMessages = (data.data || []).map((msg) => ({
        ...msg,
        isRead: msg.isRead ?? false,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const text = `${msg.name || ""} ${msg.email || ""} ${msg.message || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [messages, search]);

  const deleteMessage = async (id) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      setMessages((prev) => prev.filter((msg) => msg._id !== id));

      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const toggleReadStatus = async (id) => {
    const currentMessage = messages.find((msg) => msg._id === id);
    if (!currentMessage) return;

    const updatedRead = !currentMessage.isRead;

    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: updatedRead }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, isRead: updatedRead } : msg
        )
      );

      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, isRead: updatedRead } : null
        );
      }
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);

    if (!msg.isRead) {
      toggleReadStatus(msg._id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-layout">
      {/* Header */}
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
              <div style={{ fontSize: "11px", opacity: 0.7 }}>Administrator</div>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
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
          <Link href="/admin/orders" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🛒</span>
            Orders
          </Link>
          <Link href="/admin/messages" className="admin-sidebar-link active">
            <span className="admin-sidebar-icon">💌</span>
            Messages
          </Link>
        </div>

        <div className="admin-sidebar-section">
          <div className="admin-sidebar-title">System</div>
          <Link href="/admin-login" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">🚪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Messages</h1>
          <p className="admin-page-subtitle">Manage customer contact messages</p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
          <div className="admin-stat-badge">
            <span>Total</span>
            <strong>{messages.length}</strong>
          </div>
          <div className="admin-stat-badge">
            <span>Unread</span>
            <strong>{messages.filter((msg) => !msg.isRead).length}</strong>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-toolbar">
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="admin-empty">Loading messages...</td></tr>
                ) : filteredMessages.length === 0 ? (
                  <tr><td colSpan="6" className="admin-empty">No messages found</td></tr>
                ) : (
                  filteredMessages.map((msg) => (
                    <tr key={msg._id}>
                      <td>{msg.name}</td>
                      <td>{msg.email}</td>
                      <td className="admin-truncate">
                        {msg.message?.length > 60 ? `${msg.message.slice(0, 60)}...` : msg.message}
                      </td>
                      <td>{formatDate(msg.createdAt)}</td>
                      <td>
                        <span className={`admin-badge ${msg.isRead ? "success" : "warning"}`}>
                          {msg.isRead ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <button className="admin-btn primary" onClick={() => openMessage(msg)}>View</button>
                        <button className="admin-btn secondary" onClick={() => toggleReadStatus(msg._id)}>
                          {msg.isRead ? "Mark Unread" : "Mark Read"}
                        </button>
                        <a href={`mailto:${msg.email}?subject=Reply from Khushi Crochet`} className="admin-btn secondary">Reply</a>
                        <button className="admin-btn danger" onClick={() => deleteMessage(msg._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedMessage && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2 className="admin-modal-title">Message Details</h2>
                <p className="admin-modal-subtitle">Full customer inquiry</p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedMessage(null)}>×</button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <span className="admin-detail-label">Name</span>
                <span className="admin-detail-value">{selectedMessage.name}</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Email</span>
                <span className="admin-detail-value">{selectedMessage.email}</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Date</span>
                <span className="admin-detail-value">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div className="admin-detail-row">
                <span className="admin-detail-label">Status</span>
                <span className={`admin-badge ${selectedMessage.isRead ? "success" : "warning"}`}>
                  {selectedMessage.isRead ? "Read" : "Unread"}
                </span>
              </div>
              <div className="admin-message-box">
                <p className="admin-message-title">Message</p>
                <p className="admin-message-content">{selectedMessage.message}</p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button className="admin-btn secondary" onClick={() => toggleReadStatus(selectedMessage._id)}>
                {selectedMessage.isRead ? "Mark Unread" : "Mark Read"}
              </button>
              <a href={`mailto:${selectedMessage.email}?subject=Reply from Khushi Crochet`} className="admin-btn secondary">Reply by Email</a>
              <button className="admin-btn danger" onClick={() => deleteMessage(selectedMessage._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}