import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";

export async function POST(req) {
  const { amount, currency, orderId, customerEmail } = await req.json();

  if (!amount || !orderId) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Generate test Stripe client secret
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
    console.error("Stripe error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
