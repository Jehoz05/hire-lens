import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Get only published and active jobs
    const jobs = await Job.find({
      company: id,
      isPublished: true,
      isActive: true,
      status: "published",
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .select(
        "title type location experienceLevel salary isRemote createdAt expiresAt applicantsCount"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    console.error("Get company jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
