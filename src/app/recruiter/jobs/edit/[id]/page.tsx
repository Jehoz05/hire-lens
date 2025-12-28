"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import JobForm from "@/components/recruiter/JobForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship" | "remote";
  experienceLevel: "entry" | "mid" | "senior" | "executive";
  salary: {
    min: number;
    max: number;
    currency: string;
    period: "hourly" | "monthly" | "yearly";
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
}

export default function EditJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    fetchJob();
  }, [session, status, router, jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/jobs/${jobId}`);

      if (response.ok) {
        const data = await response.json();
        setJob(data.data);
      } else {
        toast.error("Failed to load job");
        router.push("/recruiter/jobs");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job");
      router.push("/recruiter/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (jobData: any) => {
    setIsSubmitting(true);

    try {
      // Format data for API - match what JobForm returns
      const formattedData = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        location: jobData.location,
        type: jobData.type,
        experienceLevel: jobData.experienceLevel,
        salaryMin: Number(jobData.salaryMin) || 0,
        salaryMax: Number(jobData.salaryMax) || 0,
        currency: jobData.currency || "USD",
        salaryPeriod: jobData.salaryPeriod || "yearly",
        companyName: jobData.companyName || "",
        companyLogo: jobData.companyLogo || "",
        companyDescription: jobData.companyDescription || "",
        category: jobData.category,
        skills: jobData.skills || [],
        applicationDeadline: jobData.applicationDeadline || "",
        recruiter: session?.user?.id,
      };

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update job");
      }

      toast.success("Job updated successfully!");
      router.push(`/recruiter/jobs/${jobId}`);
    } catch (error: any) {
      console.error("Job update error:", error);
      toast.error(error.message || "Failed to update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Job deleted successfully!");
        router.push("/recruiter/jobs");
      } else {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete job");
      }
    } catch (error: any) {
      console.error("Job deletion error:", error);
      toast.error(error.message || "Failed to delete job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
                The job you are trying to edit does not exist or you don't have
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

  // Transform job data for the form - match JobForm's expected interface
  const initialFormData = {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    location: job.location,
    type: job.type,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salary.min,
    salaryMax: job.salary.max,
    currency: job.salary.currency,
    salaryPeriod: job.salary.period,
    companyName: job.company.name,
    companyLogo: job.company.logo || "",
    companyDescription: job.company.description || "",
    category: job.category,
    skills: job.skills,
    applicationDeadline: job.applicationDeadline || "",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/recruiter/jobs/${jobId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Job"}
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Job: {job.title}</h1>
            <p className="text-muted-foreground">
              Update the job details below
            </p>
          </div>
        </div>

        {/* Job Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm
              initialData={initialFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5 shrink-0">
                <span className="text-yellow-800 text-sm">!</span>
              </div>
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">
                  Important Notes
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • Updating this job will notify all applicants of the
                    changes
                  </li>
                  <li>
                    • If you change requirements, existing applicants' match
                    scores will be recalculated
                  </li>
                  <li>
                    • Changing the job status will affect its visibility to
                    candidates
                  </li>
                  <li>• Deactivating the job will prevent new applications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
