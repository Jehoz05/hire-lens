import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";
import { sendApplicationConfirmation } from "@/lib/email/emailService";

// GET applications with filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const candidateId = searchParams.get("candidateId");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (jobId) {
      query.job = jobId;
    }

    if (status) {
      query.status = status;
    }

    if (candidateId) {
      query.candidate = candidateId;
    }

    // Apply user permissions
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });

      if (user) {
        if (user.role === "candidate") {
          // Candidates can only see their own applications
          query.candidate = user._id;
        } else if (user.role === "recruiter") {
          // Recruiters can only see applications for their jobs
          const recruiterJobs = await Job.find({ recruiter: user._id });
          query.job = { $in: recruiterJobs.map((job) => job._id) };
        }
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Search by candidate name or email
    if (search) {
      const candidates = await User.find({
        $or: [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
        role: "candidate",
      });
      query.candidate = { $in: candidates.map((c) => c._id) };
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job", "title company location")
        .populate("candidate", "firstName lastName email avatar")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// CREATE new application
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can apply for jobs" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobId, resumeId, coverLetter } = body;

    // Validate required fields
    if (!jobId || !resumeId) {
      return NextResponse.json(
        { error: "Job ID and Resume ID are required" },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if resume belongs to user
    const resume = await Resume.findOne({
      _id: resumeId,
      user: user._id,
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: user._id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      );
    }

    // Calculate match score
    const jobSkills = job.skills || [];
    const resumeSkills = resume.parsedData?.structuredData?.skills || [];
    let matchingScore = 0;

    if (jobSkills.length > 0 && resumeSkills.length > 0) {
      const matchedSkills = resumeSkills.filter((skill: string) =>
        jobSkills.some(
          (jobSkill: string) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      matchingScore = Math.round(
        (matchedSkills.length / jobSkills.length) * 100
      );
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: user._id,
      resume: resumeId,
      coverLetter: coverLetter || "",
      status: "pending",
      appliedAt: new Date(),
      matchingScore,
    });

    // Increment job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applications: 1 },
    });

    // Send confirmation email
    try {
      await sendApplicationConfirmation(user.email, job.title);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
