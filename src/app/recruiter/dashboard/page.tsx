// @/app/recruiter/dashboard/page.tsx - Updated with real data
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/recruiter/DashboardStats";
import ApplicationList from "@/components/recruiter/ApplicationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

interface DashboardData {
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    hiredCandidates: number;
    conversionRate: number;
    avgTimeToHire: number;
    candidateSatisfaction: number;
  };
  recentApplications: Array<{
    _id: string;
    candidate: {
      name: string;
      email: string;
      avatar?: string;
    };
    job: {
      title: string;
      _id: string;
    };
    status: string;
    appliedAt: string;
    matchingScore: number;
    resume: {
      _id: string;
      originalFileName: string;
    };
  }>;
  applicationsByStatus: Array<{
    _id: string;
    count: number;
  }>;
  monthlyApplications: Array<{
    _id: {
      year: number;
      month: number;
    };
    applications: number;
    hires: number;
  }>;
  topJobs: Array<{
    title: string;
    applications: number;
    hires: number;
    conversion: number;
  }>;
  recentActivity: Array<{
    action: string;
    candidate?: string;
    job?: string;
    title?: string;
    time: string;
  }>;
}

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "recruiter") {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/recruiter");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success(`Application status updated to ${newStatus}`);
        fetchDashboardData(); // Refresh data
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Implement search functionality
  };

  const handleFilterChange = (filter: any) => {
    console.log("Filter changed:", filter);
    // Implement filter functionality
  };

  // Transform data for charts
  const getChartData = () => {
    if (!dashboardData)
      return { monthlyData: [], statusData: [], sourceData: [] };

    // Monthly applications chart data
    const monthlyData =
      dashboardData.monthlyApplications?.map((item) => ({
        month: `${item._id.month}/${item._id.year}`,
        applications: item.applications,
        hires: item.hires,
      })) || [];

    // Application status chart data
    const statusData =
      dashboardData.applicationsByStatus?.map((item) => ({
        status: item._id,
        count: item.count,
      })) || [];

    // Source data (you might need to add this to your API)
    const sourceData = [
      { name: "LinkedIn", value: 35, color: "#0077b5" },
      { name: "Indeed", value: 25, color: "#2164f3" },
      { name: "Company Website", value: 20, color: "#00a866" },
      { name: "Referrals", value: 12, color: "#ff6b6b" },
      { name: "Other", value: 8, color: "#7950f2" },
    ];

    return { monthlyData, statusData, sourceData };
  };

  if (status === "loading" || isLoading) {
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
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load dashboard data. Please try again.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const { monthlyData, statusData, sourceData } = getChartData();

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
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button onClick={() => router.push("/recruiter/jobs/new")}>
            <Users className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      <DashboardStats stats={dashboardData.stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Monthly Trends</CardTitle>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
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
                  {dashboardData.topJobs?.slice(0, 5).map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm truncate max-w-37.5">
                          {job.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.applications} applications
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {job.hires} hires
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.conversion}% success
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
                {dashboardData.recentActivity?.map((activity, index) => (
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }: any) =>
                          `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.status === "pending"
                                ? "#fbbf24"
                                : entry.status === "shortlisted"
                                ? "#10b981"
                                : entry.status === "hired"
                                ? "#8b5cf6"
                                : entry.status === "rejected"
                                ? "#ef4444"
                                : "#3b82f6"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Application Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() => router.push("/recruiter/jobs/new")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/recruiter/applications")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Applications
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/recruiter/candidates")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Search Candidates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/recruiter/analytics")}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationList
            applications={dashboardData.recentApplications}
            onStatusChange={handleStatusChange}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0077b5" name="Applications" />
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Match Score</span>
                    <span className="font-bold">
                      {dashboardData.stats.conversionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Time to Hire</span>
                    <span className="font-bold">
                      {dashboardData.stats.avgTimeToHire} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Candidate Satisfaction</span>
                    <span className="font-bold">
                      {dashboardData.stats.candidateSatisfaction}/5
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.conversionRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Conversion Rate
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.avgTimeToHire}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg. Days to Hire
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      $
                      {(
                        dashboardData.stats.totalApplications * 10
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated Savings
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {dashboardData.stats.hiredCandidates}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Hires
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
