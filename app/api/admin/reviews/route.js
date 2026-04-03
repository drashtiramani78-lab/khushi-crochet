import { connectDB } from '@/lib/mongodb';
import Review from '@/models/review';
import Product from '@/models/product';
import { jwtVerify } from 'jose';
import { getJoseSecret } from '@/lib/auth';
import { sanitizeRequestBodyAuto, checkXSSThreats } from '@/lib/sanitization';

const secret = getJoseSecret();

async function verifyAdmin(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) throw new Error('Not authenticated');
  
  const verified = await jwtVerify(token, secret);
  if (verified.payload.role !== 'admin') {
    throw new Error('Not authorized');
  }
  
  return verified.payload;
}

export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    
    const reviews = await Review.find({ status })
      .sort({ createdAt: -1 })
      .limit(50);
    
    return Response.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message.includes('Not') ? 401 : 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Review status update attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      enumFields: {
        status: { allowed: ['pending', 'approved', 'rejected'], default: 'pending' }
      },
    });

    const { status } = body;
    
    if (!reviewId || !status) {
      return Response.json(
        { success: false, error: 'Review ID and status required' },
        { status: 400 }
      );
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );
    
    if (!review) {
      return Response.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Update product rating if approved
    if (status === 'approved') {
      const reviews = await Review.find({
        productId: review.productId,
        status: 'approved'
      });
      
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.productId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      });
    }
    
    return Response.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');
    
    if (!reviewId) {
      return Response.json(
        { success: false, error: 'Review ID required' },
        { status: 400 }
      );
    }
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return Response.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    await Review.findByIdAndDelete(reviewId);
    
    // Recalculate product rating
    const reviews = await Review.find({
      productId: review.productId,
      status: 'approved'
    });
    
    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }
    
    await Product.findByIdAndUpdate(review.productId, {
      rating: reviews.length > 0 ? Math.round(avgRating * 10) / 10 : 0,
      reviewCount: reviews.length
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
