"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/recruiter/DashboardStats";
import ApplicationList from "@/components/recruiter/ApplicationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Calendar, Users, TrendingUp, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const mockData = {
  monthlyApplications: [
    { month: "Jan", applications: 65, hires: 12 },
    { month: "Feb", applications: 78, hires: 15 },
    { month: "Mar", applications: 90, hires: 18 },
    { month: "Apr", applications: 82, hires: 16 },
    { month: "May", applications: 95, hires: 20 },
    { month: "Jun", applications: 110, hires: 22 },
  ],
  topJobs: [
    { title: "Frontend Developer", applications: 45, hires: 8 },
    { title: "Backend Engineer", applications: 38, hires: 6 },
    { title: "UX Designer", applications: 32, hires: 5 },
    { title: "Product Manager", applications: 28, hires: 4 },
    { title: "DevOps Engineer", applications: 25, hires: 3 },
  ],
  recentActivity: [
    {
      action: "New application received",
      candidate: "John Doe",
      job: "Frontend Developer",
      time: "2 hours ago",
    },
    {
      action: "Interview scheduled",
      candidate: "Jane Smith",
      job: "UX Designer",
      time: "5 hours ago",
    },
    {
      action: "Job posted",
      title: "Senior Backend Engineer",
      time: "1 day ago",
    },
    {
      action: "Candidate hired",
      candidate: "Mike Johnson",
      job: "Product Manager",
      time: "2 days ago",
    },
  ],
};

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = {
    totalJobs: 24,
    activeJobs: 18,
    totalApplications: 342,
    pendingApplications: 28,
    hiredCandidates: 45,
    totalRevenue: 24500,
  };

  const applications = [
    {
      _id: "1",
      candidate: { name: "John Doe", email: "john@example.com", avatar: "" },
      job: { title: "Frontend Developer", _id: "1" },
      status: "pending",
      appliedAt: "2024-01-15T10:30:00Z",
      matchingScore: 85,
      resume: { _id: "1", originalFileName: "john_doe_resume.pdf" },
    },
    {
      _id: "2",
      candidate: { name: "Jane Smith", email: "jane@example.com", avatar: "" },
      job: { title: "UX Designer", _id: "2" },
      status: "reviewed",
      appliedAt: "2024-01-14T14:20:00Z",
      matchingScore: 92,
      resume: { _id: "2", originalFileName: "jane_smith_resume.pdf" },
    },
    // Add more mock applications as needed
  ];

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    // Implement status change logic
    console.log(`Changing application ${applicationId} to ${newStatus}`);
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
  };

  const handleFilterChange = (filter: any) => {
    console.log("Filter changed:", filter);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}!
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Applications Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData.monthlyApplications}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#0077b5"
                        strokeWidth={2}
                        name="Applications"
                      />
                      <Line
                        type="monotone"
                        dataKey="hires"
                        stroke="#00a866"
                        strokeWidth={2}
                        name="Hires"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.topJobs.map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.applications} applications
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {job.hires} hires
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((job.hires / job.applications) * 100)}%
                          success
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <AlertCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.candidate &&
                          `Candidate: ${activity.candidate}`}
                        {activity.job && ` • Job: ${activity.job}`}
                        {activity.title && ` • ${activity.title}`}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationList
            applications={applications}
            onStatusChange={handleStatusChange}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Your Job Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Job management content will go here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { source: "LinkedIn", applications: 120 },
                        { source: "Indeed", applications: 85 },
                        { source: "Company Website", applications: 65 },
                        { source: "Referrals", applications: 45 },
                        { source: "Other", applications: 27 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="applications" fill="#0077b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { score: "90-100%", count: 18 },
                        { score: "80-89%", count: 32 },
                        { score: "70-79%", count: 45 },
                        { score: "60-69%", count: 28 },
                        { score: "Below 60%", count: 15 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00a866" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
