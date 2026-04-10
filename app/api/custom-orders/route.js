import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/customorders";
import { NextResponse } from "next/server";
import { sendCustomOrderConfirmation } from "@/lib/notifications";
import { getAuthUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { sanitizeRequestBodyAuto, checkXSSThreats } from "@/lib/sanitization";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === "true";
}

function normalizeValue(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

export async function GET() {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await CustomOrder.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/custom-orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch custom orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Check if user is authenticated
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please login to place a custom order"
        },
        { status: 401 }
      );
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let payload = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const imageFile = formData.get("referenceImage") || formData.get("image");

      // Build object for sanitization
      const formObject = {
        name: normalizeValue(
          formData.get("name"),
          formData.get("customerName"),
          formData.get("fullName")
        ),
        email: normalizeValue(formData.get("email")),
        phone: normalizeValue(
          formData.get("phone"),
          formData.get("mobile"),
          formData.get("contact")
        ),
        productType: normalizeValue(
          formData.get("productType"),
          formData.get("product"),
          formData.get("orderType"),
          formData.get("type")
        ),
        colorTheme: normalizeValue(
          formData.get("colorTheme"),
          formData.get("color"),
          formData.get("theme")
        ),
        budget: normalizeValue(
          formData.get("budget"),
          formData.get("price"),
          formData.get("amount"),
          formData.get("priceRange")
        ),
        deadline: normalizeValue(
          formData.get("deadline"),
          formData.get("date"),
          formData.get("requiredDate")
        ),
        subject: normalizeValue(
          formData.get("subject"),
          formData.get("title")
        ),
        message: normalizeValue(
          formData.get("message"),
          formData.get("description"),
          formData.get("details")
        ),
      };

      // Check for XSS threats
      const xssCheck = checkXSSThreats(formObject);
      if (xssCheck.hasThreat) {
        console.warn("[XSS ALERT] Custom order submission contains potential XSS patterns:", xssCheck.threats);
      }

      // Sanitize input
      const sanitized = sanitizeRequestBodyAuto(formObject, {
        strictFields: ["name", "email", "phone", "productType", "colorTheme", "subject", "message"],
        emailFields: ["email"],
        phoneFields: ["phone"],
      });

      payload = {
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        productType: sanitized.productType,
        colorTheme: sanitized.colorTheme,
        budget: sanitized.budget,
        deadline: sanitized.deadline,
        subject: sanitized.subject,
        message: sanitized.message,
        referenceImage: "",
        status: "Pending",
        userId: authUser._id,
      };

      // Upload reference image (optional) to Cloudinary if available
      if (imageFile && typeof imageFile === "object" && "arrayBuffer" in imageFile && imageFile.size > 0) {
        const hasCloudinary =
          !!process.env.CLOUDINARY_CLOUD_NAME &&
          !!process.env.CLOUDINARY_API_KEY &&
          !!process.env.CLOUDINARY_API_SECRET;

        if (hasCloudinary) {
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadRes = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ folder: "custom-orders" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              })
              .end(buffer);
          });

          payload.referenceImage = uploadRes?.secure_url || "";
        }
      } else {
        // If client sends a URL string instead of a file
        payload.referenceImage = normalizeValue(formData.get("referenceImage"), formData.get("image"));
      }
    } else {
      let body = await req.json();

      // Check for XSS threats
      const xssCheck = checkXSSThreats(body);
      if (xssCheck.hasThreat) {
        console.warn("[XSS ALERT] Custom order submission contains potential XSS patterns:", xssCheck.threats);
      }

      // Sanitize input
      body = sanitizeRequestBodyAuto(body, {
        strictFields: ["name", "email", "phone", "productType", "colorTheme", "subject", "message"],
        emailFields: ["email"],
        phoneFields: ["phone"],
      });

      payload = {
        name: normalizeValue(body.name, body.customerName, body.fullName),
        email: normalizeValue(body.email),
        phone: normalizeValue(body.phone, body.mobile, body.contact),
        productType: normalizeValue(
          body.productType,
          body.product,
          body.orderType,
          body.type
        ),
        colorTheme: normalizeValue(body.colorTheme, body.color, body.theme),
        budget: normalizeValue(
          body.budget,
          body.price,
          body.amount,
          body.priceRange
        ),
        deadline: normalizeValue(body.deadline, body.date, body.requiredDate),
        subject: normalizeValue(body.subject, body.title),
        message: normalizeValue(
          body.message,
          body.description,
          body.details
        ),
        referenceImage: normalizeValue(body.referenceImage, body.image),
        status: normalizeValue(body.status) || "Pending",
        userId: authUser._id,
      };
    }

    const newOrder = await CustomOrder.create(payload);

    // Send custom order confirmations (email, SMS, WhatsApp)
    try {
      await sendCustomOrderConfirmation(newOrder);
    } catch (confirmationError) {
      console.error("Error sending custom order confirmation:", confirmationError);
      // Don't fail the order creation if confirmation fails
    }

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/custom-orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create custom order",
      },
      { status: 500 }
    );
  }
}