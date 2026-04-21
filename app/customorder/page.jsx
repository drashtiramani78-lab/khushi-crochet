"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function CustomOrdersPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "",
    colorTheme: "",
    budget: "",
    deadline: "",
    subject: "",
    message: "",
    referenceImage: null,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/");
    }
  }, [user, authLoading, router]);

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "referenceImage") {
      const file = files?.[0] || null;

      setFormData((prev) => ({
        ...prev,
        referenceImage: file,
      }));

      setFileName(file ? file.name : "");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("productType", formData.productType);
      payload.append("colorTheme", formData.colorTheme);
      payload.append("budget", formData.budget);
      payload.append("deadline", formData.deadline);
      payload.append("subject", formData.subject);
      payload.append("message", formData.message);

      if (formData.referenceImage) {
        payload.append("referenceImage", formData.referenceImage);
      }

      const res = await fetch("/api/custom-orders", {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      const text = await res.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Invalid JSON response:", parseError, text);
        throw new Error("Server returned an invalid response");
      }

      // Check for authentication error
      if (res.status === 401) {
        setMsg("❌ Please login to place a custom order");
        router.push("/login?redirect=/");
        return;
      }

      if (!res.ok) {
        setMsg(`❌ ${data.message || "Failed to send custom order"}`);
        return;
      }

      setMsg("✅ Custom order request sent successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        productType: "",
        colorTheme: "",
        budget: "",
        deadline: "",
        subject: "",
        message: "",
        referenceImage: null,
      });

      setFileName("");
    } catch (error) {
      console.error("Custom order submit error:", error);
      setMsg(`❌ ${error.message || "Server error. Try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <main className="custom-order-page">
        <section className="custom-order-hero">
          <div className="container">
            <h1>Loading...</h1>
            <p>Please wait</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="custom-order-page">
      <section className="custom-order-hero" id="custom-order-hero">
        <div className="container">
          <p className="custom-order-label">Made just for you</p>
          <h1>Design Your Custom Crochet Order</h1>
          <p className="custom-order-subtext">
            Share your idea, inspiration, colors, and reference image. We’ll
            turn it into a handmade crochet piece created specially for you.
          </p>
        </div>
      </section>

      <section className="custom-order-section">
        <div className="container custom-order-grid">
          <div className="custom-order-left">
            <div className="custom-order-card process-card-alt">
              <h3>How It Works</h3>

              <div className="timeline-step">
                <span>01</span>
                <div>
                  <h4>Send Your Idea</h4>
                  <p>Fill the form and upload a reference image if you have one.</p>
                </div>
              </div>

              <div className="timeline-step">
                <span>02</span>
                <div>
                  <h4>Discuss Details</h4>
                  <p>
                    We review your request and confirm design, timeline, and
                    price.
                  </p>
                </div>
              </div>

              <div className="timeline-step">
                <span>03</span>
                <div>
                  <h4>Crafting Begins</h4>
                  <p>Your custom crochet piece is made carefully by hand.</p>
                </div>
              </div>

              <div className="timeline-step">
                <span>04</span>
                <div>
                  <h4>Delivery</h4>
                  <p>Once ready, your order is packed and delivered to you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="custom-order-card custom-order-form-card">
            <h2>Place a Custom Request</h2>

            <form className="custom-order-form" onSubmit={handleSubmit}>
              <div className="custom-two-col">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                />
              </div>

              <div className="custom-two-col">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />

                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Product Type</option>
                  <option value="Bouquet">Bouquet</option>
                  <option value="Keychain">Keychain</option>
                  <option value="Plushie">Plushie</option>
                  <option value="Home Decor">Home Decor</option>
                  <option value="Gift Item">Gift Item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="custom-two-col">
                <input
                  type="text"
                  name="colorTheme"
                  value={formData.colorTheme}
                  onChange={handleChange}
                  placeholder="Preferred Colors"
                />

                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Budget Range"
                />
              </div>

              <div className="custom-two-col">
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Order Title / Subject"
                />
              </div>

              <div className="custom-upload-box">
                <label htmlFor="referenceImage" className="upload-label">
                  Upload Reference Image
                </label>

                <input
                  id="referenceImage"
                  type="file"
                  name="referenceImage"
                  accept="image/*"
                  onChange={handleChange}
                />

                {fileName && <p className="upload-file-name">{fileName}</p>}
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your custom order in detail..."
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit Custom Order"}
              </button>

              {msg && <p className="form-msg">{msg}</p>}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}