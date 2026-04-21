"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import "@/app/styles/login.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
const redirect = searchParams.get("redirect") || "/";
  const { setUser, refreshUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      const data =
        contentType.includes("application/json") && raw
          ? JSON.parse(raw)
          : null;

      if (!res.ok) {
        setMessage(data?.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setMessage("Login failed: invalid server response");
        return;
      }

      setUser(data.user);
      refreshUser();
      router.push('/');
    } catch (error) {
      console.error(error);
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Login to continue</p>

        {message && <div className="login-message error">{message}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="login-input"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="login-input"
            required
          />

          <button 
            type="submit" 
            className="login-submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-loading"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="login-link-section">
          Don&apos;t have an account? <Link href="/register" className="login-link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page"><div className="login-card"><div>Loading...</div></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
