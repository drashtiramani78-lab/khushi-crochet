import { connectDB } from '@/lib/mongodb';
import Review from '@/models/review';
import Product from '@/models/product';
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
    
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') || 'pending').toLowerCase();

    const query = {};
    if (status !== "all") {
      query.status = status;
    }

    const reviews = await Review.find(query)
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
    await verifyAdmin();
    
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
    await verifyAdmin();
    
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
