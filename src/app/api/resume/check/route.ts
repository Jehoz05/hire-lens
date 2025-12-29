import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";

// Check if user has a resume and get primary resume
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find user's primary resume
    const primaryResume = await Resume.findOne({
      user: user._id,
      isPrimary: true,
    });

    // Count total resumes
    const resumeCount = await Resume.countDocuments({ user: user._id });

    return NextResponse.json({
      success: true,
      data: {
        hasResume: resumeCount > 0,
        resumeCount,
        primaryResume: primaryResume || null,
      },
    });
  } catch (error: any) {
    console.error("Check resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
