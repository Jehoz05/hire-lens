"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Filter,
  Clock,
  Building,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  category: string;
  isRemote: boolean;
  isActive: boolean;
  isPublished: boolean;
  status: string;
  createdAt: string;
  expiresAt?: string;
  applicantsCount: number;
  views: number;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "all",
    type: "all",
    experienceLevel: "all",
    remote: "all",
    category: "all",
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs - only show published and active jobs
  const filteredJobs = jobs.filter((job) => {
    // Only show published and active jobs
    if (!job.isPublished || !job.isActive || job.status !== "published") {
      return false;
    }

    // Filter out expired jobs
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return false;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        job.skills.some((skill) => skill.toLowerCase().includes(query)) ||
        job.description.toLowerCase().includes(query) ||
        job.category.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (
      filters.location !== "all" &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Apply type filter
    if (filters.type !== "all" && job.type !== filters.type) {
      return false;
    }

    // Apply experience level filter
    if (
      filters.experienceLevel !== "all" &&
      job.experienceLevel !== filters.experienceLevel
    ) {
      return false;
    }

    // Apply remote filter
    if (filters.remote !== "all") {
      if (filters.remote === "remote" && !job.isRemote) return false;
      if (filters.remote === "onsite" && job.isRemote) return false;
    }

    // Apply category filter
    if (filters.category !== "all" && job.category !== filters.category) {
      return false;
    }

    return true;
  });

  // Get unique values for filters
  const categories = Array.from(new Set(jobs.map((j) => j.category))).filter(
    Boolean
  );
  const locations = Array.from(new Set(jobs.map((j) => j.location))).filter(
    Boolean
  );
  const jobTypes = Array.from(new Set(jobs.map((j) => j.type))).filter(Boolean);
  const experienceLevels = Array.from(
    new Set(jobs.map((j) => j.experienceLevel))
  ).filter(Boolean);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format salary
  const formatSalary = (salary: {
    min: number;
    max: number;
    currency: string;
  }) => {
    return `${
      salary.currency
    } ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary to-primary/90 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
            Discover thousands of job opportunities with top companies worldwide
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg shadow-lg">
              <div className="flex-1">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="border-none focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <Input
                    type="text"
                    placeholder="City, state, or remote"
                    className="border-none focus:ring-0"
                    value={filters.location === "all" ? "" : filters.location}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        location: e.target.value || "all",
                      })
                    }
                  />
                </div>
              </div>
              <Button className="h-12 px-8" onClick={() => fetchJobs()}>
                <Search className="h-5 w-5 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Type
                  </label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      setFilters({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) =>
                      setFilters({ ...filters, experienceLevel: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Remote Work
                  </label>
                  <Select
                    value={filters.remote}
                    onValueChange={(value) =>
                      setFilters({ ...filters, remote: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="remote">Remote Only</SelectItem>
                      <SelectItem value="onsite">On-site Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      location: "all",
                      type: "all",
                      experienceLevel: "all",
                      remote: "all",
                      category: "all",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Jobs</span>
                    <span className="font-bold">{jobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Jobs</span>
                    <span className="font-bold text-green-600">
                      {jobs.filter((j) => j.isPublished && j.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remote Jobs</span>
                    <span className="font-bold">
                      {jobs.filter((j) => j.isRemote).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New This Week</span>
                    <span className="font-bold">
                      {
                        jobs.filter((j) => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return new Date(j.createdAt) > weekAgo;
                        }).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {filteredJobs.length} Jobs Found
                </h2>
                <p className="text-gray-600">
                  Browse all available job opportunities
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="salary-high">
                      Salary: High to Low
                    </SelectItem>
                    <SelectItem value="salary-low">
                      Salary: Low to High
                    </SelectItem>
                    <SelectItem value="applicants">Most Applicants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ||
                    filters.type !== "all" ||
                    filters.location !== "all" ||
                    filters.experienceLevel !== "all"
                      ? "Try adjusting your search terms or filters"
                      : "No jobs are currently available"}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setFilters({
                        location: "all",
                        type: "all",
                        experienceLevel: "all",
                        remote: "all",
                        category: "all",
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className="hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Job Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {job.company.logo ? (
                              <img
                                src={job.company.logo}
                                alt={job.company.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <h3 className="text-xl font-bold hover:text-primary cursor-pointer">
                                  <Link href={`/jobs/${job._id}`}>
                                    {job.title}
                                  </Link>
                                </h3>
                                <div className="flex items-center gap-2">
                                  {job.isRemote && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      Remote
                                    </Badge>
                                  )}
                                  <Badge variant="secondary">
                                    {job.type.replace("-", " ")}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 mt-2">
                                <Link
                                  href={`/companies/${job.company._id}`}
                                  className="flex items-center gap-1 hover:text-primary"
                                >
                                  <Building className="h-4 w-4" />
                                  <span className="font-medium">
                                    {job.company.name}
                                  </span>
                                </Link>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                              </div>

                              {/* Job Description Preview */}
                              <p className="text-gray-600 line-clamp-2 mt-3">
                                {job.description}
                              </p>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {job.skills.slice(0, 5).map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.skills.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Job Stats & Actions */}
                        <div className="flex flex-col items-end gap-4 min-w-48">
                          {/* Salary */}
                          {job.salary && (
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-bold text-lg">
                                  {formatSalary(job.salary)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">per year</p>
                            </div>
                          )}

                          {/* Job Details */}
                          <div className="space-y-2 text-right">
                            <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>Posted {formatDate(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
                              <TrendingUp className="h-3 w-3" />
                              <span>{job.applicantsCount} applicants</span>
                            </div>
                            {job.expiresAt && (
                              <div className="flex items-center justify-end gap-2 text-sm text-red-500">
                                <Clock className="h-3 w-3" />
                                <span>Expires {formatDate(job.expiresAt)}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link href={`/jobs/${job._id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/jobs/${job._id}/apply`}>
                              <Button size="sm">Apply Now</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
