import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import { Company } from "@/lib/models/Company";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const company = await Company.findById(id).select("-__v -recruiter").lean();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
