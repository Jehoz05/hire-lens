import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import { Company } from "@/lib/models/Company";
import { Job } from "@/lib/models/Job";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get companies with pagination
    const companies = await Company.find(query)
      .select("-__v -recruiter")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get open positions count for each company (only published jobs)
    const companiesWithPositions = await Promise.all(
      companies.map(async (company) => {
        const openPositions = await Job.countDocuments({
          company: company._id,
          isPublished: true,
          isActive: true,
          status: "published",
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
          ],
        });
        return {
          ...company,
          openPositions,
        };
      })
    );

    const total = await Company.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: companiesWithPositions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get companies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
