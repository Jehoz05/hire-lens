import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";
import { sendApplicationConfirmation } from "@/lib/email/emailService";
import mongoose from "mongoose";

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
        .limit(limit)
        .lean(),
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

// CREATE new application - FIXED VERSION
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
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and is published
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.isPublished || !job.isActive || job.status !== "published") {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Check if job has expired
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Job application deadline has passed" },
        { status: 400 }
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

    // Get candidate's primary resume (if resumeId not provided)
    let resume;
    if (resumeId) {
      // Check if resume belongs to user
      resume = await Resume.findOne({
        _id: resumeId,
        user: user._id,
      });

      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found or access denied" },
          { status: 404 }
        );
      }
    } else {
      // Get primary resume
      resume = await Resume.findOne({
        user: user._id,
        isPrimary: true,
      });

      if (!resume) {
        return NextResponse.json(
          { error: "Please upload a resume before applying" },
          { status: 400 }
        );
      }
    }

    // Calculate match score
    const jobSkills = job.skills || [];
    const resumeSkills =
      resume.parsedData?.skills ||
      resume.parsedData?.structuredData?.skills ||
      [];
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

    // Create application with additional fields
    const applicationData: any = {
      job: jobId,
      candidate: user._id,
      resume: resume._id,
      coverLetter: coverLetter || "",
      status: "applied",
      appliedAt: new Date(),
      matchingScore,
    };

    // Add notes if provided
    if (body.notes) {
      applicationData.notes = body.notes;
    }

    // Create application with proper type handling
    const applicationDoc = await Application.create(applicationData);

    // Type guard to ensure we have a document
    if (!applicationDoc || !(applicationDoc instanceof mongoose.Document)) {
      throw new Error("Failed to create application document");
    }

    // Convert to object and get the ID safely
    const application = applicationDoc.toObject();
    const applicationId = application._id?.toString();

    if (!applicationId) {
      throw new Error("Application ID not found after creation");
    }

    // Update job applicants count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantsCount: 1 },
    });

    // Send confirmation email
    try {
      await sendApplicationConfirmation(user.email, job.title);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    // Get populated application data safely
    const populatedApplication = await Application.findById(applicationId)
      .populate("job", "title company location")
      .populate("candidate", "firstName lastName email")
      .lean();

    if (!populatedApplication) {
      throw new Error("Failed to retrieve created application");
    }

    return NextResponse.json(
      {
        success: true,
        data: populatedApplication,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update application status
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can update application status" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      );
    }

    // Check if application exists and recruiter has access
    const application = await Application.findById(applicationId).populate({
      path: "job",
      populate: {
        path: "recruiter",
        select: "_id",
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if recruiter owns the job
    const job = application.job as any;
    if (
      !job ||
      !job.recruiter ||
      job.recruiter._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: "Access denied - you don't own this job" },
        { status: 403 }
      );
    }

    // Valid statuses
    const validStatuses = [
      "applied",
      "reviewed",
      "shortlisted",
      "interview",
      "rejected",
      "hired",
      "withdrawn",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update application
    const updateData: any = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    )
      .populate("candidate", "firstName lastName email")
      .lean();

    if (!updatedApplication) {
      throw new Error("Failed to update application");
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: "Application status updated successfully",
    });
  } catch (error: any) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
