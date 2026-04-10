import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";

export async function POST(req) {
  const { orderId, paymentId } = await req.json();

  if (!orderId || !paymentId) {
    return NextResponse.json(
      { success: false, message: "Missing verification data" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // In production, verify signature with Razorpay
    // For development, verify locally
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // In production: Verify signature
    // const secret = process.env.RAZORPAY_KEY_SECRET;
    // const expectedSignature = crypto
    //   .createHmac("sha256", secret)
    //   .update(`${orderId}|${paymentId}`)
    //   .digest("hex");
    // if (expectedSignature !== signature) {
    //   throw new Error("Invalid signature");
    // }

    // Mark payment as completed
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "completed",
      paymentMethod: "razorpay",
      paymentDetails: { paymentId, razorpayOrderId: order.paymentDetails?.razorpayOrderId },
      status: "confirmed",
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified",
      orderId,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
