import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import { Company } from "@/lib/models/Company";
import { Job } from "@/lib/models/Job";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Only show active companies
    const query: any = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (industry && industry !== "all") {
      query.industry = industry;
    }

    const skip = (page - 1) * limit;

    const companies = await Company.find(query)
      .select(
        "name logo description industry location website employeeCount rating featured"
      )
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get open positions count (only published jobs)
    const companiesWithPositions = await Promise.all(
      companies.map(async (company) => {
        const openPositions = await Job.countDocuments({
          company: company._id,
          isActive: true,
          isPublished: true,
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
    console.error("Get public companies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
