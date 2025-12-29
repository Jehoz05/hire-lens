import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";

// Update only application status
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
    const { status } = await request.json();

    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (
      !status ||
      !["pending", "reviewed", "shortlisted", "rejected", "hired"].includes(
        status
      )
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find application
    const application = await Application.findById(applicationId);

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

    // Update status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        $set: {
          status,
          reviewedAt: status !== "pending" ? new Date() : undefined,
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("Update application status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
