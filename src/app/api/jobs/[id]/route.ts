import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";
import {User} from "@/lib/models/User";

// ✅ FIX: Await params in the function signature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // ✅ FIX: Await the params promise
    const { id: jobId } = await params;
    const session = await getServerSession();

    console.log("🔍 API Route - Job ID:", jobId);

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Find the job
    const job = await Job.findById(jobId).populate(
      "recruiter",
      "firstName lastName email company"
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check permissions
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });

      // If user is not the recruiter who posted the job, check if job is active
      if (
        user?.role === "recruiter" &&
        job.recruiter._id.toString() !== user._id.toString()
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // If user is candidate, only show active jobs
      if (user?.role === "candidate" && !job.isActive) {
        return NextResponse.json(
          { error: "Job is not available" },
          { status: 404 }
        );
      }
    } else {
      // Public user, only show active jobs
      if (!job.isActive) {
        return NextResponse.json(
          { error: "Job is not available" },
          { status: 404 }
        );
      }
    }

    // Increment view count
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    console.error("Get job by ID error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

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

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ FIX: Await the params promise
    const { id: jobId } = await params;
    const body = await request.json();

    // Find the job and verify ownership
    const job = await Job.findOne({
      _id: jobId,
      recruiter: user._id,
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or access denied" },
        { status: 404 }
      );
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    });
  } catch (error: any) {
    console.error("Update job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ FIX: Await the params promise
    const { id: jobId } = await params;

    // Find the job and verify ownership
    const job = await Job.findOne({
      _id: jobId,
      recruiter: user._id,
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
