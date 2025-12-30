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

    // Transform the data to match expected structure
    const transformedResumes = resumes.map((resume) => {
      const { _id, userId, ...resumeData } = resume;
      return {
        ...resumeData,
        _id: _id.toString(),
      };
    });

    return NextResponse.json({
      success: true,
      resumes: transformedResumes,
    });
  } catch (error: any) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumes", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    // Check if this is the first resume
    const resumeCount = await Resume.countDocuments({
      userId: session.user.id,
    });

    const resumeData = {
      ...body,
      userId: session.user.id,
      lastUpdated: new Date(),
      isDefault: resumeCount === 0, // First resume is default
    };

    const resume = new Resume(resumeData);
    await resume.save();

    return NextResponse.json({
      success: true,
      message: "Resume created successfully",
      data: {
        ...resume.toObject(),
        _id: resume._id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Create resume error:", error);

    // Handle duplicate default resume error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You already have a default resume" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create resume", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing resume
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const resume = await Resume.findOneAndUpdate(
      { _id, userId: session.user.id },
      {
        ...updateData,
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Resume updated successfully",
      data: {
        ...resume.toObject(),
        _id: resume._id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Update resume error:", error);
    return NextResponse.json(
      { error: "Failed to update resume", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete resume
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the resume first
    const resume = await Resume.findOne({ _id: id, userId: session.user.id });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // If deleting default resume, set another as default
    if (resume.isDefault) {
      const otherResumes = await Resume.find({
        userId: session.user.id,
        _id: { $ne: id },
      }).sort({ lastUpdated: -1 });

      if (otherResumes.length > 0) {
        await Resume.findByIdAndUpdate(otherResumes[0]._id, {
          isDefault: true,
        });
      }
    }

    // Delete the resume
    await Resume.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume", details: error.message },
      { status: 500 }
    );
  }
}
