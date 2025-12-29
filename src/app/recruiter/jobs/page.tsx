// @/app/recruiter/jobs/page.tsx - Updated version
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils/helpers";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  createdAt: string;
  isActive: boolean;
  applications: number;
  views: number;
  status: "active" | "draft" | "closed";
  category: string;
}

export default function JobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/jobs/filter");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      console.log("Fetched jobs:", data.data);
      setJobs(data.data || []);
      setFilteredJobs(data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    fetchJobs();
  }, [session, status, router]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, jobs]);

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          job.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(
          (job) => job.isActive && job.status === "active"
        );
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((job) => job.status === "draft");
      } else if (statusFilter === "closed") {
        filtered = filtered.filter(
          (job) => !job.isActive || job.status === "closed"
        );
      }
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      // Remove from local state
      setJobs(jobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(error.message || "Failed to delete job");
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j._id === jobId);
      if (!job) return;

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !job.isActive,
          status: !job.isActive ? "active" : "closed",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      // Update local state
      setJobs(
        jobs.map((j) =>
          j._id === jobId
            ? {
                ...j,
                isActive: !j.isActive,
                status: !j.isActive ? "active" : "closed",
              }
            : j
        )
      );

      toast.success(
        `Job ${!job.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error: any) {
      console.error("Error toggling job status:", error);
      toast.error(error.message || "Failed to update job status");
    }
  };

  const getStatusBadge = (job: Job) => {
    if (job.status === "draft") {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Clock className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    }

    if (job.isActive && job.status === "active") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-700 border-red-200"
      >
        <XCircle className="h-3 w-3 mr-1" />
        Closed
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "text-blue-600 bg-blue-100";
      case "part-time":
        return "text-purple-600 bg-purple-100";
      case "contract":
        return "text-orange-600 bg-orange-100";
      case "remote":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.isActive && j.status === "active").length,
    draft: jobs.filter((j) => j.status === "draft").length,
    closed: jobs.filter((j) => !j.isActive || j.status === "closed").length,
    totalApplications: jobs.reduce((sum, job) => sum + job.applications, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.views, 0),
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Job Postings</h1>
            <p className="text-muted-foreground">
              Manage and track your job openings
            </p>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Jobs
                  </div>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.draft}
                  </div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
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
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchJobs()}>
                <Search className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>

          {/* Tabs for Status Filter */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading jobs...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't posted any jobs yet"}
                </p>
                <Link href="/recruiter/jobs/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job._id} className="hover:bg-secondary/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <Link
                              href={`/recruiter/jobs/${job._id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {job.title}
                            </Link>
                            <div className="text-xs text-muted-foreground mt-1">
                              {job.category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.company.logo && (
                              <img
                                src={job.company.logo}
                                alt={job.company.name}
                                className="h-6 w-6 rounded object-cover"
                              />
                            )}
                            <span>{job.company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getTypeColor(job.type)}
                          >
                            {job.type.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {formatCurrency(
                                job.salary.min,
                                job.salary.currency
                              )}{" "}
                              -{" "}
                              {formatCurrency(
                                job.salary.max,
                                job.salary.currency
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{job.applications}</span>
                            <span className="text-xs text-muted-foreground">
                              ({job.views} views)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(job)}</TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/recruiter/jobs/${job._id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/recruiter/jobs/edit/${job._id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Job
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(job._id)}
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
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteJob(job._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
