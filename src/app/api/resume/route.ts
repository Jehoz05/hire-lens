import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Resume } from "@/lib/models/Resume";
import { User } from "@/lib/models/User";

// GET user's resumes
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resumes = await Resume.find({ user: user._id }).sort({
      isPrimary: -1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: resumes,
    });
  } catch (error: any) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
