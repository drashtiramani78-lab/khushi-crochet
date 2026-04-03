import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";

export async function POST(req) {
  const { orderId, paymentIntentId } = await req.json();

  if (!orderId || !paymentIntentId) {
    return NextResponse.json(
      { success: false, message: "Missing verification data" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Update order with payment confirmation
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
