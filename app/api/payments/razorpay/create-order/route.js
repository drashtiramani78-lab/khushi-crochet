import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import crypto from "crypto";

export async function POST(req) {
  const {
    amount,
    currency,
    orderId,
    customerEmail,
    customerPhone,
  } = await req.json();

  if (!amount || !orderId) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Generate test Razorpay order ID
    const razorpayOrderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store pending order for verification
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "pending",
      paymentMethod: "razorpay",
      paymentDetails: { razorpayOrderId },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      orderId,
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || "INR",
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "test_key",
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
