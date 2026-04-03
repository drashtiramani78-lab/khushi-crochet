// Stripe Payment API Routes
// Requires: npm install stripe

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";

// Note: In production, install stripe package
// npm install stripe

// For now, provide placeholder responses that show the structure
export async function POST(req) {
  try {
    const { action } = req.nextUrl.pathname.split("/").pop() === "create-intent"
      ? { action: "create-intent" }
      : { action: req.body?.action };

    if (action === "create-intent") {
      return handleCreateIntent(req);
    } else if (action === "verify") {
      return handleVerifyPayment(req);
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Stripe API error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

async function handleCreateIntent(req) {
  const { amount, currency, orderId, customerEmail } = await req.json();

  if (!amount || !orderId) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // In production, create actual Stripe PaymentIntent
    // For development, generate a test client secret
    const clientSecret = `pi_test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      clientSecret,
      orderId,
      amount,
      currency: currency || "USD",
    });
  } catch (error) {
    console.error("Create intent error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

async function handleVerifyPayment(req) {
  const { orderId, paymentIntentId } = await req.json();

  if (!orderId || !paymentIntentId) {
    return NextResponse.json(
      { success: false, message: "Missing verification data" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // In production, verify with Stripe API
    // For now, mark as completed
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "completed",
      paymentMethod: "stripe",
      paymentDetails: { paymentIntentId },
      status: "confirmed",
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      orderId,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
