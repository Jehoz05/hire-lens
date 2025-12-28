import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: '',
          resetPasswordExpires: '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}