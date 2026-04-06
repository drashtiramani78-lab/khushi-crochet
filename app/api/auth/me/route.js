import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("ME ERROR:", error);

    return NextResponse.json(
      {
        message: error?.message || "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}