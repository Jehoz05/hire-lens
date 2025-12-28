import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sendEmail } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { to, subject, html, text } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For security, only allow sending to specific domains or validate
    // that the user has permission to send to these recipients

    await sendEmail({
      to,
      subject,
      html,
      text,
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}