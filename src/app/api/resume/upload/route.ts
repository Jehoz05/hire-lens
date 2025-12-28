import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";
import { parseResumeWithDeepSeek } from "@/lib/deekseek/resumeParser";
import { getResumeSuggestions } from "@/lib/deekseek/suggestions";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse resume with DeepSeek - PASS THE FILENAME AS SECOND ARGUMENT
    const parsedData = await parseResumeWithDeepSeek(buffer, file.name);

    // Get AI suggestions
    const suggestions = await getResumeSuggestions(parsedData.extractedText);

    // For now, we'll use a mock file URL
    // In production, you would upload to S3 or similar storage
    const fileUrl = `/uploads/resumes/${Date.now()}_${file.name}`;

    // Create resume record
    const resume = await Resume.create({
      user: user._id,
      originalFileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      parsedData,
      aiSuggestions: [
        {
          improvements: suggestions.improvements,
          missingSkills: suggestions.missingKeywords,
          score: suggestions.score,
          generatedDate: new Date(),
        },
      ],
      isPrimary: true,
    });

    // Set other resumes as non-primary
    await Resume.updateMany(
      {
        user: user._id,
        _id: { $ne: resume._id },
      },
      { $set: { isPrimary: false } }
    );

    // Update user skills if parsed
    if (parsedData.structuredData.skills.length > 0) {
      const newSkills = Array.from(
        new Set([...user.skills, ...parsedData.structuredData.skills])
      );
      await User.updateOne({ _id: user._id }, { $set: { skills: newSkills } });
    }

    return NextResponse.json({
      success: true,
      data: resume,
      message: "Resume uploaded and parsed successfully",
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
