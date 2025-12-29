// app/api/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";

// GET - Get user's resumes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const resumes = await Resume.find({ userId: session.user.id })
      .sort({ isDefault: -1, lastUpdated: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: resumes,
    });
  } catch (error: any) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { _id, ...resumeData } = body;

    await connectDB();

    let resume;

    if (_id) {
      // Update existing resume
      resume = await Resume.findOneAndUpdate(
        { _id, userId: session.user.id },
        {
          ...resumeData,
          lastUpdated: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new resume
      resume = new Resume({
        ...resumeData,
        userId: session.user.id,
        lastUpdated: new Date(),
      });

      // If this is the first resume, set as default
      const resumeCount = await Resume.countDocuments({
        userId: session.user.id,
      });
      if (resumeCount === 0) {
        resume.isDefault = true;
      }

      await resume.save();
    }

    return NextResponse.json({
      success: true,
      message: _id
        ? "Resume updated successfully"
        : "Resume created successfully",
      data: resume,
    });
  } catch (error: any) {
    console.error("Save resume error:", error);
    return NextResponse.json(
      { error: "Failed to save resume", details: error.message },
      { status: 500 }
    );
  }
}
