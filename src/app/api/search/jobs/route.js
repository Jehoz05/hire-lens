import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import { Job } from '@/lib/models/Job';
import { Resume } from '@/lib/models/Resume';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const category = searchParams.get('category') || '';
    const minSalary = searchParams.get('minSalary');
    const maxSalary = searchParams.get('maxSalary');

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = { isActive: true };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (location) {
      searchQuery.location = new RegExp(location, 'i');
    }

    if (type) {
      searchQuery.type = type;
    }

    if (experienceLevel) {
      searchQuery.experienceLevel = experienceLevel;
    }

    if (category) {
      searchQuery.category = category;
    }

    if (minSalary) {
      searchQuery['salary.min'] = { $gte: parseInt(minSalary) };
    }

    if (maxSalary) {
      searchQuery['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    const [jobs, total] = await Promise.all([
      Job.find(searchQuery)
        .populate('recruiter', 'firstName lastName company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(searchQuery),
    ]);

    // If user is logged in, calculate match scores
    const session = await getServerSession();
    if (session?.user?.email) {
      const userResume = await Resume.findOne({
        user: session.user.id,
        isPrimary: true,
      });

      if (userResume) {
        const resumeSkills = userResume.parsedData?.structuredData?.skills || [];
        jobs.forEach(job => {
          const jobSkills = job.skills || [];
          const matchScore = calculateMatchScore(jobSkills, resumeSkills);
          job.matchScore = matchScore;
        });

        // Sort by match score if we have skills
        jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }
    }

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
    console.error('Search jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateMatchScore(jobSkills: string[], resumeSkills: string[]): number {
  if (jobSkills.length === 0) return 0;
  
  const matchedSkills = resumeSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
}