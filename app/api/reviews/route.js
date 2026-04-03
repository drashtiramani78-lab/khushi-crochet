import { connectDB } from '@/lib/mongodb';
import Review from '@/models/review';
import User from '@/models/user';
import Product from '@/models/product';
import { jwtVerify } from 'jose';
import { getJoseSecret } from '@/lib/auth';
import { sanitizeRequestBodyAuto, checkXSSThreats } from '@/lib/sanitization';

const secret = getJoseSecret();

export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'approved';
    
    const query = {};
    if (productId) query.productId = productId;
    if (status) query.status = status;
    
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    return Response.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const verified = await jwtVerify(token, secret);
    const userId = verified.payload.userId;
    
    let body = await req.json();

    // Check for XSS threats and log them
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Review submission contains potential XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["title", "comment"],
      numberFields: { rating: { min: 1, max: 5 } },
    });

    const { productId, rating, title, comment } = body;
    
    if (!productId || !rating || !title || !comment) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return Response.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return Response.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return Response.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    
    const review = new Review({
      productId,
      userId,
      userName: user.name,
      userEmail: user.email,
      rating,
      title,
      comment,
      verified: true, // Mark as verified since user is authenticated
    });
    
    await review.save();
    
    // Update product rating average
    const reviews = await Review.find({ productId, status: 'approved' });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { 
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length 
    });
    
    return Response.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
