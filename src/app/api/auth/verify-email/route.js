import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Verify user email
    await User.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: {
          verificationToken: '',
          verificationTokenExpiry: '',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}