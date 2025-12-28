'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Users, Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    hiredCandidates: number;
    totalRevenue?: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+24%',
    },
    {
      title: 'Pending Review',
      value: stats.pendingApplications,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '+5%',
    },
    {
      title: 'Hired Candidates',
      value: stats.hiredCandidates,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      change: '+18%',
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : 'N/A',
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: '+15%',
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
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">{stat.change}</span>
              <span className="ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}