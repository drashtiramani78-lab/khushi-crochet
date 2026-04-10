import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/coupon';
import { cookies } from "next/headers";
import { sanitizeRequestBodyAuto, checkXSSThreats } from '@/lib/sanitization';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;
  if (adminAuth !== "true") {
    throw new Error("Not authorized");
  }
}

export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin();
    
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return Response.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin();
    
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Coupon creation attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["code", "description", "applicableCategories"],
      textFields: ["description"],
      numberFields: {
        discountValue: { min: 0, max: 100000 },
        minOrderAmount: { min: 0, max: 10000000 },
        maxDiscount: { min: 0, max: 10000000 },
      },
    });

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      perUserLimit,
      validFrom,
      validTill,
      applicableProducts,
      applicableCategories,
      excludeProducts,
    } = body;
    
    if (!code || !discountType || !discountValue) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return Response.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    
    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      usageLimit,
      perUserLimit: perUserLimit || 1,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      applicableProducts,
      applicableCategories,
      excludeProducts,
    });
    
    await coupon.save();
    return Response.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
