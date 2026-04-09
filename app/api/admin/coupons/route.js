import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/coupon';
import { jwtVerify } from 'jose';
import { getJoseSecret } from '@/lib/auth';
import { sanitizeRequestBodyAuto, checkXSSThreats } from '@/lib/sanitization';

async function verifyAdmin(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Not authenticated');
  
  const verified = await jwtVerify(token, getJoseSecret());
  if (verified.payload.role !== 'admin') {
    throw new Error('Not authorized');
  }
  
  return verified.payload;
}

export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    
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
    await verifyAdmin(req);
    
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
