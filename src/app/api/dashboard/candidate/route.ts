import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import { Resume } from "@/lib/models/Resume";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "candidate") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get candidate's stats
    const [
      totalApplications,
      activeApplications,
      interviewsScheduled,
      jobOffers,
      recentApplications,
      primaryResume,
    ] = await Promise.all([
      Application.countDocuments({ candidate: user._id }),
      Application.countDocuments({
        candidate: user._id,
        status: { $in: ["pending", "reviewed", "shortlisted"] },
      }),
      Application.countDocuments({
        candidate: user._id,
        status: "shortlisted",
        "interviewSchedule.date": { $gte: new Date() },
      }),
      Application.countDocuments({ candidate: user._id, status: "hired" }),
      Application.find({ candidate: user._id })
        .populate("job", "title company location")
        .sort({ appliedAt: -1 })
        .limit(5),
      Resume.findOne({ user: user._id, isPrimary: true }),
    ]);

    // Calculate profile completion
    let profileCompletion = 0;
    const profileFields = [
      user.firstName && user.lastName ? 1 : 0,
      user.email ? 1 : 0,
      user.skills?.length > 0 ? 1 : 0,
      primaryResume ? 1 : 0,
      user.bio ? 1 : 0,
      user.location ? 1 : 0,
    ];
    profileCompletion = Math.round(
      (profileFields.reduce((a, b) => a + b, 0) / profileFields.length) * 100
    );

    // Calculate resume score from AI suggestions
    let resumeScore = 0;
    if (primaryResume?.aiSuggestions?.length > 0) {
      const latestSuggestion =
        primaryResume.aiSuggestions[primaryResume.aiSuggestions.length - 1];
      resumeScore = latestSuggestion.score || 0;
    }

    // Get applications by status for chart
    const applicationsByStatus = await Application.aggregate([
      {
        $match: { candidate: user._id },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalApplications,
          activeApplications,
          interviewsScheduled,
          jobOffers,
          profileCompletion,
          resumeScore,
        },
        recentApplications,
        applicationsByStatus,
        profile: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          skills: user.skills || [],
          hasResume: !!primaryResume,
        },
      },
    });
  } catch (error: any) {
    console.error("Get candidate dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
