import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get("admin_auth")?.value;

    if (adminAuth === "true") {
      return NextResponse.json(
        {
          user: {
            id: "admin",
            name: "Admin",
            role: "admin",
            email: "admin@khushi-crochet.local",
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ user: null }, { status: 200 });
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
