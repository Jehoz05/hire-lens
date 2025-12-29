import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { User } from "@/lib/models/User";
import { Application } from "@/lib/models/Application";
import { Job } from "@/lib/models/Job";
import { Resume } from "@/lib/models/Resume";
import { format, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get candidate's applications
    const applications = await Application.find({ candidate: user._id })
      .populate({
        path: "job",
        select: "title company",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .sort({ appliedAt: -1 })
      .lean();

    // Calculate stats
    const totalApplications = applications.length;
    const activeApplications = applications.filter((app) =>
      ["applied", "reviewed", "shortlisted", "interview", "pending"].includes(
        app.status
      )
    ).length;
    const interviewsScheduled = applications.filter(
      (app) => app.status === "interview"
    ).length;
    const jobOffers = applications.filter((app) =>
      ["offered", "hired"].includes(app.status)
    ).length;

    // Calculate profile completion
    const profileFields = [
      "firstName",
      "lastName",
      "title",
      "location",
      "skills",
      "bio",
    ];
    const filledFields = profileFields.filter((field) => {
      const value = user[field as keyof typeof user];
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0)
      );
    }).length;
    const profileCompletion = Math.round(
      (filledFields / profileFields.length) * 100
    );

    // Calculate resume score
    const resume = await Resume.findOne({ user: user._id, isPrimary: true });
    let resumeScore = 0;
    if (resume?.parsedData?.skills?.length) {
      resumeScore = Math.min(100, resume.parsedData.skills.length * 10);
    }

    // Application status breakdown
    const applicationStats = [
      {
        status: "Applied",
        count: applications.filter((app) =>
          ["applied", "pending"].includes(app.status)
        ).length,
      },
      {
        status: "Reviewed",
        count: applications.filter((app) => app.status === "reviewed").length,
      },
      {
        status: "Shortlisted",
        count: applications.filter((app) => app.status === "shortlisted")
          .length,
      },
      { status: "Interview", count: interviewsScheduled },
      {
        status: "Rejected",
        count: applications.filter((app) => app.status === "rejected").length,
      },
      {
        status: "Hired",
        count: applications.filter((app) => app.status === "hired").length,
      },
    ];

    // Monthly activity for last 6 months
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = subMonths(new Date(), i);
      const monthEnd = subMonths(new Date(), i - 1);
      const monthApplications = applications.filter(
        (app) =>
          new Date(app.appliedAt) >= monthStart &&
          new Date(app.appliedAt) < monthEnd
      );

      monthlyActivity.push({
        month: format(monthStart, "MMM"),
        applications: monthApplications.length,
        interviews: monthApplications.filter(
          (app) => app.status === "interview"
        ).length,
      });
    }

    // Get recent applications (last 5)
    const recentApplications = applications.slice(0, 5).map((app) => ({
      _id: app._id,
      job: {
        _id: app.job?._id || "",
        title: app.job?.title || "",
        company: {
          name: app.job?.company?.name || "",
        },
      },
      status: app.status,
      appliedAt: app.appliedAt,
      matchingScore: app.matchingScore || 0,
    }));

    // Get recommended jobs based on skills
    const userSkills = user.skills || [];
    let recommendedJobs: any = [];

    if (userSkills.length > 0) {
      const jobs = await Job.find({
        isPublished: true,
        isActive: true,
        status: "published",
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      })
        .populate("company", "name")
        .lean();

      // Calculate match score for each job - FIXED TYPE ERROR
      recommendedJobs = jobs
        .map((job) => {
          const jobSkills = job.skills || [];
          const commonSkills = userSkills.filter((skill: string) =>
            jobSkills.some(
              (js: string) =>
                js.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(js.toLowerCase())
            )
          );
          const matchingScore =
            jobSkills.length > 0
              ? Math.round((commonSkills.length / jobSkills.length) * 100)
              : 0;

          return {
            _id: job._id,
            title: job.title,
            company: { name: job.company?.name || "" },
            location: job.location,
            matchingScore,
            salary: job.salary,
          };
        })
        .sort((a: any, b: any) => b.matchingScore - a.matchingScore)
        .slice(0, 5);
    }

    const dashboardData = {
      totalApplications,
      activeApplications,
      interviewsScheduled,
      jobOffers,
      profileCompletion,
      resumeScore,
      applicationStats,
      monthlyActivity,
      recentApplications,
      recommendedJobs,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error("Get candidate dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
