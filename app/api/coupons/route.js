import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/coupon';
import { getAuthUser } from '@/lib/auth';
import { sanitizeString, checkXSSThreats } from '@/lib/sanitization';

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    let code = searchParams.get('code');
    
    if (code) {
      // Sanitize code input
      code = sanitizeString(code, { strict: true });
      
      const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTill: { $gte: new Date() }
      });
      
      if (!coupon) {
        return Response.json(
          { success: false, error: 'Invalid or expired coupon' },
          { status: 404 }
        );
      }
      
      return Response.json({ success: true, data: coupon });
    }
    
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validTill: { $gte: new Date() }
    }).limit(10);
    
    return Response.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    const userPayload = await getAuthUser();
    if (!userPayload) {
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    const userId = userPayload.id;
    
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Coupon application attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize code
    body.code = sanitizeString(body.code, { strict: true });

    const { code, cartTotal, items } = body;
    
    if (!code) {
      return Response.json(
        { success: false, error: 'Coupon code required' },
        { status: 400 }
      );
    }
    
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTill: { $gte: new Date() }
    });
    
    if (!coupon) {
      return Response.json(
        { success: false, error: 'Invalid or expired coupon' },
        { status: 404 }
      );
    }
    
    // Check minimum order amount
    if (cartTotal < coupon.minOrderAmount) {
      return Response.json(
        { success: false, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
        { status: 400 }
      );
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return Response.json(
        { success: false, error: 'Coupon usage limit reached' },
        { status: 400 }
      );
    }
    
    // Check per-user limit
    const userUsage = coupon.usedBy.find(u => u.userId.toString() === userId);
    if (userUsage && userUsage.usedCount >= coupon.perUserLimit) {
      return Response.json(
        { success: false, error: 'You have already used this coupon' },
        { status: 400 }
      );
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }
    
    // ========== UPDATE USAGE TRACKING ==========
    coupon.usageCount += 1;
    
    // Update or add user to usedBy array
    const userUsageIndex = coupon.usedBy.findIndex(u => u.userId.toString() === userId);
    if (userUsageIndex > -1) {
      coupon.usedBy[userUsageIndex].usedCount += 1;
    } else {
      coupon.usedBy.push({
        userId,
        usedCount: 1
      });
    }
    
    await coupon.save();
    // ==========================================
    
    return Response.json({
      success: true,
      data: {
        couponCode: coupon.code,
        discount: Math.round(discount * 100) / 100,
        finalTotal: Math.round((cartTotal - discount) * 100) / 100,
      }
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

