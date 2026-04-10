"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/styles/register.css";

function RegisterContent() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful! Redirecting to login...");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMessageClass = () => {
    if (message.includes("successful")) return "success";
    return "error";
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join to discover handmade crochet magic</p>

        {message && (
          <div className={`register-message ${getMessageClass()}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div>
            <label className="register-label">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div>
            <label className="register-label">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div>
            <label className="register-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div>
            <label className="register-label">Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-submit"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="register-link-section">
          Already have an account?{" "}
          <Link href="/login" className="register-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="register-page">
          <div className="register-card">
            <div className="text-xl font-semibold text-center animate-pulse">Loading...</div>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
