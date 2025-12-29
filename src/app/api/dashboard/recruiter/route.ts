import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";
import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";

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

    // Get recruiter's stats
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      hiredCandidates,
      recentApplications,
    ] = await Promise.all([
      Job.countDocuments({ recruiter: user._id }),
      Job.countDocuments({ recruiter: user._id, isActive: true }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
      }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
        status: "pending",
      }),
      Application.countDocuments({
        job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
        status: "hired",
      }),
      Application.find({
        job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
      })
        .populate("job", "title")
        .populate("candidate", "firstName lastName email")
        .sort({ appliedAt: -1 })
        .limit(5),
    ]);

    // Get applications by status for chart
    const applicationsByStatus = await Application.aggregate([
      {
        $match: {
          job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly applications
    const monthlyApplications = await Application.aggregate([
      {
        $match: {
          job: { $in: await Job.find({ recruiter: user._id }).distinct("_id") },
          appliedAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$appliedAt" },
            month: { $month: "$appliedAt" },
          },
          applications: { $sum: 1 },
          hires: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications,
          hiredCandidates,
        },
        recentApplications,
        applicationsByStatus,
        monthlyApplications,
      },
    });
  } catch (error: any) {
    console.error("Get recruiter dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
