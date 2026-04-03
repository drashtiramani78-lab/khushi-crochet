import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { createToken } from "@/lib/auth";
import { checkAndLimitRequest, RATE_LIMIT_PRESETS } from "@/lib/rateLimitHelper";
import { sanitizeRequestBodyAuto, checkXSSThreats, sanitizeEmail } from "@/lib/sanitization";

export async function POST(req) {
  // Apply rate limiting: 5 attempts per 15 minutes
  const rateLimitResponse = checkAndLimitRequest(req, "/api/auth/login", RATE_LIMIT_PRESETS.AUTH);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await connectDB();

    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Login attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input (except password)
    body = sanitizeRequestBodyAuto(body, {
      emailFields: ["email"],
    });

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = createToken(user);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 200 }
    );

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}