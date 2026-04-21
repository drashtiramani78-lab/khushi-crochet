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

    const validFromStr = body.validFrom;
    const validTillStr = body.validTill;
    const validFrom = new Date(`${validFromStr}T00:00:00Z`);
    const validTill = new Date(`${validTillStr}T00:00:00Z`);
    
    console.log('Parsed coupon dates - from:', validFrom.toISOString(), 'till:', validTill.toISOString());
    
    if (isNaN(validFrom) || isNaN(validTill) || validTill <= validFrom) {
      return NextResponse.json(
        { success: false, error: "Invalid dates: Valid till must be after valid from" },
        { status: 400 }
      );
    }

    const couponData = {
      ...body,
      validFrom,
      validTill,
      discountValue: parseFloat(body.discountValue) || 0,
      minOrderAmount: parseFloat(body.minOrderAmount) || 0,
      maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
      perUserLimit: parseInt(body.perUserLimit) || 1,
      isActive: Boolean(body.isActive)
    };

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      couponData,
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
    
    console.error('PUT Coupon Error:', error.name, error.message);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon ID' },
        { status: 404 }
      );
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors);
      let errorMsg = 'Validation failed: ';
      
      const dateErrors = [];
      if (errors.find(e => e.path === 'validFrom')) dateErrors.push('Valid from date invalid');
      if (errors.find(e => e.path === 'validTill')) dateErrors.push('Valid till date invalid');
      if (errors.find(e => e.path === 'validTill' && e.message.includes('valid from'))) dateErrors.push('Valid till must be after valid from');
      
      if (dateErrors.length > 0) {
        errorMsg += dateErrors.join(', ');
      } else {
        errorMsg += errors.map(e => e.message).join(', ');
      }
      
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
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
    console.error('DELETE Coupon Error:', error.name, error.message);
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon ID' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
