import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";
import { User } from "@/lib/models/User";

export async function POST(request: NextRequest) {
  let responseBody;

  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      responseBody = { error: "Unauthorized" };
      return NextResponse.json(responseBody, { status: 401 });
    }

    // Get user to verify recruiter role
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "recruiter") {
      responseBody = { error: "Access denied. Recruiter role required." };
      return NextResponse.json(responseBody, { status: 403 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📝 Received job creation request:", body);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      responseBody = { error: "Invalid JSON in request body" };
      return NextResponse.json(responseBody, { status: 400 });
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "location",
      "type",
      "experienceLevel",
      "salary",
      "company",
      "category",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        responseBody = { error: `${field} is required` };
        return NextResponse.json(responseBody, { status: 400 });
      }
    }

    // Validate salary structure
    if (!body.salary?.min || !body.salary?.max) {
      responseBody = { error: "Salary min and max are required" };
      return NextResponse.json(responseBody, { status: 400 });
    }

    // Validate company structure
    if (!body.company?.name) {
      responseBody = { error: "Company name is required" };
      return NextResponse.json(responseBody, { status: 400 });
    }

    // Create job with recruiter ID from session
    const jobData = {
      title: body.title,
      description: body.description,
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      location: body.location,
      type: body.type,
      experienceLevel: body.experienceLevel,
      salary: {
        min: Number(body.salary.min),
        max: Number(body.salary.max),
        currency: body.salary.currency || "USD",
        period: body.salary.period || "yearly",
      },
      company: {
        name: body.company.name,
        logo: body.company.logo || "",
        description: body.company.description || "",
      },
      recruiter: user._id,
      category: body.category,
      skills: body.skills || [],
      applicationDeadline: body.applicationDeadline
        ? new Date(body.applicationDeadline)
        : undefined,
      isActive: body.isActive !== undefined ? body.isActive : true,
      views: 0,
      applications: 0,
    };

    console.log("💾 Creating job with data:", jobData);

    const job = await Job.create(jobData);

    console.log("✅ Job created successfully:", {
      id: job._id,
      title: job.title,
      createdAt: job.createdAt,
    });

    responseBody = {
      success: true,
      data: job,
      message: "Job created successfully",
    };

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error: any) {
    console.error("❌ Job creation error details:", error);
    console.error("❌ Error stack:", error.stack);

    // Handle different types of errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      responseBody = {
        error: "Validation error",
        details: errors,
      };
      return NextResponse.json(responseBody, { status: 400 });
    }

    if (error.code === 11000) {
      responseBody = { error: "Job with similar title already exists" };
      return NextResponse.json(responseBody, { status: 400 });
    }

    // Generic error
    responseBody = {
      error: "Internal server error",
      message: error.message,
    };
    return NextResponse.json(responseBody, { status: 500 });
  }
}
