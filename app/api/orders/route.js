import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/notifications";
import { getAuthUser } from "@/lib/auth";
import { cookies } from "next/headers";
import { sanitizeRequestBodyAuto, checkXSSThreats, sanitizeEmail, sanitizePhone } from "@/lib/sanitization";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === "true";
}

function generateTrackingId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `KC${timestamp}${random}`;
}

const validateOrderData = (body) => {
  const errors = [];

  if (!body.customerName || !body.customerName.trim()) {
    errors.push("Customer name is required");
  }

  if (!body.email || !body.email.trim()) {
    errors.push("Email is required");
  }

  if (!body.phone || !body.phone.trim()) {
    errors.push("Phone is required");
  }

  if (!body.address || !body.address.trim()) {
    errors.push("Address is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("Order must contain at least one item");
  }

  if (!body.totalAmount || body.totalAmount <= 0) {
    errors.push("Invalid total amount");
  }

  // Validate EXACT schema enum values (already normalized)
  const validPaymentMethods = ['COD', 'RAZORPAY', 'STRIPE', 'UPI_QR'];
  if (!validPaymentMethods.includes(body.paymentMethod)) {
    errors.push(`Invalid paymentMethod: ${body.paymentMethod}. Must be one of ${validPaymentMethods.join(', ')}`);
  }

  const validPaymentStatuses = ['Pending', 'Paid', 'Failed', 'Refunded', 'Pending_Verification'];
  if (!validPaymentStatuses.includes(body.paymentStatus)) {
    errors.push(`Invalid paymentStatus: ${body.paymentStatus}. Must be one of ${validPaymentStatuses.join(', ')}`);
  }

  const validOrderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  if (!validOrderStatuses.includes(body.orderStatus)) {
    errors.push(`Invalid orderStatus: ${body.orderStatus}. Must be one of ${validOrderStatuses.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export async function GET() {
  try {
    // Check admin authentication for fetching all orders
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Check if user is authenticated
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please login to place an order"
        },
        { status: 401 }
      );
    }

    await connectDB();

    let body = await req.json();

    // Check for XSS threats and log them
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Order submission contains potential XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["customerName", "address"],
      emailFields: ["email"],
      phoneFields: ["phone"],
      numberFields: { totalAmount: { min: 0, max: 10000000 } },
    });

    // Further sanitization for specific fields
    body.email = sanitizeEmail(body.email);
    body.phone = sanitizePhone(body.phone);

    // Normalize enum values FIRST to match schema
    const normalizedPaymentMethod = (body.paymentMethod || 'COD').toUpperCase();
    const normalizedPaymentStatus = normalizedPaymentMethod === 'COD' 
      ? 'Pending' 
      : ((body.paymentStatus || 'pending').charAt(0).toUpperCase() + (body.paymentStatus || 'pending').slice(1).toLowerCase());
    const normalizedOrderStatus = (body.orderStatus || 'pending').charAt(0).toUpperCase() + (body.orderStatus || 'pending').slice(1).toLowerCase();

    // NOW validate normalized data
    const validation = validateOrderData({
      ...body,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentStatus,
      orderStatus: normalizedOrderStatus
    });
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed",
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      userId: authUser._id,
      customerName: body.customerName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address.trim(),
      city: body.city?.trim() || '',
      state: body.state?.trim() || '',
      pincode: body.pincode?.trim() || '',
      country: body.country || 'India',
      items: Array.isArray(body.items) ? body.items : [],
      subtotal: Number(body.subtotal) || 0,
      shippingCost: Number(body.shippingCost) || 0,
      couponCode: body.couponCode || '',
      discountAmount: Number(body.discount) || 0,
      totalAmount: Number(body.totalAmount) || 0,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentStatus,
      orderStatus: normalizedOrderStatus,
      razorpayPaymentId: body.razorpayPaymentId || null,
      transactionId: body.transactionId || null,
      upiId: body.upiId || null,
      notes: body.notes || '',
      trackingId: generateTrackingId(),
    });


    // Send order confirmations (email, SMS, WhatsApp)
    const user = {
      name: body.customerName,
      email: body.email,
      phone: body.phone,
    };
    
    try {
      await sendOrderConfirmation(newOrder, user);
    } catch (confirmationError) {
      console.error("Error sending order confirmation:", confirmationError);
      // Don't fail the order creation if confirmation fails
    }

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);
    
    // Handle Mongoose validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: validationErrors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}