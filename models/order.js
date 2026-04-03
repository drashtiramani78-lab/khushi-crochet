"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

function CheckoutContent() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    transactionId: "",
  });

  const UPI_ID = "drashtiramani78@okhdfcbank";
  const QR_IMAGE = "/upi-qr.png";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");
    return /^[0-9]{10}$/.test(cleanPhone);
  };

  const validatePincode = (pincode) => {
    return /^[0-9]{6}$/.test(pincode);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Full name is required";

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(form.phone)) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";

    if (!form.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!validatePincode(form.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    if (paymentMethod === "upi_qr" && !form.transactionId.trim()) {
      errors.transactionId = "UPI transaction ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const getSafeImageSrc = (src) => {
    if (!src || typeof src !== "string") return null;
    const trimmed = src.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("blob:")) return null;
    if (trimmed === "undefined" || trimmed === "null") return null;
    return trimmed;
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const getBackendPaymentMethod = () => {
    if (paymentMethod === "cod") return "COD";
    return "RAZORPAY";
  };

  const getInitialPaymentStatus = () => {
    if (paymentMethod === "cod") return "Pending";
    return "Pending";
  };

  const getInitialOrderStatus = () => {
    return "Pending";
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    if (!cart || cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const totalAmount = Number(getCartTotal()) || 0;
      await createOrder(totalAmount);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const createOrder = async (totalAmount) => {
    try {
      const subtotal = totalAmount;
      const shippingCost = 0;
      const discount = 0;

      const orderData = {
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: "India",
        items: cart.map((item) => ({
          productId: item._id || item.productId || "",
          name: item.name || "",
          price:
            typeof item.price === "string"
              ? parseFloat(item.price.replace(/[^\d.]/g, "")) || 0
              : Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || "",
        })),
        subtotal,
        shippingCost,
        discount,
        totalAmount,
        paymentMethod: getBackendPaymentMethod(),
        paymentStatus: getInitialPaymentStatus(),
        orderStatus: getInitialOrderStatus(),
        notes:
          paymentMethod === "upi_qr"
            ? `UPI payment submitted by customer. Transaction ID: ${form.transactionId.trim()}`
            : "",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Please login to place an order");
        router.push("/login?redirect=/checkout");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to place order");
        setIsProcessing(false);
        return;
      }

      const orderId = data?.data?._id;
      const trackingId = data?.data?.trackingId || orderId || "N/A";

      if (paymentMethod === "razorpay" || paymentMethod === "stripe") {
        router.push(`/payment/razorpay?orderId=${orderId}`);
        return;
      }

      if (paymentMethod === "upi_qr") {
        alert(
          `Order placed successfully. Your payment will be verified soon. Tracking ID: ${trackingId}`
        );
      } else {
        alert(`Order placed successfully. Tracking ID: ${trackingId}`);
      }

      clearCart();
      router.push(`/order-track?id=${trackingId}`);
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div style={styles.emptyCart}>
        <div style={styles.emptyContent}>
          <h2 style={styles.emptyTitle}>Loading...</h2>
          <p style={styles.emptyText}>Please wait</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <div style={styles.emptyContent}>
          <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
          <p style={styles.emptyText}>
            Add some products before proceeding to checkout
          </p>
          <Link href="/products" style={styles.continueShoppingBtn}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = Number(getCartTotal()) || 0;

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.pageHeader}>
          <div style={styles.breadcrumb}>
            <Link href="/" style={styles.breadcrumbLink}>
              Home
            </Link>
            <span style={styles.breadcrumbSeparator}>/</span>
            <Link href="/cart" style={styles.breadcrumbLink}>
              Cart
            </Link>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbCurrent}>Checkout</span>
          </div>
          <h1 style={styles.heading}>Complete Your Order</h1>
        </div>

        <div style={styles.wrapper}>
          <div style={styles.left}>
            <h2 style={styles.sectionTitle}>Shipping Address</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: formErrors.name ? "#dc3545" : "#ddd3c7",
                }}
              />
              {formErrors.name && (
                <span style={styles.error}>{formErrors.name}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: formErrors.email ? "#dc3545" : "#ddd3c7",
                }}
              />
              {formErrors.email && (
                <span style={styles.error}>{formErrors.email}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: formErrors.phone ? "#dc3545" : "#ddd3c7",
                }}
              />
              {formErrors.phone && (
                <span style={styles.error}>{formErrors.phone}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Full Address *</label>
              <textarea
                name="address"
                placeholder="House No., Street Name, Apartment/Suite"
                value={form.address}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  minHeight: "100px",
                  borderColor: formErrors.address ? "#dc3545" : "#ddd3c7",
                  resize: "vertical",
                }}
              />
              {formErrors.address && (
                <span style={styles.error}>{formErrors.address}</span>
              )}
            </div>

            <div style={styles.twoColumns}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Ahmedabad"
                  value={form.city}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.city ? "#dc3545" : "#ddd3c7",
                  }}
                />
                {formErrors.city && (
                  <span style={styles.error}>{formErrors.city}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>State *</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Gujarat"
                  value={form.state}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.state ? "#dc3545" : "#ddd3c7",
                  }}
                />
                {formErrors.state && (
                  <span style={styles.error}>{formErrors.state}</span>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Pincode *</label>
              <input
                type="text"
                name="pincode"
                placeholder="380001"
                maxLength="6"
                value={form.pincode}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: formErrors.pincode ? "#dc3545" : "#ddd3c7",
                }}
              />
              {formErrors.pincode && (
                <span style={styles.error}>{formErrors.pincode}</span>
              )}
            </div>

            <h2 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
              Payment Method
            </h2>

            <div style={styles.paymentOptions}>
              <label
                style={{
                  ...styles.paymentLabel,
                  borderColor: paymentMethod === "cod" ? "#b59a7a" : "#ddd3c7",
                  backgroundColor:
                    paymentMethod === "cod"
                      ? "rgba(181, 154, 122, 0.05)"
                      : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "12px", cursor: "pointer" }}
                />
                <span>
                  <strong style={{ fontWeight: "700" }}>
                    💵 Cash on Delivery (COD)
                  </strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#999" }}>
                    Pay when you receive
                  </p>
                </span>
              </label>

              <label
                style={{
                  ...styles.paymentLabel,
                  borderColor:
                    paymentMethod === "stripe" ? "#b59a7a" : "#ddd3c7",
                  backgroundColor:
                    paymentMethod === "stripe"
                      ? "rgba(181, 154, 122, 0.05)"
                      : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "12px", cursor: "pointer" }}
                />
                <span>
                  <strong style={{ fontWeight: "700" }}>
                    💳 Credit/Debit Card
                  </strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#999" }}>
                    Secure online payment
                  </p>
                </span>
              </label>

              <label
                style={{
                  ...styles.paymentLabel,
                  borderColor:
                    paymentMethod === "razorpay" ? "#b59a7a" : "#ddd3c7",
                  backgroundColor:
                    paymentMethod === "razorpay"
                      ? "rgba(181, 154, 122, 0.05)"
                      : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "12px", cursor: "pointer" }}
                />
                <span>
                  <strong style={{ fontWeight: "700" }}>
                    🏦 Razorpay
                  </strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#999" }}>
                    Cards, UPI, wallets and more
                  </p>
                </span>
              </label>

              <label
                style={{
                  ...styles.paymentLabel,
                  borderColor:
                    paymentMethod === "upi_qr" ? "#b59a7a" : "#ddd3c7",
                  backgroundColor:
                    paymentMethod === "upi_qr"
                      ? "rgba(181, 154, 122, 0.05)"
                      : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi_qr"
                  checked={paymentMethod === "upi_qr"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "12px", cursor: "pointer" }}
                />
                <span>
                  <strong style={{ fontWeight: "700" }}>
                    📱 UPI QR
                  </strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#999" }}>
                    Scan and pay with any UPI app
                  </p>
                </span>
              </label>
            </div>

            {paymentMethod === "upi_qr" && (
              <div style={styles.upiBox}>
                <h3 style={styles.upiTitle}>Scan & Pay</h3>

                <div style={styles.qrWrapper}>
                  <Image
                    src={QR_IMAGE}
                    alt="UPI QR Code"
                    width={220}
                    height={220}
                    style={styles.qrImage}
                  />
                </div>

                <p style={styles.upiText}>
                  Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.
                </p>

                <div style={styles.upiIdBox}>
                  <span style={styles.upiIdLabel}>UPI ID:</span>
                  <span style={styles.upiIdValue}>{UPI_ID}</span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    style={styles.copyBtn}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div style={styles.paymentNote}>
                  Please pay <strong>₹{totalAmount.toFixed(2)}</strong> and enter your
                  UPI transaction ID below.
                </div>

                <div style={{ marginTop: "18px" }}>
                  <label style={styles.label}>UPI Transaction ID *</label>
                  <input
                    type="text"
                    name="transactionId"
                    placeholder="Enter transaction ID"
                    value={form.transactionId}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      borderColor: formErrors.transactionId ? "#dc3545" : "#ddd3c7",
                    }}
                  />
                  {formErrors.transactionId && (
                    <span style={styles.error}>{formErrors.transactionId}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.right}>
            <h2 style={styles.sectionTitle}>Order Summary</h2>

            <div style={styles.itemsList}>
              {cart.map((item) => {
                const safeImageSrc = getSafeImageSrc(item.image);
                const itemTotal =
                  ((typeof item.price === "string"
                    ? parseFloat(item.price.replace(/[^\d.]/g, "")) || 0
                    : Number(item.price) || 0) * (Number(item.quantity) || 1));

                return (
                  <div key={item._id} style={styles.itemRow}>
                    <div style={styles.itemImageWrapper}>
                      {safeImageSrc && !imageErrors[item._id] ? (
                        <Image
                          src={safeImageSrc}
                          alt={item.name || "Product image"}
                          width={80}
                          height={80}
                          style={styles.itemImage}
                          unoptimized
                          onError={() => handleImageError(item._id)}
                        />
                      ) : (
                        <div style={styles.imagePlaceholder}>
                          Image unavailable
                        </div>
                      )}
                    </div>

                    <div style={styles.itemInfo}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemQuantity}>Qty: {item.quantity}</p>
                    </div>

                    <div style={styles.itemPrice}>₹{itemTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            <div style={styles.totalBox}>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <div style={styles.summaryRow}>
                <span>Shipping:</span>
                <span style={{ color: "#27ae60", fontWeight: "600" }}>FREE</span>
              </div>

              <div
                style={{
                  ...styles.summaryRow,
                  borderTop: "2px solid #ddd3c7",
                  paddingTop: "14px",
                  marginTop: "14px",
                  fontSize: "16px",
                }}
              >
                <strong>Total:</strong>
                <strong style={{ color: "#b59a7a", fontSize: "20px" }}>
                  ₹{totalAmount.toFixed(2)}
                </strong>
              </div>

              <button
                style={styles.orderBtn}
                onClick={placeOrder}
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing..."
                  : paymentMethod === "upi_qr"
                  ? "Confirm UPI Payment"
                  : paymentMethod === "cod"
                  ? "Place Order"
                  : "Proceed to Payment"}
              </button>

              <Link href="/cart" style={styles.editCartBtn}>
                Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f5f0",
    padding: "100px 0 80px",
  },
  emptyCart: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f5f0",
    padding: "40px 20px",
  },
  emptyContent: {
    textAlign: "center",
    maxWidth: "600px",
  },
  emptyTitle: {
    fontSize: "42px",
    fontWeight: "600",
    color: "#2f2723",
    marginBottom: "18px",
    margin: "0 0 18px 0",
  },
  emptyText: {
    fontSize: "18px",
    color: "#6e6259",
    lineHeight: "1.8",
    marginBottom: "36px",
    margin: "0 0 36px 0",
  },
  continueShoppingBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 28px",
    background: "#2f2723",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    transition: "all 0.3s ease",
  },
  pageHeader: {
    marginBottom: "50px",
    paddingTop: "20px",
  },
  breadcrumb: {
    fontSize: "14px",
    color: "#6e6259",
    marginBottom: "24px",
  },
  breadcrumbLink: {
    color: "#6e6259",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  breadcrumbSeparator: {
    color: "#b59a7a",
    margin: "0 10px",
    fontWeight: "500",
  },
  breadcrumbCurrent: {
    color: "#2f2723",
    fontWeight: "600",
  },
  heading: {
    fontSize: "44px",
    fontWeight: "600",
    color: "#2f2723",
    margin: 0,
  },
  wrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "40px",
  },
  left: {
    background: "#fff",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(47, 39, 35, 0.08)",
  },
  right: {
    background: "#fff",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(47, 39, 35, 0.08)",
    height: "fit-content",
    position: "sticky",
    top: "130px",
  },
  sectionTitle: {
    margin: "0 0 24px 0",
    color: "#2f2723",
    fontSize: "20px",
    fontWeight: "700",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2f2723",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd3c7",
    outline: "none",
    fontSize: "15px",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    backgroundColor: "#fffbf8",
  },
  error: {
    display: "block",
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: "600",
  },
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  paymentOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  paymentLabel: {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    border: "2px solid #ddd3c7",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "15px",
    color: "#2f2723",
  },
  upiBox: {
    marginTop: "22px",
    padding: "22px",
    borderRadius: "16px",
    background: "#fffbf8",
    border: "1px solid #eadfce",
  },
  upiTitle: {
    margin: "0 0 16px 0",
    fontSize: "20px",
    color: "#2f2723",
  },
  qrWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "14px",
  },
  qrImage: {
    borderRadius: "12px",
    border: "1px solid #ddd3c7",
    objectFit: "contain",
    background: "#fff",
  },
  upiText: {
    fontSize: "14px",
    color: "#6e6259",
    textAlign: "center",
    marginBottom: "16px",
    lineHeight: "1.7",
  },
  upiIdBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "14px",
    padding: "12px 14px",
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #ddd3c7",
  },
  upiIdLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#2f2723",
  },
  upiIdValue: {
    fontSize: "14px",
    color: "#6e6259",
    wordBreak: "break-all",
  },
  copyBtn: {
    marginLeft: "auto",
    border: "none",
    background: "#2f2723",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  paymentNote: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#2f2723",
  },
  itemsList: {
    marginBottom: "24px",
    borderBottom: "2px solid #ddd3c7",
    paddingBottom: "24px",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 100px",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fffbf8",
  },
  itemImageWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f2ece4",
    flexShrink: 0,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    color: "#b59a7a",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  itemName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#2f2723",
  },
  itemQuantity: {
    margin: 0,
    fontSize: "12px",
    color: "#6e6259",
  },
  itemPrice: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#b59a7a",
    textAlign: "right",
  },
  totalBox: {
    marginTop: "0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "14px",
    color: "#6e6259",
  },
  orderBtn: {
    width: "100%",
    padding: "14px 20px",
    border: "none",
    borderRadius: "999px",
    background: "#2f2723",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginTop: "24px",
    transition: "all 0.3s ease",
  },
  editCartBtn: {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    textAlign: "center",
    marginTop: "12px",
    border: "2px solid #2f2723",
    background: "#fff",
    color: "#2f2723",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    textDecoration: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8f5f0",
          }}
        >
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}