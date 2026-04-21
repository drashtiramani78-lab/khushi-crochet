import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export const revalidate = 300;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = verifyToken(token);
    console.log("DEBUG /api/auth/me: token valid, decoded.id =", decoded?.id);

    if (!decoded || !decoded.id) {
      console.log("DEBUG /api/auth/me: invalid/missing decoded.id");
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      await connectDB();
      console.log("DEBUG /api/auth/me: DB connected, fetching user", decoded.id);
      
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        console.log("DEBUG /api/auth/me: user not found for id", decoded.id);
        return NextResponse.json({ user: null }, { status: 200 });
      }

      console.log("DEBUG /api/auth/me: user fetched successfully");
      return NextResponse.json({ user }, { status: 200 });
    } catch (dbError) {
      console.error("DEBUG /api/auth/me DB ERROR:", dbError.message || dbError);
      return NextResponse.json({ user: null }, { status: 200 });
    }
  } catch (error) {
    console.error("ME ERROR (outer):", error.message || error, error.stack);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
