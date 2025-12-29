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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Download,
  MessageSquare,
  Star,
  StarOff,
  FileText,
  Award,
  Globe,
  Eye,
  Linkedin,
  Github,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/helpers";
import toast from "react-hot-toast";

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  skills: string[];
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  resume?: {
    _id: string;
    originalFileName: string;
    fileUrl: string;
    parsedData: any;
  };
  applications: Array<{
    _id: string;
    job: {
      _id: string;
      title: string;
      company: {
        name: string;
      };
    };
    status: string;
    appliedAt: string;
    matchingScore: number;
  }>;
  isFavorite?: boolean;
}

export default function CandidateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    if (candidateId) {
      fetchCandidateData();
    }
  }, [session, status, router, candidateId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);

      // Fetch candidate data from API
      const response = await fetch(`/api/recruiter/candidates/${candidateId}`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch candidate data");
      }

      const data = await response.json();
      setCandidate(data.data);
      setIsFavorite(data.data?.isFavorite || false);
    } catch (error: any) {
      console.error("Error fetching candidate:", error);
      toast.error(error.message || "Failed to load candidate profile");
      router.push("/recruiter/candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch(
        `/api/recruiter/candidates/${candidateId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ favorite: !isFavorite }),
        }
      );

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(
          !isFavorite ? "Added to favorites" : "Removed from favorites"
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleDownloadResume = () => {
    if (candidate?.resume?.fileUrl) {
      window.open(candidate.resume.fileUrl, "_blank");
    }
  };

  const handleContactCandidate = () => {
    // Navigate to messages with this candidate
    router.push(`/recruiter/messages?candidate=${candidateId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The candidate you are looking for does not exist or you don't
                have access.
              </p>
              <Link href="/recruiter/candidates">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/recruiter/candidates">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleToggleFavorite}>
                {isFavorite ? (
                  <>
                    <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </Button>
              {candidate.resume && (
                <Button variant="outline" onClick={handleDownloadResume}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              )}
              <Button onClick={handleContactCandidate}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {candidate.firstName.charAt(0)}
                {candidate.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{fullName}</h1>
                  <p className="text-xl text-muted-foreground mt-1">
                    {candidate.title || "Professional"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Badge variant="secondary" className="text-lg">
                    {candidate.applications.length} Applications
                  </Badge>
                  {isFavorite && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Favorite
                    </Badge>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {/* Social Links */}
                {candidate.socialLinks && (
                  <div className="flex items-center gap-3">
                    {candidate.socialLinks.linkedin && (
                      <a
                        href={candidate.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {candidate.socialLinks.github && (
                      <a
                        href={candidate.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-black"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {candidate.socialLinks.portfolio && (
                      <a
                        href={candidate.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
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
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({candidate.applications.length})
            </TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bio & Skills */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {candidate.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {candidate.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm py-1.5"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                {candidate.certifications &&
                  candidate.certifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {candidate.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-primary pl-4"
                            >
                              <div className="font-medium">{cert.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {cert.issuer}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {cert.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                {/* Resume Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {candidate.resume
                            ? candidate.resume.originalFileName
                            : "No resume uploaded"}
                        </span>
                      </div>
                      {candidate.resume && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleDownloadResume}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {candidate.applications.slice(0, 3).map((app) => (
                        <div
                          key={app._id}
                          className="p-3 border rounded-lg hover:bg-secondary transition-colors"
                        >
                          <div className="font-medium text-sm">
                            {app.job.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {app.job.company.name}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Badge
                              className={
                                app.status === "shortlisted"
                                  ? "bg-green-100 text-green-800"
                                  : app.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {app.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(app.appliedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.experience && candidate.experience.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary pl-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{exp.title}</h3>
                            <p className="text-muted-foreground">
                              {exp.company}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(exp.startDate).toLocaleDateString()} -{" "}
                                {exp.current
                                  ? "Present"
                                  : exp.endDate
                                  ? new Date(exp.endDate).toLocaleDateString()
                                  : "Present"}
                              </span>
                            </div>
                            {exp.current && (
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="mt-3 text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No experience information available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.education && candidate.education.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary pl-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {edu.degree}
                            </h3>
                            <p className="text-muted-foreground">
                              {edu.institution}
                            </p>
                            {edu.fieldOfStudy && (
                              <p className="text-sm text-muted-foreground">
                                {edu.fieldOfStudy}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(edu.startDate).toLocaleDateString()} -{" "}
                                {edu.current
                                  ? "Present"
                                  : edu.endDate
                                  ? new Date(edu.endDate).toLocaleDateString()
                                  : "Present"}
                              </span>
                            </div>
                            {edu.current && (
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No education information available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.applications.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.applications.map((app) => (
                      <div
                        key={app._id}
                        className="p-4 border rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-lg">
                                {app.job.title}
                              </h3>
                              <Badge
                                className={
                                  app.status === "shortlisted"
                                    ? "bg-green-100 text-green-800"
                                    : app.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : app.status === "hired"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {app.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {app.job.company.name}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="text-muted-foreground">
                                Applied: {formatDate(app.appliedAt)}
                              </span>
                              <Badge
                                className={
                                  app.matchingScore >= 80
                                    ? "bg-green-100 text-green-800"
                                    : app.matchingScore >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {app.matchingScore}% Match
                              </Badge>
                            </div>
                          </div>
                          <Link href={`/recruiter/applications/${app._id}`}>
                            <Button variant="ghost" size="sm">
                              View Application
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume">
            <Card>
              <CardHeader>
                <CardTitle>Resume Details</CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.resume ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-medium">
                            {candidate.resume.originalFileName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Uploaded resume
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleDownloadResume}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    {/* Resume Preview */}
                    {candidate.resume.parsedData && (
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-4">
                          Extracted Information
                        </h3>
                        <div className="space-y-4">
                          {candidate.resume.parsedData.structuredData
                            ?.summary && (
                            <div>
                              <h4 className="font-medium mb-2">Summary</h4>
                              <p className="text-muted-foreground">
                                {
                                  candidate.resume.parsedData.structuredData
                                    .summary
                                }
                              </p>
                            </div>
                          )}
                          {candidate.resume.parsedData.aiSuggestions &&
                            candidate.resume.parsedData.aiSuggestions.length >
                              0 && (
                              <div>
                                <h4 className="font-medium mb-2">
                                  AI Suggestions
                                </h4>
                                <div className="space-y-2">
                                  {candidate.resume.parsedData.aiSuggestions[0].improvements.map(
                                    (suggestion: string, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-2"
                                      >
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></div>
                                        <span className="text-sm text-muted-foreground">
                                          {suggestion}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No resume uploaded by this candidate
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
