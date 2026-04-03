import { connectDB } from "@/lib/mongodb";
import Order from "@/models/order";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch orders for the authenticated user
    const orders = await Order.find({ 
      userId: authUser.id 
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders/user error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
