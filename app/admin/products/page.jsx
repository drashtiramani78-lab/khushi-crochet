"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../../admin-styles.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    inventory: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", { method: "POST" });
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/admin-login";
    }
  };

  const fetchProducts = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/admin/products", {
        cache: "no-store",
      });

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetForm = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setForm({
      name: "",
      price: "",
      description: "",
      inventory: "",
    });
    setSelectedFile(null);
    setPreview("");
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("");
    }
  };

  const handleEdit = (product) => {
    console.log("Edit product object:", product);

    const productId = product?._id;

    if (!productId) {
      alert("Product ID is missing. Cannot edit this product.");
      return;
    }

    setForm({
      name: product?.name || "",
      price: product?.price || "",
      description: product?.description || "",
      inventory: product?.inventory?.toString() || "0",
    });

    setIsEditing(true);
    setEditingId(productId.toString());
    setSelectedFile(null);
    setPreview(product?.image || "");

    console.log("Saved editing ID:", productId.toString());
  };

  const handleDelete = async (id) => {
    const productId = String(id || "");

    if (
      !productId ||
      productId === "undefined" ||
      productId === "null" ||
      !/^[0-9a-fA-F]{24}$/.test(productId)
    ) {
      alert("Invalid product ID");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      alert("Product deleted successfully");
      fetchProducts();

      if (editingId === productId) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Something went wrong while deleting");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("inventory", form.inventory || "0");

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (isEditing) {
        if (
          !editingId ||
          editingId === "undefined" ||
          editingId === "null" ||
          !/^[0-9a-fA-F]{24}$/.test(editingId)
        ) {
          alert("Invalid product ID. Please click Edit again.");
          setLoading(false);
          return;
        }
      }

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";

      console.log("Request URL:", url);
      console.log("Request method:", method);
      console.log("Editing ID before submit:", editingId);

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "add"} product`
        );
      }

      alert(
        isEditing
          ? "Product updated successfully"
          : "Product added successfully"
      );

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} product:`,
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
          <Link href="/admin/products" className="admin-sidebar-link active">
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
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage your crochet product inventory
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              {isEditing ? "Update Product" : "Add New Product"}
            </h2>
            <p className="admin-card-subtitle">
              {isEditing
                ? "Edit product details"
                : "Create a new crochet product"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="admin-input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Inventory</label>
                <input
                  type="number"
                  name="inventory"
                  value={form.inventory}
                  onChange={handleChange}
                  className="admin-input"
                  min="0"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="admin-input"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="admin-textarea"
                rows="4"
                placeholder="Describe your crochet product..."
              />
            </div>

            {preview && (
              <div className="admin-form-group">
                <label className="admin-label">Image Preview</label>
                <div style={{ marginTop: "8px" }}>
                  <Image
                    src={preview}
                    alt="Preview"
                    width={120}
                    height={120}
                    unoptimized={preview.startsWith("blob:")}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid var(--admin-border)",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn primary"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isEditing
                  ? "Update Product"
                  : "Add Product"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">All Products</h2>
            <p className="admin-card-subtitle">
              {products.length} product{products.length !== 1 ? "s" : ""} in
              inventory
            </p>
          </div>

          {fetching ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--admin-text-secondary)",
              }}
            >
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--admin-text-secondary)",
              }}
            >
              No products found. Add your first product above.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={60}
                            height={60}
                            unoptimized
                            style={{
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid var(--admin-border)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              background: "var(--admin-bg)",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--admin-text-secondary)",
                              fontSize: "10px",
                              border: "1px solid var(--admin-border)",
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td
                        style={{
                          color: "var(--admin-accent)",
                          fontWeight: 600,
                        }}
                      >
                        ₹
                        {typeof product.price === "string"
                          ? product.price
                          : product.price?.toFixed(2) || "0.00"}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            background:
                              (product.inventory ?? 0) > 0
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              (product.inventory ?? 0) > 0
                                ? "#15803d"
                                : "#991b1b",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {product.inventory ?? 0} units
                        </span>
                      </td>
                      <td
                        className="admin-truncate"
                        style={{ maxWidth: "200px" }}
                      >
                        {product.description || "No description"}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="admin-btn secondary small"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn danger small"
                            onClick={() => handleDelete(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}