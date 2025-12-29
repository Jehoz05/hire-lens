"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  TrendingUp,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Upload,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { format } from "date-fns";

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
    };
  };
  status: string;
  appliedAt: string;
  matchingScore: number;
  nextStep?: string;
}

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  jobOffers: number;
  profileCompletion: number;
  resumeScore: number;
  applicationStats: Array<{ status: string; count: number }>;
  monthlyActivity: Array<{
    month: string;
    applications: number;
    interviews: number;
  }>;
  recentApplications: Application[];
  recommendedJobs: Array<{
    _id: string;
    title: string;
    company: { name: string };
    location: string;
    matchingScore: number;
    salary?: { min: number; max: number; currency: string };
  }>;
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/candidate");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        fetchDashboardData(); // Refresh dashboard data
      } else {
        const error = await response.json();
        alert(error.error || "Failed to apply");
      }
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to submit application");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to load dashboard</h2>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const stats = dashboardData;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-100 text-blue-800",
      reviewed: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      interview: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      hired: "bg-emerald-100 text-emerald-800",
      offered: "bg-emerald-100 text-emerald-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatSalary = (salary: {
    min: number;
    max: number;
    currency: string;
  }) => {
    return `${
      salary.currency
    } ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Ready for your next
            opportunity?
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button onClick={() => router.push("/candidate/resume")}>
            <Upload className="h-4 w-4 mr-2" />
            Update Resume
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              All applications submitted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Applications
            </CardTitle>
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
            <CardTitle className="text-sm font-medium">
              Interviews Scheduled
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.interviewsScheduled}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Upcoming interviews
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
            <CardTitle className="text-sm font-medium">
              Profile Completion
            </CardTitle>
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
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
                    <BarChart data={stats.applicationStats}>
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
                  {stats.recentApplications.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{app.job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.job.company.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Applied {formatDate(app.appliedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {app.matchingScore}% Match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {stats.recentApplications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications yet
                  </div>
                )}
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
                  <BarChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="applications"
                      fill="#0077b5"
                      name="Applications"
                    />
                    <Bar
                      dataKey="interviews"
                      fill="#00a866"
                      name="Interviews"
                    />
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
              {stats.recentApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start applying to jobs to see them here
                  </p>
                  <Link href="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentApplications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            <Link
                              href={`/jobs/${app.job._id}`}
                              className="hover:text-primary"
                            >
                              {app.job.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground">
                            {app.job.company.name}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-600">
                              Applied {formatDate(app.appliedAt)}
                            </span>
                            <Badge className={getStatusBadge(app.status)}>
                              {app.status}
                            </Badge>
                            <span className="text-sm">
                              Match: {app.matchingScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/jobs/${app.job._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View Job
                            </Button>
                          </Link>
                          <Link href={`/candidate/applications/${app._id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {stats.recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-muted-foreground">
                          {job.company.name} • {job.location}
                        </p>
                        {job.salary && (
                          <p className="text-sm mt-2">
                            <DollarSign className="inline h-3 w-3 mr-1" />
                            {formatSalary(job.salary)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {job.matchingScore}% Match
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Link href={`/jobs/${job._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => handleApply(job._id)}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {stats.recommendedJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recommended jobs at the moment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Success Rate</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full"
                      style={{ width: `${stats.resumeScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on your resume quality and application history
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {stats.totalApplications}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Applications
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.interviewsScheduled}
                    </div>
                    <div className="text-sm text-gray-600">Interviews</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
