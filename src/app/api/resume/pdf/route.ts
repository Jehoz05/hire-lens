// app/api/resume/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";

// POST - Save PDF and resume data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resume: resumeData, pdfData } = body;

    await connectDB();

    // Update or create resume with PDF data
    const resume = await Resume.findOneAndUpdate(
      { userId: session.user.id, isDefault: true },
      {
        ...resumeData,
        pdfData: pdfData, // Store base64 PDF data
        lastUpdated: new Date(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Resume PDF saved successfully",
      data: {
        _id: resume._id,
        hasPDF: !!pdfData,
      },
    });
  } catch (error: any) {
    console.error("Save PDF error:", error);
    return NextResponse.json(
      { error: "Failed to save PDF", details: error.message },
      { status: 500 }
    );
  }
}
