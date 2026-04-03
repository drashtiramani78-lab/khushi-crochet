import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/customorders";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function PATCH(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Custom Order ID is required" },
        { status: 400 }
      );
    }

    // Generate unique tracking ID
    const trackingId = `KHSC-${Date.now()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const updatedOrder = await CustomOrder.findByIdAndUpdate(
      id,
      { trackingId },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { message: "Custom Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Tracking ID generated successfully",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/custom-orders/generate-tracking/[id] error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
