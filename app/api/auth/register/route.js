import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { createToken } from "@/lib/auth";
import { sendRegistrationConfirmation } from "@/lib/notifications";
import {
  checkAndLimitRequest,
  RATE_LIMIT_PRESETS,
} from "@/lib/rateLimitHelper";
import {
  sanitizeRequestBodyAuto,
  checkXSSThreats,
} from "@/lib/sanitization";

export async function POST(req) {
  // Apply rate limiting: 5 attempts per 15 minutes
  const rateLimitResponse = checkAndLimitRequest(
    req,
    "/api/auth/register",
    RATE_LIMIT_PRESETS.AUTH
  );

  if (rateLimitResponse) return rateLimitResponse;

  try {
    await connectDB();

    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck?.hasThreat) {
      console.warn(
        "[XSS ALERT] Registration attempt detected XSS patterns:",
        xssCheck.threats
      );
    }

    // Sanitize input (except password)
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["name"],
      emailFields: ["email"],
      phoneFields: ["phone"],
    });

    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Validate password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone?.trim() || "",
      role: "user",
      confirmationEmailSent: false,
      confirmationSmsSent: false,
      confirmationWhatsappSent: false,
    });

    // Do not let notification failure break registration
    let confirmationResult = {
      emailSent: false,
      smsSent: false,
      whatsappSent: false,
    };

    try {
      confirmationResult = await sendRegistrationConfirmation(user);

      user.confirmationEmailSent = !!confirmationResult.emailSent;
      user.confirmationSmsSent = !!confirmationResult.smsSent;
      user.confirmationWhatsappSent = !!confirmationResult.whatsappSent;
      await user.save();
    } catch (notificationError) {
      console.error("REGISTRATION NOTIFICATION ERROR:", notificationError);
    }

    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message:
          "Registration successful! Your account has been created.",
        confirmationStatus: {
          emailSent: confirmationResult.emailSent,
          smsSent: confirmationResult.smsSent,
          whatsappSent: confirmationResult.whatsappSent,
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
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
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        message: error?.message || "Registration failed",
      },
      { status: 500 }
    );
  }
}