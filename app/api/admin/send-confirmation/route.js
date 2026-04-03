import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import {
  sendConfirmationEmail,
  sendConfirmationSMS,
  sendConfirmationWhatsApp,
} from "@/lib/notifications";
import { cookies } from "next/headers";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === "true";
}

export async function POST(request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, type } = await request.json();

    if (!userId || !type) {
      return NextResponse.json(
        { message: "Missing userId or type" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let result = { success: false };

    if (type === "email") {
      result = await sendConfirmationEmail(user);
    } else if (type === "sms") {
      if (!user.phone) {
        return NextResponse.json(
          { message: "User has no phone number" },
          { status: 400 }
        );
      }
      result = await sendConfirmationSMS(user.phone, user.name);
    } else if (type === "whatsapp") {
      if (!user.phone) {
        return NextResponse.json(
          { message: "User has no phone number" },
          { status: 400 }
        );
      }
      result = await sendConfirmationWhatsApp(user.phone, user.name);
    } else if (type === "all") {
      const emailResult = await sendConfirmationEmail(user);
      let smsResult = { success: true };
      let whatsappResult = { success: true };

      if (user.phone) {
        smsResult = await sendConfirmationSMS(user.phone, user.name);
        whatsappResult = await sendConfirmationWhatsApp(user.phone, user.name);
      }

      result = {
        success:
          emailResult.success && smsResult.success && whatsappResult.success,
        emailSent: emailResult.success,
        smsSent: smsResult.success,
        whatsappSent: whatsappResult.success,
        errors: {
          email: emailResult.error,
          sms: smsResult.error,
          whatsapp: whatsappResult.error,
        },
      };
    } else {
      return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Send confirmation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send confirmation" },
      { status: 500 }
    );
  }
}
