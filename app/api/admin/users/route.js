import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { cookies } from "next/headers";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  return adminAuth === "true";
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "userOrders"
        }
      },
      {
        $addFields: {
          ordersCount: { $size: "$userOrders" }
        }
      },
      {
        $lookup: {
          from: "customorders",
          localField: "_id",
          foreignField: "userId",
          as: "userCustomOrders"
        }
      },
      {
        $addFields: {
          customOrdersCount: { $size: "$userCustomOrders" },
          totalOrdersCount: { $add: ["$ordersCount", "$customOrdersCount"] }
        }
      },
      {
        $project: {
          password: 0,
          userOrders: 0,
          userCustomOrders: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
