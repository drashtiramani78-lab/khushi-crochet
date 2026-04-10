import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/category";
import { cookies } from "next/headers";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  return adminAuth === "true";
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch category",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { name, description, image, isActive } = body;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: description || "",
        image: image || "",
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update category",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete category",
      },
      { status: 500 }
    );
  }
}
