import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken } from '@/lib/auth';
import bcryptjs from 'bcryptjs';
import { sanitizeRequestBodyAuto, checkXSSThreats } from '@/lib/sanitization';

// Password validation regex - requires 8 chars, uppercase, lowercase, number, and special char
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req) {
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
      console.warn("[XSS ALERT] Change password attempt detected XSS patterns:", xssCheck.threats);
    }

    // Sanitize input (passwords should not be HTML sanitized, but still checked for XSS)
    body = sanitizeRequestBodyAuto(body, {
      strictFields: ["currentPassword", "newPassword"],
    });

    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be at least 8 characters and contain uppercase, lowercase, number, and special character (@$!%*?&)'
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
