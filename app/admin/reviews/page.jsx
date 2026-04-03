"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/admin-login";
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews", {
        cache: "no-store",
      });

      const data = await res.json();
      setReviews(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, verified: true }),
      });

      if (res.ok) {
        setSuccessMessage("Review approved!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Failed to approve review");
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, verified: false }),
      });

      if (res.ok) {
        setSuccessMessage("Review marked as rejected!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error rejecting review:", error);
      alert("Failed to reject review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review permanently?")) return;

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });

      if (res.ok) {
        setSuccessMessage("Review deleted!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "verified") return review.verified;
    if (filter === "pending") return !review.verified;
    return true;
  });

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
          <Link href="/admin/categories" className="admin-sidebar-link">
            <span className="admin-sidebar-icon">📁</span>
            Categories
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
          <Link href="/admin/reviews" className="admin-sidebar-link active">
            <span className="admin-sidebar-icon">⭐</span>
            Reviews
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
              cursor: "pointer",
            }}
          >
            <span className="admin-sidebar-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-container">
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">⭐ Review Moderation</h1>
              <p className="admin-page-description">
                Approve or reject customer product reviews
              </p>
            </div>
          </div>

          {successMessage && (
            <div style={{
              padding: "12px 16px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "6px",
              marginBottom: "20px",
            }}>
              {successMessage}
            </div>
          )}

          <div className="admin-card">
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                onClick={() => setFilter("all")}
                className={`admin-button ${filter === "all" ? "admin-button-primary" : "admin-button-secondary"}`}
              >
                All Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`admin-button ${filter === "pending" ? "admin-button-primary" : "admin-button-secondary"}`}
              >
                Pending ({reviews.filter((r) => !r.verified).length})
              </button>
              <button
                onClick={() => setFilter("verified")}
                className={`admin-button ${filter === "verified" ? "admin-button-primary" : "admin-button-secondary"}`}
              >
                Approved ({reviews.filter((r) => r.verified).length})
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                Loading reviews...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#7e7163" }}>
                No reviews found in this category
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredReviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      padding: "16px",
                      border: "1px solid #d1c3b6",
                      borderRadius: "8px",
                      background: review.verified ? "#dcfce7" : "#fef2f2",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontSize: "14px", color: "#7e7163", marginBottom: "4px" }}>
                          Product ID: {review.productId}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#2e251f", marginBottom: "8px" }}>
                          {review.title}
                        </div>
                        <div style={{ fontSize: "14px", color: "#2e251f", marginBottom: "8px" }}>
                          Rating: {"⭐".repeat(review.rating)}
                        </div>
                        <div style={{ fontSize: "14px", color: "#6e6259" }}>
                          {review.comment}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7e7163", marginTop: "8px" }}>
                          By: {review.userId} | {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "4px 12px",
                          background: review.verified ? "#16a34a" : "#f59e0b",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {review.verified ? "✓ APPROVED" : "⏳ PENDING"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {!review.verified && (
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="admin-button"
                          style={{
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {review.verified && (
                        <button
                          onClick={() => handleReject(review._id)}
                          className="admin-button"
                          style={{
                            background: "#f59e0b",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="admin-button"
                        style={{
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
