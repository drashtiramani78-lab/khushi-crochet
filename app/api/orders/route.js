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

    // Validate order data
    const validation = validateOrderData(body);
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
      items: Array.isArray(body.items) ? body.items : [],
      totalAmount: Number(body.totalAmount) || 0,
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: body.paymentMethod === "COD" ? "Pending" : (body.paymentStatus || "Pending"),
      orderStatus: body.orderStatus || "Pending",
      razorpayPaymentId: body.razorpayPaymentId || null,
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
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}