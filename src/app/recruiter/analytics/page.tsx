"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
} from "lucide-react";

const monthlyData = [
  { month: "Jan", applications: 65, interviews: 12, hires: 4 },
  { month: "Feb", applications: 78, interviews: 15, hires: 5 },
  { month: "Mar", applications: 90, interviews: 18, hires: 6 },
  { month: "Apr", applications: 82, interviews: 16, hires: 5 },
  { month: "May", applications: 95, interviews: 20, hires: 7 },
  { month: "Jun", applications: 110, interviews: 22, hires: 8 },
];

const sourceData = [
  { name: "LinkedIn", value: 35, color: "#0077b5" },
  { name: "Indeed", value: 25, color: "#2164f3" },
  { name: "Company Website", value: 20, color: "#00a866" },
  { name: "Referrals", value: 12, color: "#ff6b6b" },
  { name: "Other", value: 8, color: "#7950f2" },
];

const topJobsData = [
  { job: "Frontend Developer", applications: 45, hires: 8, conversion: 17.8 },
  { job: "Backend Engineer", applications: 38, hires: 6, conversion: 15.8 },
  { job: "UX Designer", applications: 32, hires: 5, conversion: 15.6 },
  { job: "Product Manager", applications: 28, hires: 4, conversion: 14.3 },
  { job: "DevOps Engineer", applications: 25, hires: 3, conversion: 12.0 },
];

// Custom label renderer for PieChart
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;

  // Ensure percent is defined before using it
  if (percent === undefined || percent === null) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("6months");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }
  }, [session, status, router]);

  const stats = {
    totalApplications: 342,
    totalInterviews: 103,
    totalHires: 35,
    conversionRate: 10.2,
    avgTimeToHire: 24,
    candidateSatisfaction: 4.5,
  };

  // Calculate total for percentage calculation
  const totalValue = sourceData.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Insights and performance metrics for your recruitment efforts
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalApplications}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Applications
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalInterviews}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Interviews
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.totalHires}</div>
                  <div className="text-sm text-muted-foreground">Hires</div>
                </div>
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.conversionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Conversion Rate
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.avgTimeToHire} days
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. Time to Hire
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.candidateSatisfaction}/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Satisfaction
                  </div>
                </div>
                <Target className="h-8 w-8 text-emerald-500" />
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
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value, ""]}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          stroke="#0077b5"
                          strokeWidth={2}
                          name="Applications"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="interviews"
                          stroke="#00a866"
                          strokeWidth={2}
                          name="Interviews"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hires"
                          stroke="#7950f2"
                          strokeWidth={2}
                          name="Hires"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Application Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const percentage =
                              totalValue > 0
                                ? ((Number(value) / totalValue) * 100).toFixed(
                                    1
                                  )
                                : "0";
                            return [`${value} (${percentage}%)`, "Value"];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend with percentages */}
                    <div className="mt-4 space-y-2">
                      {sourceData.map((source, index) => {
                        const percentage =
                          totalValue > 0
                            ? ((source.value / totalValue) * 100).toFixed(1)
                            : "0";

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: source.color }}
                              />
                              <span className="text-sm">{source.name}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {source.value} ({percentage}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Job Title</th>
                        <th className="text-left py-3 px-4">Applications</th>
                        <th className="text-left py-3 px-4">Hires</th>
                        <th className="text-left py-3 px-4">Conversion Rate</th>
                        <th className="text-left py-3 px-4">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topJobsData.map((job) => (
                        <tr
                          key={job.job}
                          className="border-b hover:bg-secondary/50"
                        >
                          <td className="py-3 px-4 font-medium">{job.job}</td>
                          <td className="py-3 px-4">{job.applications}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{job.hires}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {job.conversion}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${job.conversion}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [value, "Applications"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="applications"
                        fill="#0077b5"
                        name="Applications"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="applications"
                        fill="#0077b5"
                        name="Applications"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="interviews"
                        fill="#00a866"
                        name="Interviews"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="hires"
                        fill="#7950f2"
                        name="Hires"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
