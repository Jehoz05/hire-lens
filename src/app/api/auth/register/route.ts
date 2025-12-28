import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { User } from '@/lib/models/User';
import { sendVerificationEmail } from '@/lib/email/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, firstName, lastName, role, company, title } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      company: company || '',
      title: title || '',
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.verificationTokenExpiry;

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}