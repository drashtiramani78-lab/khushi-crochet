import { NextResponse } from "next/server";

export async function POST(req) {
  const { amount, currency, orderId } = await req.json();

  if (!amount || !orderId) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
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
