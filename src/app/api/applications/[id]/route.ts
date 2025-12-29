import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";
import { sendShortlistedEmail } from "@/lib/email/emailService";

// GET single application by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find application
    const application = await Application.findById(applicationId)
      .populate("job", "title company location")
      .populate("candidate", "firstName lastName email avatar")
      .populate("resume", "originalFileName fileUrl parsedData");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role === "recruiter") {
      // Recruiter can only see applications for their jobs
      const job = await Job.findById(application.job);
      if (job.recruiter.toString() !== user._id.toString()) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (user.role === "candidate") {
      // Candidate can only see their own applications
      if (application.candidate._id.toString() !== user._id.toString()) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error: any) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE application status
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

    const { id: applicationId } = await params;
    const user = await User.findOne({ email: session.user.email });
    const body = await request.json();

    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find application
    const application = await Application.findById(applicationId)
      .populate("job")
      .populate("candidate");

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if job belongs to recruiter
    const job = await Job.findById(application.job);
    if (job.recruiter.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update application
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
      updateData.reviewedAt = new Date();

      // If status changed to shortlisted, send email
      if (
        body.status === "shortlisted" &&
        application.status !== "shortlisted"
      ) {
        try {
          await sendShortlistedEmail(
            application.candidate.email,
            job.title,
            job.company.name
          );
        } catch (emailError) {
          console.error("Failed to send shortlisted email:", emailError);
          // Don't fail the request if email fails
        }
      }
    }

    if (body.recruiterNotes !== undefined) {
      updateData.recruiterNotes = body.recruiterNotes;
    }

    if (body.interviewSchedule) {
      updateData.interviewSchedule = body.interviewSchedule;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: "Application updated successfully",
    });
  } catch (error: any) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE application (candidate can withdraw)
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

    const { id: applicationId } = await params;
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find application
    const application = await Application.findById(applicationId);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check permissions - only candidate can delete their own application
    if (application.candidate.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete application
    await Application.findByIdAndDelete(applicationId);

    // Decrement job applications count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applications: -1 },
    });

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
