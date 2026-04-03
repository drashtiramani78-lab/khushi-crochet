"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const fetchCategories = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      description: category.description,
    });
    setIsEditing(true);
    setEditingId(category._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete category");
      }

      setSuccessMessage("Category deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Something went wrong while deleting");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "create"} category`
        );
      }

      setSuccessMessage(
        isEditing
          ? "Category updated successfully"
          : "Category created successfully"
      );
      setTimeout(() => setSuccessMessage(""), 3000);

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} category:`,
        error
      );
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
          <Link href="/admin/categories" className="admin-sidebar-link active">
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
          <Link href="/admin/reviews" className="admin-sidebar-link">
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
              <h1 className="admin-page-title">📁 Product Categories</h1>
              <p className="admin-page-description">
                Manage product categories for your store
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="admin-card">
              <h2 style={{ marginTop: 0 }}>
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label className="admin-label">Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Blankets, Toys, Apparel"
                    className="admin-input"
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Category description (optional)"
                    className="admin-input"
                    rows="4"
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="admin-button admin-button-primary"
                    style={{ flex: 1 }}
                  >
                    {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="admin-button admin-button-secondary"
                      style={{ flex: 0.5 }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-card">
              <h2 style={{ marginTop: 0 }}>Categories ({categories.length})</h2>
              {fetching ? (
                <div>Loading categories...</div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#7e7163" }}>
                  <p>No categories yet. Create one to get started!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      style={{
                        padding: "12px",
                        background: "#f5f1eb",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "#2e251f" }}>
                          {category.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#7e7163" }}>
                          {category.description || "No description"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(category)}
                          className="admin-button admin-button-small"
                          style={{ color: "#2563eb" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="admin-button admin-button-small"
                          style={{ color: "#dc2626" }}
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
        </div>
      </main>
    </div>
  );
}
