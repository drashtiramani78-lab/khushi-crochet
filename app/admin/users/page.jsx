"use client";

import { useEffect, useState } from "react";
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
        
        // Refresh users list
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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.heading}>👥 User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            style={styles.addUserBtn}
          >
            ➕ Add New User
          </button>
        </div>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Total Users:</span>
            <span style={styles.statValue}>{users.length}</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Admins:</span>
            <span style={styles.statValue}>
              {users.filter((u) => u.role === "admin").length}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div style={styles.alert("success")}>{successMessage}</div>
      )}
      {errorMessage && <div style={styles.alert("error")}>{errorMessage}</div>}

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filter by Role:</label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Users</option>
          <option value="user">Regular Users</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No users found.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone || "—"}</td>
                  <td style={styles.td}>
                    <span
                      style={styles.badge(
                        user.role === "admin" ? "admin" : "user"
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => openUserModal(user)}
                      style={styles.actionBtn("info")}
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
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={closeModal}>
              ✕
            </button>

            <h2 style={styles.modalTitle}>User Details & Confirmations</h2>

            <div style={styles.userDetails}>
              <div style={styles.detailGroup}>
                <label style={styles.detailLabel}>Name:</label>
                <span style={styles.detailValue}>{selectedUser.name}</span>
              </div>
              <div style={styles.detailGroup}>
                <label style={styles.detailLabel}>Email:</label>
                <span style={styles.detailValue}>{selectedUser.email}</span>
              </div>
              <div style={styles.detailGroup}>
                <label style={styles.detailLabel}>Phone:</label>
                <span style={styles.detailValue}>
                  {selectedUser.phone || "Not provided"}
                </span>
              </div>
              <div style={styles.detailGroup}>
                <label style={styles.detailLabel}>Role:</label>
                <span
                  style={styles.badge(
                    selectedUser.role === "admin" ? "admin" : "user"
                  )}
                >
                  {selectedUser.role}
                </span>
              </div>
              <div style={styles.detailGroup}>
                <label style={styles.detailLabel}>Joined:</label>
                <span style={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Send Confirmations</h3>

            <div style={styles.confirmationButtons}>
              <button
                onClick={() => handleSendConfirmation(selectedUser._id, "email")}
                disabled={sendingConfirmation[`${selectedUser._id}-email`]}
                style={styles.confirmBtn("email")}
              >
                {sendingConfirmation[`${selectedUser._id}-email`]
                  ? "Sending..."
                  : "📧 Send Email Confirmation"}
              </button>

              {selectedUser.phone && (
                <>
                  <button
                    onClick={() =>
                      handleSendConfirmation(selectedUser._id, "sms")
                    }
                    disabled={sendingConfirmation[`${selectedUser._id}-sms`]}
                    style={styles.confirmBtn("sms")}
                  >
                    {sendingConfirmation[`${selectedUser._id}-sms`]
                      ? "Sending..."
                      : "📱 Send SMS Confirmation"}
                  </button>

                  <button
                    onClick={() =>
                      handleSendConfirmation(selectedUser._id, "whatsapp")
                    }
                    disabled={
                      sendingConfirmation[`${selectedUser._id}-whatsapp`]
                    }
                    style={styles.confirmBtn("whatsapp")}
                  >
                    {sendingConfirmation[`${selectedUser._id}-whatsapp`]
                      ? "Sending..."
                      : "💬 Send WhatsApp Confirmation"}
                  </button>
                </>
              )}

              <button
                onClick={() => handleSendConfirmation(selectedUser._id, "all")}
                disabled={sendingConfirmation[`${selectedUser._id}-all`]}
                style={styles.confirmBtn("all")}
              >
                {sendingConfirmation[`${selectedUser._id}-all`]
                  ? "Sending..."
                  : "🚀 Send All Confirmations"}
              </button>
            </div>

            {!selectedUser.phone && (
              <div style={styles.warningBox}>
                ⚠️ User has no phone number. SMS and WhatsApp confirmations
                cannot be sent.
              </div>
            )}

            <button onClick={closeModal} style={styles.closeModalBtn}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button style={styles.closeBtn} onClick={closeAddModal}>
              ✕
            </button>

            <h2 style={styles.modalTitle}>➕ Add New User</h2>

            <form onSubmit={handleCreateUser} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="Enter user's full name"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="Enter user's email"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="Enter a strong password"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={styles.formSelect}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={styles.formButtons}>
                <button
                  type="submit"
                  disabled={creatingUser}
                  style={styles.submitBtn}
                >
                  {creatingUser ? "Creating..." : "✓ Create User"}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  style={styles.cancelBtn}
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

const styles = {
  page: {
    padding: "30px",
    background: "#f9f7f2",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    marginBottom: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "15px",
  },
  heading: {
    fontSize: "32px",
    marginBottom: 0,
    color: "#2c2c2c",
    margin: 0,
  },
  addUserBtn: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#27ae60",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "background 0.3s",
    whiteSpace: "nowrap",
  },
  stats: {
    display: "flex",
    gap: "20px",
    marginTop: "15px",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
  statLabel: {
    color: "#666",
    fontWeight: 500,
  },
  statValue: {
    color: "#b08d57",
    fontWeight: "bold",
    fontSize: "18px",
  },
  alert: (type) => ({
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: type === "success" ? "#d4edda" : "#f8d7da",
    color: type === "success" ? "#155724" : "#721c24",
    border: `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
  }),
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    padding: "15px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  filterLabel: {
    fontWeight: 600,
    color: "#2c2c2c",
  },
  filterSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    cursor: "pointer",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "12px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #b08d57",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "12px",
    color: "#999",
  },
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#b08d57",
    color: "#fff",
    padding: "14px",
    textAlign: "left",
    fontWeight: 600,
  },
  tr: {
    borderBottom: "1px solid #eee",
    transition: "background 0.2s",
  },
  td: {
    padding: "14px",
  },
  badge: (type) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    background: type === "admin" ? "#ffeaa7" : "#dfe6e9",
    color: type === "admin" ? "#d63031" : "#636e72",
  }),
  actionBtn: (type) => ({
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#b08d57",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    transition: "background 0.3s",
  }),
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#999",
  },
  modalTitle: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c2c2c",
  },
  userDetails: {
    background: "#f9f7f2",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "25px",
  },
  detailGroup: {
    marginBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontWeight: 600,
    color: "#666",
  },
  detailValue: {
    color: "#2c2c2c",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    marginTop: "20px",
    color: "#2c2c2c",
    fontWeight: 600,
  },
  confirmationButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  confirmBtn: (type) => ({
    padding: "12px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s",
    background:
      type === "email"
        ? "#ff6b6b"
        : type === "sms"
          ? "#4ecdc4"
          : type === "whatsapp"
            ? "#25d366"
            : "#b08d57",
    color: "#fff",
  }),
  warningBox: {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    color: "#856404",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  closeModalBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    background: "#ddd",
    color: "#333",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
  },
  form: {
    marginTop: "20px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  formLabel: {
    display: "block",
    fontWeight: 600,
    color: "#333",
    marginBottom: "6px",
    fontSize: "14px",
  },
  formInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  formSelect: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "24px",
  },
  submitBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#27ae60",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "background 0.3s",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#666",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.3s",
  },
};