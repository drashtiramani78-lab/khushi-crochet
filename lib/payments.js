// UPI/COD Payment utilities - Production ready

export const PAYMENT_METHODS = {
  UPI: "upi_qr",
  COD: "cod"
};

export const PAYMENT_METHOD_DETAILS = {
  upi_qr: {
    name: "UPI QR (GPay/PhonePe/Paytm)",
    description: "Instant scan & pay",
    icon: "📱",
    countries: ["IN"],
  },
  cod: {
    name: "Cash on Delivery",
    description: "Pay when delivered",
    icon: "💵",
    countries: ["IN"],
  },
};

// Validate payment method
export function validatePaymentMethod(method) {
  return Object.values(PAYMENT_METHODS).includes(method);
}

// UPI deep link generator
export function generateUpiDeepLink({ amount, orderId, upiId = "drashtiramani78@okhdfcbank" }) {
  const amountInPaisa = Math.round(amount * 100);
  return `upi://pay?pa=${upiId}&am=${amountInPaisa}&cu=INR&tn=Khushi%20Crochet%20${orderId}`;
}

// Initiate payment (client-side for UPI/COD)
export async function initiatePayment(paymentData) {
  const { method, amount, orderId } = paymentData;

  if (!validatePaymentMethod(method)) {
    throw new Error("Invalid payment method");
  }

  if (method === PAYMENT_METHODS.UPI) {
    const upiDeepLink = generateUpiDeepLink({ amount, orderId });
    return {
      success: true,
      method: "upi_qr",
      deepLink: upiDeepLink,
      qrEndpoint: "/api/payments/upi-qr",
      orderId
    };
  }

  if (method === PAYMENT_METHODS.COD) {
    return { 
      success: true, 
      method: "cod", 
      orderId 
    };
  }

  throw new Error("Payment method not supported");
}

// Verify payment server-side (for UPI txn manual verification)
export async function verifyPayment(verificationData) {
  const { method, orderId } = verificationData;
  
  if (method === PAYMENT_METHODS.COD) {
    return { success: true, orderId };
  }
  
  // UPI verification handled server-side via admin panel/transaction ID matching
  throw new Error("Server-side verification required for UPI");
}

