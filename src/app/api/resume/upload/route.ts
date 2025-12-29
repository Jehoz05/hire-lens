// app/api/resume/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { parseResumeWithGemini } from "@/lib/gemini/resumeParser"; // Updated import

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF or Word documents." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max for Gemini)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size should be less than 10MB" },
        { status: 400 }
      );
    }

    await connectDB();

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse resume with Gemini
    const parsedData = await parseResumeWithGemini(buffer, file.name);

    // Save to database
    const resume = new Resume({
      userId: session.user.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedText: parsedData.extractedText,
      parsedData: parsedData.structuredData,
      isParsed: true,
      uploadDate: new Date(),
    });

    await resume.save();

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and parsed successfully with Gemini",
      data: {
        _id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        uploadDate: resume.uploadDate,
        isParsed: resume.isParsed,
        parsedData: resume.parsedData,
      },
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload resume", details: error.message },
      { status: 500 }
    );
  }
}
