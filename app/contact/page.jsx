"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMsg("✅ Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setMsg("❌ " + data.message);
      }
    } catch (error) {
      console.error("Contact submit error:", error);
      setMsg("❌ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="container">
          <p className="breadcrumb">
          </p>

          <h1>Contact Khushi Crochet</h1>
          <p>
            Have a question or want a custom crochet piece? Send us a message 💌
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="contact-section" id="contact">
        <div className="container contact-grid">
          
          {/* LEFT INFO */}
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>We usually reply within 24 hours.</p>

            <div className="info-box">
              <span>Email</span>
              <a href="mailto:hello@khushicrochet.com">
                hello@khushicrochet.com
              </a>
            </div>

            <div className="info-box">
              <span>Phone</span>
              <a href="tel:+919999999999">+91 99999 99999</a>
            </div>

            <div className="info-box">
              <span>Instagram</span>
              <a href="#">@khushicrochet</a>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="contact-form">
            <h2>Send Message</h2>

            <form onSubmit={handleSubmit}>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                type="email"
                required
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />

              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
              ></textarea>

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>

              {msg && <p className="form-msg">{msg}</p>}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}