import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/category";
import { sanitizeRequestBodyAuto, checkXSSThreats } from "@/lib/sanitization";

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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Category creation attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["name", "slug"],
      textFields: ["description", "image"],
    });

    const { name, description, image } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await Category.findOne({
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400 }
      );
    }

    const category = new Category({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      image: image || "",
    });

    await category.save();

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create category",
      },
      { status: 500 }
    );
  }
}
