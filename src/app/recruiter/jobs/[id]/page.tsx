"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  ArrowLeft,
  Edit,
  Users,
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils/helpers";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  company: {
    name: string;
    logo?: string;
    description?: string;
  };
  category: string;
  skills: string[];
  applicationDeadline?: string;
  isActive: boolean;
  views: number;
  applications: number;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  _id: string;
  candidate: {
    name: string;
    email: string;
  };
  status: string;
  appliedAt: string;
  matchingScore: number;
}

export default function JobDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  // Add null check and logging
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log("🔍 Route params:", params);
    console.log("🔍 Job ID from params:", jobId);

    if (!jobId) {
      console.error("❌ No job ID found in route params");
      toast.error("Invalid job URL");
      return;
    }

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    fetchJobDetails();
  }, [session, status, router, jobId]); // Add jobId to dependency array

  const fetchJobDetails = async () => {
    if (!jobId) {
      console.error("Cannot fetch job details: jobId is undefined");
      toast.error("Invalid job ID");
      return;
    }

    try {
      setLoading(true);
      console.log(`🔄 Fetching job details for ID: ${jobId}`);

      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      console.log(`📥 Job API response status: ${jobResponse.status}`);

      const jobData = await jobResponse.json();
      console.log(`📊 Job API response data:`, jobData);

      if (jobResponse.ok) {
        setJob(jobData.data);
      } else {
        console.error(`❌ Job fetch failed:`, jobData.error);
        toast.error(`Failed to load job: ${jobData.error || "Unknown error"}`);
      }

      // Try to fetch applications separately
      try {
        const applicationsResponse = await fetch(
          `/api/applications?jobId=${jobId}`
        );
        if (applicationsResponse.ok) {
          const appsData = await applicationsResponse.json();
          setApplications(appsData.data || []);
        }
      } catch (appError) {
        console.error("Failed to fetch applications:", appError);
        // Don't show error for applications - job might still be valid
      }
    } catch (error) {
      console.error("❌ Error fetching job details:", error);
      toast.error("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async () => {
    if (!job || !jobId) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !job.isActive }),
      });

      if (response.ok) {
        setJob({ ...job, isActive: !job.isActive });
        toast.success(
          `Job ${!job.isActive ? "activated" : "deactivated"} successfully`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update job status");
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const getApplicationStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      reviewed: applications.filter((app) => app.status === "reviewed").length,
      shortlisted: applications.filter((app) => app.status === "shortlisted")
        .length,
      hired: applications.filter((app) => app.status === "hired").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
    return stats;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The job you are looking for does not exist or you don't have
                access to it.
              </p>
              <Link href="/recruiter/jobs">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getApplicationStats();

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant={job.isActive ? "outline" : "default"}
                onClick={toggleJobStatus}
              >
                {job.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Link href={`/recruiter/jobs/edit/${jobId}`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <Badge variant={job.isActive ? "default" : "secondary"}>
                  {job.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{job.company.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{job.applications}</div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line">{job.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Responsibilities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Job Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Job Type</span>
                      </div>
                      <span className="font-medium capitalize">
                        {job.type.replace("-", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Experience Level</span>
                      </div>
                      <span className="font-medium capitalize">
                        {job.experienceLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Salary</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(job.salary.min, job.salary.currency)} -{" "}
                        {formatCurrency(job.salary.max, job.salary.currency)}
                        <span className="text-sm text-muted-foreground ml-1">
                          /{job.salary.period}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Category</span>
                      </div>
                      <span className="font-medium">{job.category}</span>
                    </div>

                    {job.applicationDeadline && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Application Deadline</span>
                        </div>
                        <span className="font-medium">
                          {formatDate(job.applicationDeadline)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Required Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Company Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="font-medium">{job.company.name}</div>
                      {job.company.description && (
                        <p className="text-sm text-muted-foreground">
                          {job.company.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No applications yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Candidates will appear here once they apply for this job.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/jobs")}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Job Page
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">
                            {stats.total}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {stats.pending}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Pending
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.reviewed}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Reviewed
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {stats.shortlisted}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Shortlisted
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {stats.hired}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Hired
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Candidate</th>
                            <th className="text-left py-3 px-4">Applied</th>
                            <th className="text-left py-3 px-4">Match Score</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr
                              key={app._id}
                              className="border-b hover:bg-secondary/50"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium">
                                    {app.candidate.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {app.candidate.email}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {formatDate(app.appliedAt)}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={
                                    app.matchingScore >= 80
                                      ? "bg-green-100 text-green-800"
                                      : app.matchingScore >= 60
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {app.matchingScore}%
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={
                                    app.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : app.status === "reviewed"
                                      ? "bg-blue-100 text-blue-800"
                                      : app.status === "shortlisted"
                                      ? "bg-green-100 text-green-800"
                                      : app.status === "hired"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {app.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Job Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold mb-2">{job.views}</div>
                      <div className="text-sm text-muted-foreground">
                        Total Views
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold mb-2">
                        {job.applications}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Applications
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold mb-2">
                        {job.views > 0
                          ? ((job.applications / job.views) * 100).toFixed(1)
                          : 0}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Conversion Rate
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
