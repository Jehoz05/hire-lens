import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";

// GET single resume by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession();
    const { id: resumeId } = await params;

    // Find resume
    const resume = await Resume.findById(resumeId).populate(
      "user",
      "firstName lastName email"
    );

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check permissions
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });

      if (user) {
        // User can see their own resume
        if (resume.user._id.toString() === user._id.toString()) {
          return NextResponse.json({
            success: true,
            data: resume,
          });
        }

        // Recruiter can see resumes for applications
        if (user.role === "recruiter") {
          // You might want to add additional checks here
          // For example, check if recruiter has an active application with this resume
          return NextResponse.json({
            success: true,
            data: resume,
          });
        }
      }
    }

    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  } catch (error: any) {
    console.error("Get resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE resume (mark as primary, update parsed data)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const user = await User.findOne({ email: session.user.email });
    const body = await request.json();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check ownership
    if (resume.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updateData: any = {};

    // Mark as primary
    if (body.isPrimary === true) {
      // Set all other resumes to non-primary
      await Resume.updateMany(
        { user: user._id, _id: { $ne: resumeId } },
        { $set: { isPrimary: false } }
      );
      updateData.isPrimary = true;
    }

    // Update parsed data (user can edit AI suggestions)
    if (body.parsedData) {
      updateData.parsedData = {
        ...resume.parsedData,
        ...body.parsedData,
      };
    }

    // Add AI suggestions
    if (body.aiSuggestion) {
      updateData.$push = {
        aiSuggestions: {
          ...body.aiSuggestion,
          generatedDate: new Date(),
        },
      };
    }

    const updatedResume = await Resume.findByIdAndUpdate(resumeId, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      data: updatedResume,
      message: "Resume updated successfully",
    });
  } catch (error: any) {
    console.error("Update resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: resumeId } = await params;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find resume
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check ownership
    if (resume.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Don't allow deletion if it's the only resume
    const resumeCount = await Resume.countDocuments({ user: user._id });
    if (resumeCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete your only resume" },
        { status: 400 }
      );
    }

    // If deleting primary resume, set another as primary
    if (resume.isPrimary) {
      const anotherResume = await Resume.findOne({
        user: user._id,
        _id: { $ne: resumeId },
      });

      if (anotherResume) {
        await Resume.findByIdAndUpdate(anotherResume._id, {
          $set: { isPrimary: true },
        });
      }
    }

    // Delete resume
    await Resume.findByIdAndDelete(resumeId);

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
