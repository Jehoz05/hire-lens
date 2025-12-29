// app/api/jobs/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { Job } from "@/lib/models/Job";
import { matchResumeToJobs } from "@/lib/gemini/jobMatcher";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can use job matching" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get user's latest parsed resume
    const latestResume = await Resume.findOne({
      userId: session.user.id,
      isParsed: true,
    }).sort({ uploadDate: -1 });

    if (!latestResume) {
      return NextResponse.json(
        {
          error:
            "No parsed resume found. Please upload and parse your resume first.",
        },
        { status: 404 }
      );
    }

    // Get recent active jobs
    const recentJobs = await Job.find({
      isPublished: true,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .limit(50) // Limit to recent jobs for performance
      .sort({ createdAt: -1 })
      .select("title company description requirements skills")
      .populate("company", "name");

    if (recentJobs.length === 0) {
      return NextResponse.json(
        { data: [], message: "No jobs found to match against" },
        { status: 200 }
      );
    }

    // Prepare data for AI matching
    const resumeText = latestResume.parsedData
      ? JSON.stringify(latestResume.parsedData)
      : latestResume.extractedText || "";

    const jobDescriptions = recentJobs.map((job: any) => ({
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      skills: job.skills || [],
    }));

    // Get AI matches
    const aiMatches = await matchResumeToJobs(resumeText, jobDescriptions);

    // Combine AI results with job data
    const matches = recentJobs.map((job: any, index: number) => {
      const aiMatch = aiMatches.recommendedJobs?.[index] || {
        matchScore: 0,
        reason: "",
      };

      return {
        _id: job._id,
        title: job.title,
        company: {
          _id: job.company._id,
          name: job.company.name,
        },
        matchScore: aiMatch.matchScore || 0,
        skillsMatched: job.skills.filter((skill: string) =>
          latestResume.parsedData?.skills?.includes(skill)
        ),
        missingSkills: job.skills.filter(
          (skill: string) => !latestResume.parsedData?.skills?.includes(skill)
        ),
        suggestions: aiMatches.feedback?.suggestions || [],
        reason: aiMatch.reason || "",
      };
    });

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Filter for good matches (score > 40)
    const goodMatches = matches.filter((match) => match.matchScore > 40);

    return NextResponse.json({
      data: goodMatches.slice(0, 10), // Return top 10 matches
      totalJobs: recentJobs.length,
      totalMatches: goodMatches.length,
      resumeSkills: latestResume.parsedData?.skills || [],
      suggestions: aiMatches.feedback?.suggestions || [],
    });
  } catch (error: any) {
    console.error("Job matching error:", error);
    return NextResponse.json(
      { error: "Failed to get job matches", details: error.message },
      { status: 500 }
    );
  }
}
