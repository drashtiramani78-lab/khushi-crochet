"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLoginPage() {
const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, authLoading, refreshUser } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      router.push("/admin");
    }
  }, [authLoading, user, router]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Refresh the auth context to pick up the new admin_auth cookie
      await refreshUser();
      
      // Small delay + direct admin auth check for reliable redirect
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const adminRes = await fetch("/api/auth/admin", { 
        credentials: "include", 
        cache: "no-store" 
      });
      
      if (adminRes.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        throw new Error("Admin auth verification failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ textAlign: "center", color: "#6e6259" }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, background: "var(--admin-bg, #f8f5f0)" }}>
      <div style={{ ...styles.card, background: "var(--admin-card-bg, #fffdf9)", border: "1px solid var(--admin-border, #d1c3b6)" }}>
        <h1 style={{ ...styles.title, color: "var(--admin-text-primary, #2f2723)" }}>Admin Login</h1>
        <p style={{ ...styles.subtitle, color: "var(--admin-text-secondary, #6e6259)" }}>Enter password to access admin panel</p>

        <form onSubmit={handleLogin}>
        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ ...styles.input, borderColor: "var(--admin-border, #d8ccc0)" }}
          />
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, borderColor: "var(--admin-border, #d8ccc0)" }}
          />

          <button type="submit" style={{ ...styles.button, background: "var(--admin-accent, #b59a7a)" }} disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f5f0",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: "30px",
    marginBottom: "8px",
    color: "#2f2723",
  },
  subtitle: {
    color: "#6e6259",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d8ccc0",
    marginBottom: "14px",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "#b59a7a",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },
  error: {
    color: "crimson",
    marginTop: "12px",
  },
};