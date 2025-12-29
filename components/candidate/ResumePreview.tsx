// components/candidate/ResumePreview.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  Download,
  Eye,
  Printer,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  User,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

interface ResumePreviewProps {
  resume: ResumeData;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById("resume-content");
      if (!element) {
        throw new Error("Resume content not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to maintain aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const pdfImgHeight = pdfWidth * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfImgHeight);

      // Add page if content exceeds one page
      if (pdfImgHeight > pdfHeight) {
        pdf.addPage();
      }

      const fileName = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume.pdf`;
      pdf.save(fileName);

      // Also send to backend for storage
      try {
        await fetch("/api/resume/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume,
            pdfData: imgData,
          }),
        });
      } catch (error) {
        console.error("Failed to save PDF to server:", error);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const printResume = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Preview</h1>
            <p className="text-gray-600">
              Preview and download your professional resume
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={printResume}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={generatePDF} disabled={isGeneratingPDF}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Resume Content */}
        <div
          id="resume-content"
          className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          {/* Modern Template */}
          {resume.template === "modern" && (
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {resume.personalInfo.firstName}{" "}
                      {resume.personalInfo.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {resume.summary.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {resume.personalInfo.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {resume.personalInfo.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {resume.personalInfo.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {resume.personalInfo.linkedin && (
                    <a
                      href={resume.personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {resume.personalInfo.github && (
                    <a
                      href={resume.personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                    >
                      <LinkIcon className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {resume.personalInfo.portfolio && (
                    <a
                      href={resume.personalInfo.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-800"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Skills */}
              {resume.skills.some((s) => s.items.length > 0) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Skills
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {resume.skills.map(
                      (skillGroup, index) =>
                        skillGroup.items.length > 0 && (
                          <div key={index}>
                            <h3 className="font-semibold mb-2 text-gray-700">
                              {skillGroup.category}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {skillGroup.items.map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  variant="outline"
                                  className="text-sm"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resume.experience.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </h2>
                  <div className="space-y-6">
                    {resume.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary pl-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{exp.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(exp.startDate)} -{" "}
                              {exp.current
                                ? "Present"
                                : formatDate(exp.endDate || "")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-700 mb-3">
                          <span className="font-medium">{exp.company}</span>
                          <span className="hidden md:inline">•</span>
                          <span>{exp.location}</span>
                        </div>
                        <ul className="space-y-1">
                          {exp.description.map((desc, descIndex) => (
                            <li
                              key={descIndex}
                              className="flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span className="text-gray-700">{desc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h2>
                  <div className="space-y-6">
                    {resume.education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-blue-500 pl-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">
                            {edu.degree}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(edu.startDate)} -{" "}
                              {edu.current
                                ? "Present"
                                : formatDate(edu.endDate || "")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-gray-700 mb-2">
                          <span className="font-medium">{edu.institution}</span>
                          <span className="hidden md:inline">•</span>
                          <span>{edu.location}</span>
                        </div>
                        {edu.gpa && (
                          <p className="text-gray-600 text-sm">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Projects
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {resume.projects.map((project, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Project →
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resume.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h3 className="font-semibold">{cert.name}</h3>
                          <p className="text-sm text-gray-600">
                            {cert.issuer} • {formatDate(cert.date)}
                          </p>
                          {cert.credentialId && (
                            <p className="text-xs text-gray-500">
                              ID: {cert.credentialId}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {resume.languages.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Languages
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {resume.languages.map((lang, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 px-4 py-2 rounded-lg"
                      >
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({lang.proficiency})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
