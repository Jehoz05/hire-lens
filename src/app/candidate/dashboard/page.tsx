'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  TrendingUp,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Upload,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const mockData = {
  applicationStats: [
    { status: 'Applied', count: 15 },
    { status: 'Reviewed', count: 8 },
    { status: 'Shortlisted', count: 4 },
    { status: 'Interview', count: 2 },
    { status: 'Rejected', count: 3 },
    { status: 'Hired', count: 1 },
  ],
  monthlyActivity: [
    { month: 'Jan', applications: 3, interviews: 1 },
    { month: 'Feb', applications: 5, interviews: 2 },
    { month: 'Mar', applications: 4, interviews: 1 },
    { month: 'Apr', applications: 6, interviews: 3 },
    { month: 'May', applications: 8, interviews: 4 },
    { month: 'Jun', applications: 10, interviews: 5 },
  ],
  recommendedJobs: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      match: 92,
      salary: '$120,000 - $160,000',
    },
    {
      id: '2',
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      match: 88,
      salary: '$100,000 - $140,000',
    },
    {
      id: '3',
      title: 'Full Stack Engineer',
      company: 'InnovateCo',
      location: 'San Francisco, CA',
      match: 85,
      salary: '$130,000 - $180,000',
    },
  ],
  recentApplications: [
    {
      id: '1',
      job: 'Frontend Developer',
      company: 'TechCorp',
      date: '2024-01-15',
      status: 'shortlisted',
      nextStep: 'Technical Interview',
    },
    {
      id: '2',
      job: 'UX Designer',
      company: 'DesignStudio',
      date: '2024-01-14',
      status: 'reviewed',
      nextStep: 'Portfolio Review',
    },
    {
      id: '3',
      job: 'Product Manager',
      company: 'ProductLabs',
      date: '2024-01-12',
      status: 'applied',
      nextStep: 'Awaiting Review',
    },
  ],
};

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    totalApplications: 15,
    activeApplications: 8,
    interviewsScheduled: 3,
    jobOffers: 1,
    profileCompletion: 85,
    resumeScore: 78,
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-green-100 text-green-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Ready for your next opportunity?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button onClick={() => router.push('/candidate/resume')}>
            <Upload className="h-4 w-4 mr-2" />
            Update Resume
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeApplications}</div>
            <div className="text-xs text-muted-foreground mt-1">
              In progress and under review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewsScheduled}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Next interview in 2 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobOffers}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Congratulations!
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileCompletion}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${stats.profileCompletion}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumeScore}/100</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats.resumeScore}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.applicationStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0077b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <div className="font-medium">{app.job}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.company}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {app.nextStep}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#0077b5" name="Applications" />
                    <Bar dataKey="interviews" fill="#00a866" name="Interviews" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed applications list will go here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-muted-foreground">{job.company} • {job.location}</p>
                        <p className="text-sm mt-2">{job.salary}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {job.match}% Match
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm">
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed analytics will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}