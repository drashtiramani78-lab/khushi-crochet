import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const order = await Order.findOne({
      trackingId: body.trackingId,
      email: body.email,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/orders/track error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to track order" },
      { status: 500 }
    );
  }
}