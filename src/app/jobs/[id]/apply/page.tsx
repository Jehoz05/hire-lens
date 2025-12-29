// app/jobs/[id]/apply/page.tsx
"use client";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Modal";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  AlertTriangle,
  X,
} from "lucide-react";
import { format } from "date-fns";

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
  description: string;
  requirements: string[];
  skills: string[];
  isRemote: boolean;
  createdAt: string;
}

interface Resume {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: string;
  isParsed: boolean;
  parsedData?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: number;
    education?: string[];
  };
}

interface ApplicationForm {
  resumeId: string;
  coverLetter: string;
  salaryExpectation: {
    min: number;
    max: number;
    currency: string;
  };
  noticePeriod: string;
  availableFrom: string;
  additionalInfo: string;
}

export default function ApplyJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [form, setForm] = useState<ApplicationForm>({
    resumeId: "",
    coverLetter: "",
    salaryExpectation: {
      min: 0,
      max: 0,
      currency: "USD",
    },
    noticePeriod: "immediate",
    availableFrom: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?redirect=/jobs/${id}/apply`);
      return;
    }

    if (status === "authenticated") {
      fetchJob();
      fetchResumes();
    }
  }, [status, id]);

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
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resume");
      if (response.ok) {
        const data = await response.json();
        setResumes(data.data || []);

        // Auto-select the latest resume if available
        if (data.data?.length > 0) {
          const latestResume = data.data[0];
          setSelectedResume(latestResume._id);
          setForm((prev) => ({ ...prev, resumeId: latestResume._id }));
        }
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or Word document");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Upload the file
      await handleFileUploadFromFile(file);
    }
  };

  const handleFileUploadFromFile = async (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);

        // Add new resume to list and select it
        const newResume = data.data;
        setResumes((prev) => [newResume, ...prev]);
        setSelectedResume(newResume._id);
        setForm((prev) => ({ ...prev, resumeId: newResume._id }));

        // Close dialog after a delay
        setTimeout(() => {
          setShowResumeDialog(false);
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload resume");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload resume");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add dropzone hook
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.resumeId) {
      newErrors.resumeId = "Please select or upload a resume";
    }

    if (!form.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required";
    } else if (form.coverLetter.length < 50) {
      newErrors.coverLetter = "Cover letter should be at least 50 characters";
    }

    if (form.salaryExpectation?.min > 0 && form.salaryExpectation?.max > 0) {
      if (form.salaryExpectation.min > form.salaryExpectation.max) {
        newErrors.salaryExpectation =
          "Minimum salary cannot be greater than maximum";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: id,
          resumeId: form.resumeId,
          coverLetter: form.coverLetter,
          salaryExpectation:
            form.salaryExpectation?.min > 0
              ? form.salaryExpectation
              : undefined,
          noticePeriod: form.noticePeriod,
          availableFrom: form.availableFrom || undefined,
          additionalInfo: form.additionalInfo || undefined,
        }),
      });

      if (response.ok) {
        setShowSuccessDialog(true);

        // Update local storage for dashboard
        localStorage.setItem("lastApplication", new Date().toISOString());
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit application");
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
              <h3 className="text-2xl font-bold mb-4">Job Not Found</h3>
              <p className="text-gray-600 mb-6">
                The job you're trying to apply for doesn't exist or has been
                removed.
              </p>
              <Link href="/jobs">
                <Button>Browse All Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/jobs/${id}`}
            className="inline-flex items-center text-primary hover:underline mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Link>
          <h1 className="text-3xl font-bold">Apply for {job.title}</h1>
          <p className="text-gray-600">
            Complete your application for the position at {job.company.name}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Form */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Resume Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="resume" className="text-base font-medium">
                        Select Resume
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowResumeDialog(true)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New
                      </Button>
                    </div>

                    {resumes.length === 0 ? (
                      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">No resumes found</p>
                        <Button
                          type="button"
                          onClick={() => setShowResumeDialog(true)}
                        >
                          Upload Your First Resume
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {resumes.map((resume) => (
                          <div
                            key={resume._id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedResume === resume._id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              setSelectedResume(resume._id);
                              setForm((prev) => ({
                                ...prev,
                                resumeId: resume._id,
                              }));
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <div className="font-medium">
                                    {resume.fileName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatFileSize(resume.fileSize)} • Uploaded{" "}
                                    {format(
                                      new Date(resume.uploadDate),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {resume.isParsed && (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50"
                                  >
                                    Parsed
                                  </Badge>
                                )}
                                {selectedResume === resume._id && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.resumeId && (
                      <p className="text-sm text-red-600">{errors.resumeId}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Cover Letter */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="coverLetter"
                      className="text-base font-medium"
                    >
                      Cover Letter <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Write your cover letter here. Explain why you're a good fit for this position..."
                      rows={8}
                      value={form.coverLetter}
                      onChange={(e) =>
                        setForm({ ...form, coverLetter: e.target.value })
                      }
                      className={`min-h-50 ${
                        errors.coverLetter ? "border-red-500" : ""
                      }`}
                    />
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">
                        Minimum 50 characters. {form.coverLetter.length}{" "}
                        characters
                      </p>
                      {errors.coverLetter && (
                        <p className="text-sm text-red-600">
                          {errors.coverLetter}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Salary Expectation */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Salary Expectation (Optional)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <Select
                          value={form.salaryExpectation?.currency || "USD"}
                          onValueChange={(value) =>
                            setForm({
                              ...form,
                              salaryExpectation: {
                                ...form.salaryExpectation!,
                                currency: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={form.salaryExpectation?.min || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              salaryExpectation: {
                                ...form.salaryExpectation!,
                                min: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={form.salaryExpectation?.max || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              salaryExpectation: {
                                ...form.salaryExpectation!,
                                max: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">per year</span>
                      </div>
                    </div>
                    {errors.salaryExpectation && (
                      <p className="text-sm text-red-600">
                        {errors.salaryExpectation}
                      </p>
                    )}
                    {job.salary && (
                      <p className="text-sm text-gray-500">
                        Job salary range: {job.salary.currency}{" "}
                        {job.salary.min.toLocaleString()} -{" "}
                        {job.salary.max.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="noticePeriod"
                        className="text-base font-medium"
                      >
                        Notice Period
                      </Label>
                      <Select
                        value={form.noticePeriod}
                        onValueChange={(value) =>
                          setForm({ ...form, noticePeriod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select notice period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="1week">1 Week</SelectItem>
                          <SelectItem value="2weeks">2 Weeks</SelectItem>
                          <SelectItem value="1month">1 Month</SelectItem>
                          <SelectItem value="2months">2 Months</SelectItem>
                          <SelectItem value="3months">3 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="availableFrom"
                        className="text-base font-medium"
                      >
                        Available From (Optional)
                      </Label>
                      <Input
                        type="date"
                        id="availableFrom"
                        value={form.availableFrom}
                        onChange={(e) =>
                          setForm({ ...form, availableFrom: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="additionalInfo"
                      className="text-base font-medium"
                    >
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any additional information you'd like to share with the employer..."
                      rows={4}
                      value={form.additionalInfo}
                      onChange={(e) =>
                        setForm({ ...form, additionalInfo: e.target.value })
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="flex-1"
                        disabled={submitting || !form.resumeId}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Submitting Application...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                      <Link href={`/jobs/${id}`} className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      By submitting, you agree to share your information with{" "}
                      {job.company.name}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Job Summary Sidebar */}
          <div className="lg:w-1/3">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-4 w-4" />
                    <Link
                      href={`/companies/${job.company._id}`}
                      className="text-primary hover:underline"
                    >
                      {job.company.name}
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {job.location}
                        {job.isRemote && " (Remote possible)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Job Type</p>
                      <p className="font-medium capitalize">
                        {job.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 flex items-center justify-center text-gray-400">
                      <span className="text-sm font-bold">Exp.</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience Level</p>
                      <p className="font-medium capitalize">
                        {job.experienceLevel}
                      </p>
                    </div>
                  </div>

                  {job.salary && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Salary Range</p>
                        <p className="font-medium">
                          {job.salary.currency}{" "}
                          {job.salary.min.toLocaleString()} -{" "}
                          {job.salary.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium">
                        {format(new Date(job.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Required Skills */}
                <div>
                  <h4 className="font-bold mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Application Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-800 mb-2">
                        Application Tips
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Tailor your cover letter to this specific job</li>
                        <li>• Highlight relevant skills and experience</li>
                        <li>• Double-check for typos and grammar</li>
                        <li>• Keep your resume updated</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Link href={`/jobs/${id}`}>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Job Description
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Resume Upload Dialog */}
      // Update the Resume Upload Dialog section in the return statement
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload your resume in PDF or Word format (max 5MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {uploading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Uploading resume...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {uploadProgress}% complete
                </p>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
              >
                <input {...getInputProps()} id="resume-upload" />
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop your resume here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("resume-upload")?.click();
                    }}
                  >
                    Browse Files
                  </Button>
                </Label>
                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: PDF, DOC, DOCX
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResumeDialog(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <DialogTitle className="text-2xl">
                Application Submitted!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your application has been successfully submitted to{" "}
                <span className="font-bold">{job.company.name}</span> for the{" "}
                <span className="font-bold">{job.title}</span> position.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• The employer will review your application</li>
                <li>
                  • You can track your application status in your dashboard
                </li>
                <li>• The employer may contact you for further steps</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1">
              <Link href="/candidate/applications">View My Applications</Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <Link href="/jobs">Browse More Jobs</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
