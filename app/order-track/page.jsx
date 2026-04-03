"use client";

import { useState } from "react";

export default function OrderTrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackingId || !email) {
      alert("Please enter tracking ID and email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingId, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Order not found");
      }

      setOrder(data.data);
    } catch (error) {
      console.error("Track error:", error);
      alert(error.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Track Your Order</h1>
        <p style={styles.subtitle}>
          Enter your tracking ID and email to see order status
        </p>

        <div style={styles.form}>
          <input
            type="text"
            placeholder="Tracking ID (e.g. KC123456)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleTrack} style={styles.button}>
            {loading ? "Checking..." : "Track Order"}
          </button>
        </div>

        {order && (
          <div style={styles.resultBox}>
            <h3 style={styles.resultTitle}>Order Details</h3>

            <p><strong>Tracking ID:</strong> {order.trackingId}</p>
            <p><strong>Name:</strong> {order.customerName}</p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <p><strong>Payment:</strong> {order.paymentStatus}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount}</p>

            <div style={styles.statusBar}>
              <div
                style={{
                  ...styles.statusStep,
                  background:
                    order.orderStatus === "Pending"
                      ? "#b59a7a"
                      : "#ddd",
                }}
              >
                Pending
              </div>

              <div
                style={{
                  ...styles.statusStep,
                  background:
                    order.orderStatus === "Processing"
                      ? "#b59a7a"
                      : "#ddd",
                }}
              >
                Processing
              </div>

              <div
                style={{
                  ...styles.statusStep,
                  background:
                    order.orderStatus === "Shipped"
                      ? "#b59a7a"
                      : "#ddd",
                }}
              >
                Shipped
              </div>

              <div
                style={{
                  ...styles.statusStep,
                  background:
                    order.orderStatus === "Delivered"
                      ? "#b59a7a"
                      : "#ddd",
                }}
              >
                Delivered
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f5f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  title: {
    fontSize: "28px",
    marginBottom: "10px",
    color: "#2f2723",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6e6259",
    marginBottom: "20px",
  },

  form: {
    display: "grid",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    background: "#b59a7a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  resultBox: {
    marginTop: "20px",
    background: "#f9f6f1",
    padding: "15px",
    borderRadius: "10px",
  },

  resultTitle: {
    marginBottom: "10px",
    fontSize: "16px",
  },

  statusBar: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "6px",
  },

  statusStep: {
    flex: 1,
    padding: "6px",
    textAlign: "center",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#fff",
  },
};