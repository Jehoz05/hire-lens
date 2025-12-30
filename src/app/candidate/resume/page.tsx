// app/candidate/resume/page.tsx (complete)
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResumeBuilderForm from "@/components/candidate/ResumeBuilderForm";
import ResumePreview from "@/components/candidate/ResumePreview";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Eye, Edit2, FileText, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    portfolio?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
    achievements?: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: "Native" | "Fluent" | "Intermediate" | "Basic";
  }>;
  template: string;
}

export default function ResumePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("builder");
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch user's resumes on component mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchResumes();
    } else if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/resume", {
        cache: "no-store", // Prevent caching
      });

      if (!response.ok) {
        // If API doesn't exist or returns error, use empty array
        console.warn("Failed to fetch resumes, using empty array");
        setResumes([]);
        return;
      }

      // Check if response has content
      const text = await response.text();
      if (!text) {
        console.warn("Empty response from API");
        setResumes([]);
        return;
      }

      try {
        const data = JSON.parse(text);
        setResumes(data.resumes || []);

        // Set the first resume as current, or create a new one
        if (data.resumes && data.resumes.length > 0) {
          setCurrentResume(data.resumes[0]);
        }
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        setResumes([]);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async (resumeData: ResumeData) => {
    if (!session?.user) {
      toast.error("Please sign in to save your resume");
      return;
    }

    try {
      setSaving(true);

      // Determine if this is an update or create
      const isUpdate =
        currentResume &&
        currentResume.personalInfo.email === resumeData.personalInfo.email;

      const response = await fetch("/api/resume", {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentResume(resumeData);

        // Update resumes list
        await fetchResumes();

        toast.success(
          isUpdate
            ? "Resume updated successfully!"
            : "Resume saved successfully!"
        );

        // If this was a new resume, switch to preview
        if (!isUpdate) {
          setShowPreview(true);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save resume");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async (resumeData: ResumeData) => {
    try {
      const response = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeData,
          generatePDF: true,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resumeData.personalInfo.firstName}_${resumeData.personalInfo.lastName}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("PDF generated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleCreateNewResume = () => {
    const newResume: ResumeData = {
      personalInfo: {
        firstName: session?.user?.firstName || "",
        lastName: session?.user?.lastName || "",
        email: session?.user?.email || "",
        phone: "",
        location: "",
        portfolio: "",
        linkedin: "",
        github: "",
      },
      summary: "",
      skills: [
        { category: "Technical", items: [] },
        { category: "Soft Skills", items: [] },
        { category: "Tools", items: [] },
      ],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      template: "modern",
    };

    setCurrentResume(newResume);
    setShowPreview(false);
    setActiveTab("builder");
  };

  const handleSelectResume = (resume: ResumeData) => {
    setCurrentResume(resume);
    setShowPreview(false);
    setActiveTab("builder");
  };

  const handleDeleteResume = async (resumeId?: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      const response = await fetch("/api/resume", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: resumeId }),
      });

      if (response.ok) {
        await fetchResumes();

        // If we deleted the current resume, clear it
        if (currentResume && resumes.length > 1) {
          const remainingResumes = resumes.filter((r) => r !== currentResume);
          setCurrentResume(remainingResumes[0] || null);
        } else {
          setCurrentResume(null);
        }

        toast.success("Resume deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete resume");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete resume");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and download professional resumes
          </p>
        </div>

        {/* Resume Management & Builder Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 md:w-auto">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Resume Builder
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Resumes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            {currentResume ? (
              <>
                {/* Resume Selection & Controls */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Editing: {currentResume.personalInfo.firstName}{" "}
                          {currentResume.personalInfo.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Last updated: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          {showPreview ? (
                            <>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Resume
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview Resume
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCreateNewResume}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resume Builder or Preview */}
                {showPreview && currentResume ? (
                  <ResumePreview resume={currentResume} />
                ) : (
                  <ResumeBuilderForm
                    initialData={currentResume}
                    onSave={handleSaveResume}
                    onGeneratePDF={handleGeneratePDF}
                    onPreview={() => setShowPreview(true)}
                  />
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resume found</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first professional resume to get started
                  </p>
                  <Button onClick={handleCreateNewResume} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Resume
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">My Resumes</h2>
                    <p className="text-gray-600">
                      Manage and select your resumes
                    </p>
                  </div>
                  <Button onClick={handleCreateNewResume}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Resume
                  </Button>
                </div>

                {resumes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
                    <p className="text-gray-600 mb-6">
                      Create your first resume to get started
                    </p>
                    <Button onClick={handleCreateNewResume}>
                      Create Your First Resume
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map((resume, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer hover:shadow-lg transition-shadow ${
                          currentResume?.personalInfo.email ===
                          resume.personalInfo.email
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => handleSelectResume(resume)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">
                                {resume.personalInfo.firstName}{" "}
                                {resume.personalInfo.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {resume.personalInfo.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{resume.template}</Badge>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            {resume.summary && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {resume.summary.substring(0, 100)}...
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {resume.skills.slice(0, 3).map((skillGroup, i) =>
                                skillGroup.items.slice(0, 2).map((skill, j) => (
                                  <Badge
                                    key={`${i}-${j}`}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectResume(resume);
                                }}
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentResume(resume);
                                  setShowPreview(true);
                                  setActiveTab("builder");
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResume();
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
