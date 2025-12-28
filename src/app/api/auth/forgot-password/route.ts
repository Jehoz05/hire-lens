import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { User } from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/email/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        },
      }
    );

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}