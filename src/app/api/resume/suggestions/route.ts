import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";
import { getResumeSuggestions } from "@/lib/deekseek/suggestions";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    const { targetJobTitle, targetIndustry } = await request.json();

    // Get user's primary resume
    const resume = await Resume.findOne({
      user: user?._id,
      isPrimary: true,
    });

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Please upload a resume first." },
        { status: 404 }
      );
    }

    // Get AI suggestions
    const suggestions = await getResumeSuggestions(
      resume.parsedData.extractedText,
      targetJobTitle,
      targetIndustry
    );

    // Save suggestions to resume
    await Resume.updateOne(
      { _id: resume._id },
      {
        $push: {
          aiSuggestions: {
            improvements: suggestions.improvements,
            missingSkills: suggestions.missingKeywords,
            score: suggestions.score,
            generatedDate: new Date(),
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: suggestions,
      message: "AI suggestions generated successfully",
    });
  } catch (error: any) {
    console.error("Get resume suggestions error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
