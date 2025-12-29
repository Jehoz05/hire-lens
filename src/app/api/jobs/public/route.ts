import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";
import { Company } from "@/lib/models/Company";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // 🔥 IMPORTANT: Only show published jobs
    const query: any = {
      isActive: true,
      isPublished: true,
      status: "published",
    };

    // Filter out expired jobs
    query.$or = [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: null },
      { applicationDeadline: { $gt: new Date() } },
    ];

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    // Get jobs with company info
    const jobs = await Job.find(query)
      .populate({
        path: "company",
        select: "name logo description industry location website isActive",
        match: { isActive: true },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out jobs where company is not active
    const validJobs = jobs.filter((job) => job.company && job.company.isActive);

    const total = await Job.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: validJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get public jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
