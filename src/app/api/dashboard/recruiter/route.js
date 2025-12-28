import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/utils/dbConnect';
import { Job } from '@/lib/models/Job';
import { Application } from '@/lib/models/Application';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (user.role !== 'recruiter') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get current date and dates for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all jobs posted by recruiter
    const jobs = await Job.find({ recruiter: user._id });

    // Get all applications for recruiter's jobs
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ job: { $in: jobIds } });

    // Calculate statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.isActive).length;
    const totalApplications = applications.length;
    
    const pendingApplications = applications.filter(
      app => app.status === 'pending'
    ).length;
    
    const hiredCandidates = applications.filter(
      app => app.status === 'hired'
    ).length;

    // Get recent applications (last 30 days)
    const recentApplications = await Application.find({
      job: { $in: jobIds },
      appliedAt: { $gte: thirtyDaysAgo },
    })
      .populate('job', 'title')
      .populate('candidate', 'firstName lastName')
      .sort({ appliedAt: -1 })
      .limit(10);

    // Get top performing jobs
    const jobPerformance = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: {
          _id: '$job',
          applications: { $sum: 1 },
          hires: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
        }
      },
      { $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails',
        }
      },
      { $unwind: '$jobDetails' },
      { $project: {
          title: '$jobDetails.title',
          applications: 1,
          hires: 1,
          successRate: { $multiply: [
            { $divide: ['$hires', { $max: [1, '$applications'] }] },
            100
          ]},
        }
      },
      { $sort: { applications: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications,
          hiredCandidates,
        },
        recentApplications,
        jobPerformance,
      },
    });
  } catch (error: any) {
    console.error('Recruiter dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}