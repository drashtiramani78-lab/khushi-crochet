import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/coupon";
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
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const coupons = await Coupon.find({}).sort({ validTill: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    
    // Validate and sanitize input
    const validFromStr = body.validFrom;
    const validTillStr = body.validTill;
    const validFrom = new Date(`${validFromStr}T00:00:00Z`);
    const validTill = new Date(`${validTillStr}T00:00:00Z`);
    
    if (isNaN(validFrom) || isNaN(validTill)) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }
    
    if (validTill <= validFrom) {
      return NextResponse.json(
        { success: false, error: "Valid till date must be after valid from date" },
        { status: 400 }
      );
    }
    
    if (!body.code?.trim()) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }
    
    // Check duplicate code
    const existing = await Coupon.findOne({ code: body.code.toUpperCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 409 }
      );
    }
    
    const couponData = {
      ...body,
      code: body.code.toUpperCase().trim(),
      validFrom,
      validTill,
      discountValue: parseFloat(body.discountValue) || 0,
      minOrderAmount: parseFloat(body.minOrderAmount) || 0,
      maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
      perUserLimit: parseInt(body.perUserLimit) || 1,
      isActive: Boolean(body.isActive)
    };
    
    const coupon = new Coupon(couponData);
    await coupon.save();

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return NextResponse.json(
        { success: false, error: `Validation failed: ${errors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 400 }
    );
  }
}

