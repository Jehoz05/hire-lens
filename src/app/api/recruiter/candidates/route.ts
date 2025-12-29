import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { User } from "@/lib/models/User";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";

export async function GET(request: NextRequest) {
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

    // Get all jobs posted by this recruiter
    const jobs = await Job.find({ recruiter: user._id }).select("_id title");

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No jobs posted yet",
      });
    }

    const jobIds = jobs.map((job) => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: "candidate",
        select:
          "firstName lastName email phone location title skills experience education",
      })
      .populate({
        path: "job",
        select: "title",
      })
      .sort({ appliedAt: -1 })
      .lean();

    // Group applications by candidate and get unique candidates
    const candidateMap = new Map();

    applications.forEach((app) => {
      const candidate = app.candidate as any;
      if (!candidate) return;

      if (!candidateMap.has(candidate._id.toString())) {
        candidateMap.set(candidate._id.toString(), {
          _id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          title: candidate.title,
          skills: candidate.skills || [],
          experience: candidate.experience,
          education: candidate.education,
          appliedJobs: [],
          matchScore: app.matchingScore || 0,
          lastApplied: app.appliedAt,
        });
      }

      const candidateData = candidateMap.get(candidate._id.toString());
      candidateData.appliedJobs.push({
        jobId: app.job._id,
        jobTitle: (app.job as any).title,
        appliedAt: app.appliedAt,
        status: app.status,
      });

      // Update match score to highest value
      if (app.matchingScore > candidateData.matchScore) {
        candidateData.matchScore = app.matchingScore;
      }

      // Update last applied date
      if (new Date(app.appliedAt) > new Date(candidateData.lastApplied || 0)) {
        candidateData.lastApplied = app.appliedAt;
      }
    });

    const candidates = Array.from(candidateMap.values());

    // Get resume URLs for candidates
    const candidateIds = candidates.map((c) => c._id);
    const resumes = await Resume.find({
      user: { $in: candidateIds },
      isPrimary: true,
    }).select("user fileUrl");

    const resumeMap = new Map();
    resumes.forEach((resume) => {
      resumeMap.set(resume.user.toString(), resume.fileUrl);
    });

    // Add resume URLs to candidates
    const candidatesWithResume = candidates.map((candidate) => ({
      ...candidate,
      resumeUrl: resumeMap.get(candidate._id.toString()),
    }));

    return NextResponse.json({
      success: true,
      data: candidatesWithResume,
    });
  } catch (error: any) {
    console.error("Get candidates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
