import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { checkAndLimitRequest, RATE_LIMIT_PRESETS } from "@/lib/rateLimitHelper";

export async function POST(req) {
  // Apply rate limiting: 5 attempts per 15 minutes
  const rateLimitResponse = checkAndLimitRequest(req, "/api/admin-login", RATE_LIMIT_PRESETS.ADMIN_LOGIN);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { username, password } = body || {};

    // Validate input - username defaults to "admin" if not provided (backward compatibility)
    const adminUsername = username || "admin";
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find admin by username
    const admin = await Admin.findOne({ username: adminUsername }).select("+password");

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is locked. Try again later.",
        },
        { status: 429 }
      );
    }

    // Check if account is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is inactive" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }

    // Reset login attempts and update lastLogin
    await admin.resetLoginAttempts();

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });

    response.cookies.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Also set admin_username for reference
    response.cookies.set("admin_username", admin.username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}