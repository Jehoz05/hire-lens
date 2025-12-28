import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";
import { sendApplicationConfirmation } from "@/lib/email/emailService";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const jobId = searchParams.get("jobId");

    const skip = (page - 1) * limit;

    const user = await User.findOne({ email: session.user.email });

    let query: any = {};

    if (user?.role === "candidate") {
      query.candidate = user._id;
    } else if (user?.role === "recruiter") {
      // Get jobs posted by this recruiter
      const jobs = await Job.find({ recruiter: user._id }).select("_id");
      const jobIds = jobs.map((job) => job._id);
      query.job = { $in: jobIds };
    }

    if (status) {
      query.status = status;
    }

    if (jobId) {
      query.job = jobId;
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate("job", "title company")
        .populate("candidate", "firstName lastName email")
        .populate("resume", "originalFileName")
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

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (user?.role !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can apply for jobs" },
        { status: 403 }
      );
    }

    const { jobId, resumeId, coverLetter } = await request.json();

    if (!jobId || !resumeId) {
      return NextResponse.json(
        { error: "Job ID and Resume ID are required" },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await Job.findOne({ _id: jobId, isActive: true });
    if (!job) {
      return NextResponse.json(
        { error: "Job not found or no longer active" },
        { status: 404 }
      );
    }

    // Check if resume belongs to user
    const resume = await Resume.findOne({ _id: resumeId, user: user._id });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
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

    // Calculate match score (simplified - in reality use AI)
    const jobSkills = job.skills || [];
    const resumeSkills = resume.parsedData?.structuredData?.skills || [];
    const matchScore = calculateMatchScore(jobSkills, resumeSkills);

    // Create application
    const application = await Application.create({
      job: jobId,
      candidate: user._id,
      resume: resumeId,
      coverLetter: coverLetter || "",
      matchingScore: matchScore,
    });

    // Increment application count on job
    await Job.updateOne({ _id: jobId }, { $inc: { applications: 1 } });

    // Send confirmation email
    await sendApplicationConfirmation(user.email, job.title);

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

function calculateMatchScore(
  jobSkills: string[],
  resumeSkills: string[]
): number {
  if (jobSkills.length === 0) return 0;

  const matchedSkills = resumeSkills.filter((skill) =>
    jobSkills.some(
      (jobSkill) =>
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}
