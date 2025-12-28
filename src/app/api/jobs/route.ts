import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/utils/dbConnect";
import { Job } from "@/lib/models/Job";
import { User } from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user to verify recruiter role
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "recruiter") {
      return NextResponse.json(
        { error: "Access denied. Recruiter role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Received job data:", body); // Debug log

    // Transform flat form data to nested structure
    // Handle salary - either already an object or separate fields
    let salary;
    if (body.salary && typeof body.salary === "object") {
      // Salary is already an object
      salary = body.salary;
    } else if (body.salaryMin !== undefined && body.salaryMax !== undefined) {
      // Salary comes as separate fields
      salary = {
        min: Number(body.salaryMin),
        max: Number(body.salaryMax),
        currency: body.currency || "USD",
        period: body.salaryPeriod || "yearly",
      };
    } else {
      return NextResponse.json(
        { error: "Salary information is required" },
        { status: 400 }
      );
    }

    // Handle company - either already an object or separate fields
    let company;
    if (body.company && typeof body.company === "object") {
      // Company is already an object
      company = body.company;
    } else if (body.companyName) {
      // Company comes as separate fields
      company = {
        name: body.companyName || "",
        logo: body.companyLogo || "",
        description: body.companyDescription || "",
      };
    } else {
      return NextResponse.json(
        { error: "Company information is required" },
        { status: 400 }
      );
    }

    // Prepare the job data with transformed fields
    const jobData = {
      title: body.title,
      description: body.description,
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      location: body.location,
      type: body.type,
      experienceLevel: body.experienceLevel,
      salary: salary,
      company: company,
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

    console.log("Transformed job data:", jobData); // Debug log

    // Validate required fields after transformation
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
      if (!jobData[field as keyof typeof jobData]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }

      // Additional validation for nested objects
      if (field === "salary" && (!jobData.salary.min || !jobData.salary.max)) {
        return NextResponse.json(
          { error: "Salary min and max are required" },
          { status: 400 }
        );
      }

      if (field === "company" && !jobData.company.name) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }
    }

    const job = await Job.create(jobData);

    return NextResponse.json(
      {
        success: true,
        data: job,
        message: "Job created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Job creation error details:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation error", details: errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Job with similar title already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const type = searchParams.get("type") || "";
    const experienceLevel = searchParams.get("experienceLevel") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (location) {
      query.location = new RegExp(location, "i");
    }

    if (type) {
      query.type = type;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (category) {
      query.category = category;
    }

    // If recruiter is viewing their own jobs
    const session = await getServerSession();
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user && user.role === "recruiter") {
        query.recruiter = user._id;
      }
    } else {
      // For non-logged in users, only show active jobs
      query.isActive = true;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("recruiter", "firstName lastName company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
