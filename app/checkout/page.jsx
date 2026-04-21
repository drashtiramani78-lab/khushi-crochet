"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import "../styles/checkout.css";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "../components/ToastProvider";
import CouponInput from "../components/CouponInput";
import UpiScanner from "../components/UpiScanner";

function CheckoutContent() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const { addToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [copied, setCopied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState({
    couponCode: "",
    discount: 0,
    finalTotal: 0,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

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

  const subtotal = getCartTotal();
  const discountedTotal = appliedCoupon.finalTotal > 0 ? appliedCoupon.finalTotal : subtotal;
  const totalAmount = discountedTotal; // Shipping free

  useEffect(() => {
    if (user && !authLoading) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        state: user.state || "",
        address: user.address || "",
      }));
    }
  }, [user, authLoading]);

  useEffect(() => {
      if (!authLoading && !user) {
        router.push("/login?redirect=/");
      }
  }, [user, authLoading, router]);



  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Full name is required";
    }

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

    if (!form.address.trim()) {
      errors.address = "Address is required";
    }

    if (!form.city.trim()) {
      errors.city = "City is required";
    }

    if (!form.state.trim()) {
      errors.state = "State is required";
    }

    if (!form.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!validatePincode(form.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    if (paymentMethod === "upi_qr" && !form.transactionId.trim()) {
      errors.transactionId = "UPI Transaction ID is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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

  const generateUpiDeepLink = () => {
    const merchantName = "Khushi Crochet";
    const amount = totalAmount.toFixed(2);
    const txnNote = `Payment for Crochet Order - ₹${amount}`;
    
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: merchantName,
      am: amount,
      cu: "INR",
      tn: txnNote,
    });
    
    return `upi://pay?${params.toString()}`;
  };

  const copyUpiDeepLink = async () => {
    try {
      const deepLink = generateUpiDeepLink();
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert(`UPI Deep Link copied!\n\nPaste in GPay/PhonePe app:\n${deepLink}`);
    } catch (error) {
      console.error("Copy failed:", error);
      prompt("Copy this UPI link manually:", generateUpiDeepLink());
    }
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createOrder();
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

      const createOrder = async () => {
    try {
      // Validate cart product IDs before API call
      for (const item of cart) {
        if (!item._id || !/^[0-9a-fA-F]{24}$/.test(item._id)) {
          console.error("INVALID PRODUCT ID IN CART:", item._id, "Item:", item);
          setErrorMessage(`Invalid cart item: ${item.name || 'Unknown'} missing valid product ID. Clear cart and re-add items.`);
          // Clear corrupted cart
          localStorage.removeItem('cart');
          window.location.reload();
          return;
        }
      }
      console.log("✅ Cart validation passed. Product IDs:", cart.map(item => item._id));

      const paymentMethodMap = {
        cod: "COD",
        upi_qr: "UPI_QR",
      };

      const orderData = {
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ""),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: "India",
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name.trim(),
          price:
            typeof item.price === "string"
              ? parseFloat(item.price.replace(/[^\d.]/g, ""))
              : Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || "",
        })),
        subtotal: getCartTotal(),
        shippingCost: 0,
        couponCode: appliedCoupon.couponCode || "",
        discount: appliedCoupon.discount || 0,
        totalAmount,
        paymentMethod: paymentMethodMap[paymentMethod] || "COD",
        paymentStatus:
          paymentMethodMap[paymentMethod] === "COD"
            ? "Pending"
            : "Pending_Verification",
        orderStatus: "Pending",
      };

      if (paymentMethod === "upi_qr") {
        orderData.transactionId = form.transactionId.trim();
        orderData.upiId = UPI_ID;
      }

      for (const item of orderData.items) {
        if (!item.productId || !/^[0-9a-fA-F]{24}$/.test(item.productId)) {
          throw new Error(`Invalid product ID: ${item.productId}`);
        }

        if (!item.name || item.price <= 0 || item.quantity < 1) {
          throw new Error("Invalid cart item data");
        }
      }

      console.log("🔄 Sending order data:", { totalAmount, paymentMethod: paymentMethodMap[paymentMethod], itemCount: orderData.items.length });
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      console.log("📡 API Response:", res.status, res.statusText);
      const data = await res.json();
      console.error("API Data Response:", data);

      if (res.status === 401) {
        setErrorMessage("Please login to place an order");
        router.push("/login?redirect=/");
        return;
      }

      if (res.ok) {
        const trackingId = data.data?.trackingId || data.data?._id || "N/A";
        const orderMsg = paymentMethod === "upi_qr"
          ? `Order placed! Payment verification pending. ID: ${trackingId}`
          : `Order placed successfully! ID: ${trackingId}`;

        setSuccessMessage(orderMsg);

        addToast({
          type: 'success',
          title: 'Order Confirmed! 🎉',
          description: `Order ID: ${trackingId}. We've received your order and will process it shortly. Check your orders page or track below.`,
          duration: 5000
        });

        clearCart();
        setTimeout(() => {
          router.push(`/order-track?id=${trackingId}`);
        }, 3000);
      } else {
        console.error("API ERROR 4xx/5xx:", res.status, data);
        setErrorMessage(
          data.message || data.errors?.[0] || `Server error ${res.status}`
        );
      }
    } catch (error) {
      console.error("FETCH FAILED:", error.message);
      console.error("OrderData sample:", { customerName: orderData.customerName, itemsCount: orderData.items.length });
      setErrorMessage(
        `Network error: ${error.message}. Check console. Server may be unstable.`
      );
    }
  };

  if (cart.length === 0) {
    return (
<div className="empty-cart-hero">
        <h2 className="empty-title">Your Cart is Empty</h2>
        <p className="empty-subtitle">Add some beautiful crochet creations before proceeding to checkout</p>
        <Link href="/products" className="checkout-btn checkout-btn-primary">
          Continue Shopping →
        </Link>
      </div>
    );
  }

  if (authLoading) {
    return (
<div className="loading-checkout">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-xl font-bold text-gray-700">Preparing checkout...</span>
      </div>
    );
  }

  return (
<div className="checkout-page">
      <div className="checkout-container">
        <nav className="checkout-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/cart">Cart</Link>
          <span>/</span>
          <h1 className="checkout-title">Checkout</h1>
        </nav>

{errorMessage && (
          <div className="alert-error">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert-success">
            {successMessage}
          </div>
        )}

<div className="checkout-grid">
          <div className="checkout-form-card">
            <h2 className="checkout-section-title">Shipping Address</h2>

            <div className="space-y-5">
              <div>
                <label className="checkout-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className={`checkout-input ${formErrors.name ? 'error' : ''}`}
                />
                {formErrors.name && <span className="checkout-error">{formErrors.name}</span>}
              </div>

              <CouponInput cartTotal={subtotal} onCouponApply={setAppliedCoupon} />

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                    formErrors.email
                      ? "border-red-400 bg-red-50"
                      : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                  }`}
                />
                {formErrors.email && (
                  <span className="block mt-2 text-red-500 text-sm font-semibold">
                    {formErrors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                    formErrors.phone
                      ? "border-red-400 bg-red-50"
                      : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                  }`}
                />
                {formErrors.phone && (
                  <span className="block mt-2 text-red-500 text-sm font-semibold">
                    {formErrors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  placeholder="House No., Street Name, Apartment/Suite, Landmark"
                  value={form.address}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg resize-vertical ${
                    formErrors.address
                      ? "border-red-400 bg-red-50"
                      : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                  }`}
                />
                {formErrors.address && (
                  <span className="block mt-2 text-red-500 text-sm font-semibold">
                    {formErrors.address}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                      formErrors.city
                        ? "border-red-400 bg-red-50"
                        : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                    }`}
                  />
                  {formErrors.city && (
                    <span className="block mt-2 text-red-500 text-sm font-semibold">
                      {formErrors.city}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                      formErrors.state
                        ? "border-red-400 bg-red-50"
                        : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                    }`}
                  />
                  {formErrors.state && (
                    <span className="block mt-2 text-red-500 text-sm font-semibold">
                      {formErrors.state}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="400001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                  className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                    formErrors.pincode
                      ? "border-red-400 bg-red-50"
                      : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                  }`}
                />
                {formErrors.pincode && (
                  <span className="block mt-2 text-red-500 text-sm font-semibold">
                    {formErrors.pincode}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-[#2f2723] mt-16 mb-6">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#b59a7a] bg-[#b59a7a]/5 ring-2 ring-[#b59a7a]/20"
                      : "border-[#ddd3c7] hover:border-[#b59a7a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-[#b59a7a] cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-lg">💵 Cash on Delivery</div>
                    <p className="text-sm text-[#999] mt-1">
                      Pay securely when you receive your order
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === "upi_qr"
                      ? "border-[#b59a7a] bg-[#b59a7a]/5 ring-2 ring-[#b59a7a]/20"
                      : "border-[#ddd3c7] hover:border-[#b59a7a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi_qr"
                    checked={paymentMethod === "upi_qr"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5 text-[#b59a7a] cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-lg">📱 UPI QR (Instant)</div>
                    <p className="text-sm text-[#999] mt-1">
                      Pay using Google Pay, PhonePe, Paytm or any UPI app
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === "upi_qr" && (
                <div className="mt-8 p-6 border border-[#eadfce] bg-[#fffbf8] rounded-3xl">
                  <h3 className="text-2xl font-bold text-[#2f2723] mb-6">
                    Scan to Pay
                  </h3>

                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src="/upi-qr.png"
                      alt="UPI QR Code - Khushi Crochet"
                      width={224}
                      height={224}
                      className="rounded-2xl border-2 border-[#ddd3c7] bg-white shadow-lg"
                      priority
                    />
                  </div>

                  <p className="text-center text-[#6e6259] mb-6 leading-relaxed">
                    📱 Scan QR above with GPay, PhonePe, Paytm or any UPI app<br/>
                    💰 Pay exactly <strong>₹{totalAmount.toFixed(2)}</strong>
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#ddd3c7]">
                      <span className="text-sm font-bold text-[#2f2723]">
                        UPI ID:
                      </span>
                      <span className="text-base text-[#6e6259] break-all flex-1 min-w-0">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="px-4 py-2 bg-[#b59a7a] hover:bg-[#b59a7a]/90 text-white text-xs font-bold rounded-xl transition-all whitespace-nowrap"
                      >
                        {copied ? "Copied!" : "Copy ID"}
                      </button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2 border-green-200">
                      <p className="text-center font-semibold text-green-700 mb-3 text-sm">
                        🚀 Instant Payment - One Tap
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={copyUpiDeepLink}
                          className="flex flex-col items-center p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all font-semibold text-sm"
                        >
                          <span className="text-2xl mb-1">📱</span>
                          <span>GPay</span>
                          <span className="text-xs opacity-90">₹{totalAmount.toFixed(2)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={copyUpiDeepLink}
                          className="flex flex-col items-center p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg transform hover:scale-105 transition-all font-semibold text-sm"
                        >
                          <span className="text-2xl mb-1">📱</span>
                          <span>PhonePe</span>
                          <span className="text-xs opacity-90">₹{totalAmount.toFixed(2)}</span>
                        </button>
                      </div>
                      <p className="text-xs text-center text-gray-600 mt-2">
                        Tap → Copies UPI link → Paste in your UPI app
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-lg font-semibold text-[#2f2723] mb-4">
                    Pay <strong>₹{totalAmount.toFixed(2)}</strong> exactly
                  </div>

                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723] mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      placeholder="Enter UPI txn ID"
                      value={form.transactionId}
                      onChange={handleChange}
                      className={`w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg ${
                        formErrors.transactionId
                          ? "border-red-400 bg-red-50"
                          : "border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a]"
                      }`}
                    />
                    {formErrors.transactionId && (
                      <span className="block mt-2 text-red-500 text-sm font-semibold">
                        {formErrors.transactionId}
                      </span>
                    )}
                  </div>

                  <UpiScanner
                    onScan={(decodedText) =>
                      setForm((prev) => ({
                        ...prev,
                        transactionId: decodedText,
                      }))
                    }
                    totalAmount={totalAmount}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl sticky top-32 self-start h-fit">
            <h2 className="text-2xl font-bold text-[#2f2723] mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-8 pb-6 border-b-2 border-[#ddd3c7]">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-[80px_1fr_100px] gap-4 items-start p-4 rounded-2xl bg-[#fffbf8]"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f2ece4]">
                    {item.image && !item.image.startsWith("blob:") ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        priority
                        className="w-full h-full object-cover"
                      />

                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#b59a7a]">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-semibold text-base text-[#2f2723]">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#6e6259]">Qty: {item.quantity}</p>
                  </div>

                  <div className="text-right font-bold text-base text-[#b59a7a]">
                    ₹
                    {(
                      (typeof item.price === "string"
                        ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                        : item.price) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-[#6e6259]">
                <span>Subtotal:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6e6259]">
                <span>Shipping:</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>
            </div>

            <div className="border-t-2 border-[#ddd3c7] pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-2xl text-[#b59a7a]">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className={`w-full py-4 px-6 rounded-full font-bold uppercase tracking-wide text-lg transition-all ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#2f2723] hover:bg-opacity-90 text-white"
              } disabled:opacity-50`}
              onClick={placeOrder}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "upi_qr"
                ? "Confirm UPI Payment"
                : "Place Order"}
            </button>

            <Link
              href="/cart"
              className="block w-full text-center mt-4 py-4 px-6 rounded-full font-bold uppercase tracking-wide text-lg border-2 border-[#2f2723] text-[#2f2723] hover:bg-[#2f2723] hover:text-white transition-all"
            >
              Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}