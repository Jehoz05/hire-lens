"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import JobForm from "@/components/recruiter/JobForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function PostJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== "recruiter") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (jobData: any) => {
    setIsSubmitting(true);

    try {
      // Format salary object properly
      const salary = {
        min: Number(jobData.salaryMin) || 0,
        max: Number(jobData.salaryMax) || 0,
        currency: jobData.currency || "USD",
        period: jobData.salaryPeriod || "yearly",
      };

      // Format company object properly
      const company = {
        name: jobData.companyName || "",
        logo: jobData.companyLogo || "",
        description: jobData.companyDescription || "",
      };

      // Prepare the final data for API
      const formattedData = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        location: jobData.location,
        type: jobData.type,
        experienceLevel: jobData.experienceLevel,
        salary: salary,
        company: company,
        category: jobData.category,
        skills: jobData.skills || [],
        applicationDeadline: jobData.applicationDeadline || undefined,
        // Remove recruiter field - it should be set by the API based on session
      };

      console.log("📤 Sending to API:", formattedData);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();
      console.log("📥 API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to create job");
      }

      if (!result.data?._id) {
        console.error("❌ No job ID returned:", result);
        throw new Error("Job created but no ID returned");
      }

      toast.success("Job posted successfully!");

      // Add a small delay to ensure database is updated
      setTimeout(() => {
        router.push(`/recruiter/jobs/${result.data._id}`);
        router.refresh(); // Refresh the page to load new data
      }, 500);
    } catch (error: any) {
      console.error("❌ Job creation error:", error);
      toast.error(error.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/recruiter/jobs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Post a New Job</h1>
              <p className="text-muted-foreground mt-2">
                Fill out the form below to post a new job opening
              </p>
            </div>
          </div>
        </div>

        {/* Job Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <JobForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
