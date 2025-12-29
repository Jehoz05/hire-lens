"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Globe,
  Share2,
  Bookmark,
  CheckCircle,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
    description: string;
    website?: string;
    location: string;
    industry: string;
  };
  location: string;
  type: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  skills: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  category: string;
  isRemote: boolean;
  createdAt: string;
  expiresAt?: string;
  applicantsCount: number;
  views: number;
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkApplication();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.data);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    if (!session?.user) return;
    try {
      const response = await fetch(`/api/applications/check?jobId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setApplied(data.applied || false);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleApply = async () => {
    if (!session?.user) {
      window.location.href = `/login?redirect=/jobs/${id}`;
      return;
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: id,
          resumeId: "your-resume-id-here", // You'll need to get this from the user's profile
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplied(true);

        // Show success message
        alert("Application submitted successfully!");

        // Update local storage to refresh dashboard
        localStorage.setItem("lastApplication", new Date().toISOString());

        // Optionally redirect to applications page
        // router.push("/candidate/applications");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Error applying:", error);
      alert("Failed to submit application");
    }
  };

  const handleSaveJob = () => {
    // Implement save job functionality
    setSaved(!saved);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Job Not Found</h3>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Job Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <Link
                            href={`/companies/${job.company._id}`}
                            className="flex items-center gap-2 hover:text-primary"
                          >
                            <Building className="h-4 w-4" />
                            <span className="font-medium">
                              {job.company.name}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {job.location}
                              {job.isRemote && " • Remote"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <Badge className="text-base py-2 px-4">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {job.type}
                      </Badge>
                      <Badge variant="outline" className="text-base py-2 px-4">
                        {job.experienceLevel}
                      </Badge>
                      {job.salary && (
                        <Badge
                          variant="secondary"
                          className="text-base py-2 px-4"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {job.salary.currency}{" "}
                          {job.salary.min.toLocaleString()} -{" "}
                          {job.salary.max.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSaveJob}
                      >
                        <Bookmark
                          className={`h-5 w-5 ${saved ? "fill-current" : ""}`}
                        />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                    {applied ? (
                      <Button disabled className="gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Applied
                      </Button>
                    ) : (
                      <Button onClick={handleApply} className="h-12 text-lg">
                        Apply Now
                      </Button>
                    )}
                    <div className="text-sm text-gray-500 text-center">
                      {job.applicantsCount} applicants
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <div className="space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-base py-2 px-4"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Company Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
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
                    <div>
                      <h3 className="font-bold text-lg">
                        <Link
                          href={`/companies/${job.company._id}`}
                          className="hover:text-primary"
                        >
                          {job.company.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job.company.industry}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-3">
                    {job.company.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{job.company.location}</span>
                    </div>
                    {job.company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  <Link href={`/companies/${job.company._id}`}>
                    <Button variant="outline" className="w-full">
                      View Company Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Job Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-medium capitalize">
                    {job.type.replace("-", " ")}
                  </span>
                </div>
                <div className="h-px w-full bg-gray-200" />

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience Level</span>
                  <span className="font-medium capitalize">
                    {job.experienceLevel}
                  </span>
                </div>
                <div className="h-px w-full bg-gray-200" />

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">
                    {job.location}
                    {job.isRemote && " (Remote)"}
                  </span>
                </div>
                <div className="h-px w-full bg-gray-200" />

                {job.salary && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Salary</span>
                      <span className="font-medium">
                        {job.salary.currency} {job.salary.min.toLocaleString()}{" "}
                        - {job.salary.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px w-full bg-gray-200" />
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">
                    {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                {job.expiresAt && (
                  <>
                    <div className="h-px w-full bg-gray-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Expires</span>
                      <span className="font-medium text-red-600">
                        {format(new Date(job.expiresAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
