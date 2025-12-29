import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { User } from "@/lib/models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: candidateId } = await params;
    const user = await User.findOne({ email: session.user.email });
    const { favorite } = await request.json();

    if (!user || user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // In a real app, you would store favorites in a separate collection
    // For now, we'll return success
    // Example: await Favorite.findOneAndUpdate(
    //   { recruiter: user._id, candidate: candidateId },
    //   { isFavorite: favorite },
    //   { upsert: true, new: true }
    // );

    return NextResponse.json({
      success: true,
      message: favorite ? "Added to favorites" : "Removed from favorites",
    });
  } catch (error: any) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
