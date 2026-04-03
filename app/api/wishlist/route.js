import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/wishlist';
import Product from '@/models/product';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const wishlist = await Wishlist.find({ userId: authUser.id }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: authUser.id, productId });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Already in wishlist' },
        { status: 400 }
      );
    }
    
    const wishlistItem = new Wishlist({
      userId: authUser.id,
      productId,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
    });
    
    await wishlistItem.save();
    
    return NextResponse.json({ success: true, data: wishlistItem }, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Get authenticated user
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const { productId } = body;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    await Wishlist.deleteOne({ userId: authUser.id, productId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
