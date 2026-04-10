"use client";

import { useEffect, useState } from "react";
import "@/app/styles/admin-users.css";
import "@/app/styles/admin.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [creatingUser, setCreatingUser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSendConfirmation = async (userId, type) => {
    try {
      setSendingConfirmation((prev) => ({
        ...prev,
        [`${userId}-${type}`]: true,
      }));
      setErrorMessage("");

      const res = await fetch("/api/admin/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(
          `${type.charAt(0).toUpperCase() + type.slice(1)} confirmation sent successfully!`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(data.message || "Failed to send confirmation");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error sending confirmation:", error);
      setErrorMessage("Error sending confirmation");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setSendingConfirmation((prev) => ({
        ...prev,
        [`${userId}-${type}`]: false,
      }));
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("User created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        
        await fetchUsers();
        closeAddModal();
      } else {
        setErrorMessage(data.message || "Failed to create user");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrorMessage("Error creating user");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers =
    filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  const getBadgeClass = (role) => {
    return role === "admin" ? "admin-users-badge admin" : "admin-users-badge user";
  };

  return (
    <div className="admin-users-page admin-main">
      <div className="admin-users-header admin-card">
        <div className="admin-users-header-top admin-card-header">
          <div>
            <h1 className="admin-users-title admin-page-title">👥 User Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-users-add-btn admin-btn primary"
          >
            ➕ Add New User
          </button>
        </div>
        <div className="admin-users-stats">
          <div className="admin-users-stat">
            <span className="admin-users-stat-label">Total Users:</span>
            <span className="admin-users-stat-value">{users.length}</span>
          </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Admins:</span>
                  <span className="admin-users-stat-value">
                    {users.filter((u) => u.role === "admin").length}
                  </span>
                </div>
                <div className="admin-users-stat">
                  <span className="admin-users-stat-label">Total Orders:</span>
                  <span className="admin-users-stat-value">
                    {users.reduce((sum, u) => sum + (u.totalOrdersCount || 0), 0)}
                  </span>
                </div>
        </div>
      </div>

      {successMessage && (
        <div className="admin-users-alert success">{successMessage}</div>
      )}
      {errorMessage && <div className="admin-users-alert error">{errorMessage}</div>}

      <div className="admin-users-filter">
        <label className="admin-users-filter-label">Filter by Role:</label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="admin-users-filter-select"
        >
          <option value="all">All Users</option>
          <option value="user">Regular Users</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-users-loading">
          <div className="admin-users-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-users-empty">
          <p>No users found matching your filter.</p>
        </div>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Total Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || "—"}</td>
                  <td><span className={getBadgeClass(user.role)}>{user.role}</span></td>
                  <td>{user.totalOrdersCount || 0}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => openUserModal(user)}
                      className="admin-users-action"
                    >
                      View & Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="admin-users-modal">
          <div className="admin-users-modal-content">
            <button className="admin-users-modal-close" onClick={closeModal}>
              ✕
            </button>

            <h2 className="admin-users-modal-title">User Details & Confirmations</h2>

            <div className="admin-users-detail-grid">
              <div className="admin-users-detail-item">
                <label className="admin-users-detail-label">Name:</label>
                <span className="admin-users-detail-value">{selectedUser.name}</span>
              </div>
              <div className="admin-users-detail-item">
                <label className="admin-users-detail-label">Email:</label>
                <span className="admin-users-detail-value">{selectedUser.email}</span>
              </div>
              <div className="admin-users-detail-item">
                <label className="admin-users-detail-label">Phone:</label>
                <span className="admin-users-detail-value">
                  {selectedUser.phone || "Not provided"}
                </span>
              </div>
              <div className="admin-users-detail-item">
                <label className="admin-users-detail-label">Role:</label>
                <span className={getBadgeClass(selectedUser.role)}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="admin-users-detail-item">
                <label className="admin-users-detail-label">Joined:</label>
                <span className="admin-users-detail-value">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <h3 className="admin-card-title">Send Confirmations</h3>

            <div className="admin-users-confirm-buttons">
              <button
                onClick={() => handleSendConfirmation(selectedUser._id, "email")}
                disabled={sendingConfirmation[`${selectedUser._id}-email`]}
                className="admin-users-confirm-btn email"
              >
                📧 Send Email Confirmation
              </button>

              {selectedUser.phone && (
                <>
                  <button
                    onClick={() => handleSendConfirmation(selectedUser._id, "sms")}
                    disabled={sendingConfirmation[`${selectedUser._id}-sms`]}
                    className="admin-users-confirm-btn sms"
                  >
                    📱 Send SMS Confirmation
                  </button>

                  <button
                    onClick={() => handleSendConfirmation(selectedUser._id, "whatsapp")}
                    disabled={sendingConfirmation[`${selectedUser._id}-whatsapp`]}
                    className="admin-users-confirm-btn whatsapp"
                  >
                    💬 Send WhatsApp Confirmation
                  </button>
                </>
              )}

              <button
                onClick={() => handleSendConfirmation(selectedUser._id, "all")}
                disabled={sendingConfirmation[`${selectedUser._id}-all`]}
                className="admin-users-confirm-btn all"
              >
                🚀 Send All Confirmations
              </button>
            </div>

            {!selectedUser.phone && (
              <div className="admin-users-warning">
                ⚠️ User has no phone number. SMS and WhatsApp confirmations cannot be sent.
              </div>
            )}

            <button className="admin-users-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="admin-users-modal">
          <div className="admin-users-modal-content admin-users-form">
            <button className="admin-users-modal-close" onClick={closeAddModal}>
              ✕
            </button>

            <h2 className="admin-users-modal-title">➕ Add New User</h2>

            <form onSubmit={handleCreateUser} className="admin-users-form">
              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="admin-users-form-input"
                  placeholder="Enter user's full name"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="admin-users-form-input"
                  placeholder="Enter user's email"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="admin-users-form-input"
                  placeholder="Enter a strong password"
                  required
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="admin-users-form-input"
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div className="admin-users-form-group">
                <label className="admin-users-form-label">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="admin-users-form-select"
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="admin-users-form-buttons">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="admin-users-submit-btn"
                >
                  {creatingUser ? "Creating..." : "✓ Create User"}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="admin-users-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
