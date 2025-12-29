import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { User } from "@/lib/models/User";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";

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

    const { id: candidateId } = await params;
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get candidate
    const candidate = await User.findById(candidateId)
      .select(
        "-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpires"
      )
      .lean();

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Get candidate's resume
    const resume = await Resume.findOne({ user: candidateId, isPrimary: true })
      .select("originalFileName fileUrl parsedData aiSuggestions")
      .lean();

    // Get candidate's applications for jobs posted by this recruiter
    const jobs = await Job.find({ recruiter: user._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      candidate: candidateId,
      job: { $in: jobIds },
    })
      .populate({
        path: "job",
        select: "title company",
      })
      .select("status appliedAt matchingScore")
      .lean();

    // Check if candidate is in recruiter's favorites
    // You'll need to add a favorites field to the User model or create a separate collection
    const isFavorite = false; // Implement your favorite logic here

    const responseData = {
      ...candidate,
      resume: resume || null,
      applications: applications || [],
      isFavorite,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error("Get candidate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
