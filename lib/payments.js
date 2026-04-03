// Payment processing library for multiple providers
// Supports: Stripe, Razorpay, Cash on Delivery

export const PAYMENT_METHODS = {
  STRIPE: "stripe",
  RAZORPAY: "razorpay",
  COD: "cod", // Cash on Delivery
};

export const PAYMENT_METHOD_DETAILS = {
  stripe: {
    name: "Credit/Debit Card (Stripe)",
    description: "Visa, Mastercard, American Express",
    icon: "💳",
    countries: ["US", "IN", "UK", "CA", "AU", "NZ", "SG"],
  },
  razorpay: {
    name: "Razorpay (India)",
    description: "Cards, UPI, Wallets, NetBanking",
    icon: "🏦",
    countries: ["IN"],
  },
  cod: {
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: "💵",
    countries: ["IN"],
  },
};

// Validate payment method
export function validatePaymentMethod(method) {
  return Object.values(PAYMENT_METHODS).includes(method);
}

// Format currency based on payment method
export function formatPriceForPayment(amount, currency = "INR") {
  // Stripe requires cents, Razorpay requires paise
  if (currency === "INR") {
    return Math.round(amount * 100); // Convert to paise
  }
  return Math.round(amount * 100); // Convert to cents for USD/other
}

// Create payment intent/order based on provider
export async function initiatePayment(paymentData) {
  const { method, amount, currency, orderId, customerEmail, customerPhone } = paymentData;

  if (!validatePaymentMethod(method)) {
    throw new Error("Invalid payment method");
  }

  if (method === PAYMENT_METHODS.STRIPE) {
    return initiateStripePayment({
      amount,
      currency,
      orderId,
      customerEmail,
    });
  }

  if (method === PAYMENT_METHODS.RAZORPAY) {
    return initiateRazorpayPayment({
      amount,
      currency,
      orderId,
      customerEmail,
      customerPhone,
    });
  }

  if (method === PAYMENT_METHODS.COD) {
    return { success: true, method: "cod", orderId };
  }

  throw new Error("Payment method not supported");
}

// Stripe payment initiation
async function initiateStripePayment({ amount, currency, orderId, customerEmail }) {
  try {
    const response = await fetch("/api/payments/stripe/create-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: currency || "USD",
        orderId,
        customerEmail,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Stripe payment intent");
    }

    const data = await response.json();
    return {
      success: true,
      method: "stripe",
      clientSecret: data.clientSecret,
      orderId: data.orderId,
    };
  } catch (error) {
    console.error("Stripe payment initiation error:", error);
    throw error;
  }
}

// Razorpay payment initiation
async function initiateRazorpayPayment({
  amount,
  currency,
  orderId,
  customerEmail,
  customerPhone,
}) {
  try {
    const response = await fetch("/api/payments/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: currency || "INR",
        orderId,
        customerEmail,
        customerPhone,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    const data = await response.json();
    return {
      success: true,
      method: "razorpay",
      razorpayOrderId: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency,
      orderId: data.orderId,
      key: data.razorpayKeyId,
    };
  } catch (error) {
    console.error("Razorpay payment initiation error:", error);
    throw error;
  }
}

// Verify payment after completion
export async function verifyPayment(verificationData) {
  const { method, orderId, paymentId, signature } = verificationData;

  if (method === PAYMENT_METHODS.STRIPE) {
    return verifyStripePayment({ orderId, paymentId });
  }

  if (method === PAYMENT_METHODS.RAZORPAY) {
    return verifyRazorpayPayment({ orderId, paymentId, signature });
  }

  if (method === PAYMENT_METHODS.COD) {
    return { success: true, orderId };
  }

  throw new Error("Invalid payment verification method");
}

async function verifyStripePayment({ orderId, paymentId }) {
  try {
    const response = await fetch("/api/payments/stripe/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentIntentId: paymentId,
      }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    return response.json();
  } catch (error) {
    console.error("Stripe verification error:", error);
    throw error;
  }
}

async function verifyRazorpayPayment({ orderId, paymentId, signature }) {
  try {
    const response = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error("Payment verification failed");
    }

    return response.json();
  } catch (error) {
    console.error("Razorpay verification error:", error);
    throw error;
  }
}
