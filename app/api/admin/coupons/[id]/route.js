import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/coupon";
import { cookies } from "next/headers";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  return adminAuth === "true";
}

export async function PUT(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...body, validFrom: new Date(body.validFrom), validTill: new Date(body.validTill) },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
