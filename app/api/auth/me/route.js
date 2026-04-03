import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // ONLY check for regular user authentication (NOT admin)
    // This endpoint is for user section only
    await connectDB();
    const token = cookieStore.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("ME ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}