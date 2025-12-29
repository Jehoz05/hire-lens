// @/components/recruiter/DashboardStats.tsx - Enhanced version
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    hiredCandidates: number;
    totalRevenue?: number;
    conversionRate?: number;
    avgTimeToHire?: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // In a real app, you'd compare with previous period data
  // For now, we'll use reasonable estimates
  const statCards = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: calculateTrend(stats.totalJobs, Math.max(stats.totalJobs - 2, 0)),
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: calculateTrend(
        stats.activeJobs,
        Math.max(stats.activeJobs - 1, 0)
      ),
    },
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: calculateTrend(
        stats.totalApplications,
        Math.max(stats.totalApplications - 5, 0)
      ),
    },
    {
      title: "Pending Review",
      value: stats.pendingApplications,
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: calculateTrend(
        stats.pendingApplications,
        Math.max(stats.pendingApplications - 1, 0)
      ),
    },
    {
      title: "Hired Candidates",
      value: stats.hiredCandidates,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: calculateTrend(
        stats.hiredCandidates,
        Math.max(stats.hiredCandidates - 1, 0)
      ),
    },
    {
      title: "Conversion Rate",
      value: stats.conversionRate ? `${stats.conversionRate}%` : "N/A",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: stats.conversionRate || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {typeof stat.change === "number" && (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span
                    className={
                      stat.change >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change}%
                  </span>
                  <span className="ml-2">from last week</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
