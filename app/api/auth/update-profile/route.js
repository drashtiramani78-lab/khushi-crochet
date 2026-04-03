import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/lib/auth';
import { sanitizeRequestBodyAuto, checkXSSThreats, sanitizePhone } from '@/lib/sanitization';

export async function PUT(req) {
  try {
    await connectDB();

    let token = req.headers.get('authorization')?.split(' ')[1];
    
    // Fallback to cookie if Authorization header not provided
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('user_token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.id;
    let body = await req.json();

    // Check for XSS threats
    const xssCheck = checkXSSThreats(body);
    if (xssCheck.hasThreat) {
      console.warn("[XSS ALERT] Update profile attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["name"],
      phoneFields: ["phone"],
    });

    const { name, phone } = body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
