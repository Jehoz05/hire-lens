// components/candidate/ResumeBuilderForm.tsx
// components/candidate/ResumeBuilderForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Eye,
  X,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  User,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { ResumeData } from "@/lib/types/resume";

const initialResumeData: ResumeData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
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

interface ResumeBuilderFormProps {
  initialData?: ResumeData;
  onSave?: (data: ResumeData) => Promise<void>;
  onGeneratePDF?: (data: ResumeData) => Promise<void>;
  onPreview?: () => void;
}

export default function ResumeBuilderForm({
  initialData,
  onSave,
  onGeneratePDF,
  onPreview,
}: ResumeBuilderFormProps) {
  const { data: session } = useSession();
  const [resume, setResume] = useState<ResumeData>(
    initialData || initialResumeData
  );
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [skillInput, setSkillInput] = useState("");
  const [skillCategory, setSkillCategory] = useState("Technical");

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setResume(initialData);
    }
  }, [initialData]);

  // Load user data if available
  useEffect(() => {
    if (session?.user && !initialData) {
      const user = session.user as any;
      setResume((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
        },
      }));
    }
  }, [session, initialData]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResume((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleInputChange = (section: keyof ResumeData, value: any) => {
    setResume((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    setResume((prev) => {
      const updatedSkills = [...prev.skills];
      const categoryIndex = updatedSkills.findIndex(
        (skill) => skill.category === skillCategory
      );

      if (categoryIndex !== -1) {
        // Check if skill already exists
        if (updatedSkills[categoryIndex].items.includes(skillInput.trim())) {
          toast.error("Skill already exists in this category");
          return prev;
        }

        updatedSkills[categoryIndex] = {
          ...updatedSkills[categoryIndex],
          items: [...updatedSkills[categoryIndex].items, skillInput.trim()],
        };
      } else {
        // If category doesn't exist, add it
        updatedSkills.push({
          category: skillCategory,
          items: [skillInput.trim()],
        });
      }

      return { ...prev, skills: updatedSkills };
    });

    setSkillInput("");
    toast.success("Skill added");
  };

  const removeSkill = (category: string, skillIndex: number) => {
    setResume((prev) => {
      const updatedSkills = [...prev.skills];
      const categoryIndex = updatedSkills.findIndex(
        (skill) => skill.category === category
      );

      if (categoryIndex !== -1) {
        updatedSkills[categoryIndex] = {
          ...updatedSkills[categoryIndex],
          items: updatedSkills[categoryIndex].items.filter(
            (_, index) => index !== skillIndex
          ),
        };
      }

      return { ...prev, skills: updatedSkills };
    });

    toast.success("Skill removed");
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
          endDate: "",
          current: false,
          description: [""],
        },
      ],
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value,
      };
      return { ...prev, experience: updatedExperience };
    });
  };

  const addDescription = (expIndex: number) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[expIndex] = {
        ...updatedExperience[expIndex],
        description: [...updatedExperience[expIndex].description, ""],
      };
      return { ...prev, experience: updatedExperience };
    });
  };

  const updateDescription = (
    expIndex: number,
    descIndex: number,
    value: string
  ) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[expIndex].description[descIndex] = value;
      return { ...prev, experience: updatedExperience };
    });
  };

  const removeDescription = (expIndex: number, descIndex: number) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[expIndex].description = updatedExperience[
        expIndex
      ].description.filter((_, index) => index !== descIndex);
      return { ...prev, experience: updatedExperience };
    });
  };

  const removeExperience = (index: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
    toast.success("Experience removed");
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          institution: "",
          location: "",
          startDate: new Date().toISOString().slice(0, 7),
          endDate: "",
          current: false,
          gpa: "",
          achievements: [""],
        },
      ],
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setResume((prev) => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value,
      };
      return { ...prev, education: updatedEducation };
    });
  };

  const removeEducation = (index: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    toast.success("Education removed");
  };

  const addProject = () => {
    setResume((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          technologies: [],
          link: "",
        },
      ],
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setResume((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value,
      };
      return { ...prev, projects: updatedProjects };
    });
  };

  const addProjectTechnology = (projectIndex: number, tech: string) => {
    if (!tech.trim()) return;

    setResume((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        technologies: [
          ...updatedProjects[projectIndex].technologies,
          tech.trim(),
        ],
      };
      return { ...prev, projects: updatedProjects };
    });
  };

  const removeProjectTechnology = (projectIndex: number, techIndex: number) => {
    setResume((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        technologies: updatedProjects[projectIndex].technologies.filter(
          (_, index) => index !== techIndex
        ),
      };
      return { ...prev, projects: updatedProjects };
    });
  };

  const removeProject = (index: number) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
    toast.success("Project removed");
  };

  const addCertification = () => {
    setResume((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: "",
          issuer: "",
          date: new Date().toISOString().slice(0, 7),
          credentialId: "",
        },
      ],
    }));
  };

  const updateCertification = (index: number, field: string, value: any) => {
    setResume((prev) => {
      const updatedCerts = [...prev.certifications];
      updatedCerts[index] = {
        ...updatedCerts[index],
        [field]: value,
      };
      return { ...prev, certifications: updatedCerts };
    });
  };

  const removeCertification = (index: number) => {
    setResume((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
    toast.success("Certification removed");
  };

  const addLanguage = () => {
    setResume((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          language: "",
          proficiency: "Intermediate",
        },
      ],
    }));
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    setResume((prev) => {
      const updatedLanguages = [...prev.languages];
      updatedLanguages[index] = {
        ...updatedLanguages[index],
        [field]: value,
      };
      return { ...prev, languages: updatedLanguages };
    });
  };

  const removeLanguage = (index: number) => {
    setResume((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
    toast.success("Language removed");
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save your resume");
      return;
    }

    // Validate required fields
    if (
      !resume.personalInfo.firstName.trim() ||
      !resume.personalInfo.lastName.trim()
    ) {
      toast.error("Please fill in your name");
      return;
    }

    if (!resume.personalInfo.email.trim()) {
      toast.error("Please fill in your email");
      return;
    }

    if (!resume.personalInfo.phone.trim()) {
      toast.error("Please fill in your phone number");
      return;
    }

    if (!resume.personalInfo.location.trim()) {
      toast.error("Please fill in your location");
      return;
    }

    if (!resume.summary.trim()) {
      toast.error("Please write a professional summary");
      return;
    }

    try {
      setLoading(true);

      if (onSave) {
        await onSave(resume);
      } else {
        // Determine if this is an update or create
        const method = resume._id ? "PUT" : "POST";
        const endpoint = "/api/resume";

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resume),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(result.message || "Resume saved successfully!");

          // Update the resume with the returned data (including _id)
          if (result.data) {
            setResume(result.data);
          }
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to save resume");
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save resume");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (onGeneratePDF) {
      await onGeneratePDF(resume);
    } else {
      toast.success("PDF generation would be implemented here");
    }
  };

  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview();
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "summary", label: "Summary", icon: Edit2 },
    { id: "skills", label: "Skills", icon: Code },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Code },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "languages", label: "Languages", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Resume Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Resume Template</Label>
                    <Select
                      value={resume.template}
                      onValueChange={(value) =>
                        handleInputChange("template", value)
                      }
                    >
                      <SelectTrigger id="template" className="mt-2">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Resume"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handlePreviewClick}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleGeneratePDF}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:w-3/4">
            <Card>
              <CardContent className="p-6">
                {activeSection === "personal" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-6">
                        Personal Information
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={resume.personalInfo.firstName}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "firstName",
                                e.target.value
                              )
                            }
                            placeholder="John"
                          />
                        </div>

                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={resume.personalInfo.lastName}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "lastName",
                                e.target.value
                              )
                            }
                            placeholder="Doe"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={resume.personalInfo.email}
                            onChange={(e) =>
                              handlePersonalInfoChange("email", e.target.value)
                            }
                            placeholder="john@example.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={resume.personalInfo.phone}
                            onChange={(e) =>
                              handlePersonalInfoChange("phone", e.target.value)
                            }
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={resume.personalInfo.location}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "location",
                                e.target.value
                              )
                            }
                            placeholder="San Francisco, CA"
                          />
                        </div>

                        <div>
                          <Label htmlFor="linkedin">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              LinkedIn
                            </div>
                          </Label>
                          <Input
                            id="linkedin"
                            value={resume.personalInfo.linkedin || ""}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "linkedin",
                                e.target.value
                              )
                            }
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>

                        <div>
                          <Label htmlFor="github">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              GitHub
                            </div>
                          </Label>
                          <Input
                            id="github"
                            value={resume.personalInfo.github || ""}
                            onChange={(e) =>
                              handlePersonalInfoChange("github", e.target.value)
                            }
                            placeholder="https://github.com/username"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="portfolio">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              Portfolio
                            </div>
                          </Label>
                          <Input
                            id="portfolio"
                            value={resume.personalInfo.portfolio || ""}
                            onChange={(e) =>
                              handlePersonalInfoChange(
                                "portfolio",
                                e.target.value
                              )
                            }
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "summary" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">
                      Professional Summary
                    </h2>

                    <div>
                      <Label htmlFor="summary">
                        Write a compelling summary of your professional
                        background *
                      </Label>
                      <Textarea
                        id="summary"
                        value={resume.summary}
                        onChange={(e) =>
                          handleInputChange("summary", e.target.value)
                        }
                        placeholder="Experienced software developer with 5+ years in web development. Specialized in React, Node.js, and cloud technologies. Passionate about building scalable applications and mentoring junior developers."
                        rows={8}
                        className="mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Tip: Highlight your key achievements, skills, and career
                        goals.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === "skills" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Skills</h2>
                      <div className="flex items-center gap-3">
                        <Select
                          value={skillCategory}
                          onValueChange={setSkillCategory}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Soft Skills">
                              Soft Skills
                            </SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a skill"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addSkill()}
                          />
                          <Button onClick={addSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resume.skills.map((skillGroup, groupIndex) => (
                        <Card key={skillGroup.category}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                              {skillGroup.category}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {skillGroup.items.map((skill, skillIndex) => (
                                <Badge
                                  key={skillIndex}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    onClick={() =>
                                      removeSkill(
                                        skillGroup.category,
                                        skillIndex
                                      )
                                    }
                                    className="hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                              {skillGroup.items.length === 0 && (
                                <p className="text-gray-500 text-sm">
                                  No skills added yet
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "experience" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Work Experience</h2>
                      <Button onClick={addExperience}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>

                    {resume.experience.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No experience added yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add your work experience to showcase your career
                            journey
                          </p>
                          <Button onClick={addExperience}>
                            Add Your First Experience
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {resume.experience.map((exp, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                  Experience #{index + 1}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExperience(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label>Job Title *</Label>
                                  <Input
                                    value={exp.title}
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Senior Software Engineer"
                                  />
                                </div>
                                <div>
                                  <Label>Company *</Label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "company",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Google"
                                  />
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <Input
                                    value={exp.location}
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "location",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Mountain View, CA"
                                  />
                                </div>
                                <div>
                                  <Label>Current Position</Label>
                                  <div className="flex items-center gap-3 mt-2">
                                    <input
                                      type="checkbox"
                                      id={`current-${index}`}
                                      checked={exp.current}
                                      onChange={(e) =>
                                        updateExperience(
                                          index,
                                          "current",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor={`current-${index}`}
                                      className="mb-0"
                                    >
                                      I currently work here
                                    </Label>
                                  </div>
                                </div>
                                <div>
                                  <Label>Start Date *</Label>
                                  <Input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="month"
                                    value={exp.endDate || ""}
                                    onChange={(e) =>
                                      updateExperience(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    disabled={exp.current}
                                    placeholder={exp.current ? "Present" : ""}
                                  />
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Responsibilities & Achievements</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addDescription(index)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Point
                                  </Button>
                                </div>
                                {exp.description.map((desc, descIndex) => (
                                  <div
                                    key={descIndex}
                                    className="flex gap-2 mb-2"
                                  >
                                    <Input
                                      value={desc}
                                      onChange={(e) =>
                                        updateDescription(
                                          index,
                                          descIndex,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Led a team of 5 developers to build..."
                                    />
                                    {exp.description.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeDescription(index, descIndex)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "education" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Education</h2>
                      <Button onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>

                    {resume.education.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No education added yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add your educational background
                          </p>
                          <Button onClick={addEducation}>
                            Add Your First Education
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {resume.education.map((edu, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                  Education #{index + 1}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEducation(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <Label>Degree *</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "degree",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Bachelor of Science in Computer Science"
                                  />
                                </div>
                                <div>
                                  <Label>Institution *</Label>
                                  <Input
                                    value={edu.institution}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "institution",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Stanford University"
                                  />
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <Input
                                    value={edu.location}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "location",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Stanford, CA"
                                  />
                                </div>
                                <div>
                                  <Label>GPA</Label>
                                  <Input
                                    value={edu.gpa || ""}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "gpa",
                                        e.target.value
                                      )
                                    }
                                    placeholder="3.8"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date *</Label>
                                  <Input
                                    type="month"
                                    value={edu.startDate}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="month"
                                    value={edu.endDate || ""}
                                    onChange={(e) =>
                                      updateEducation(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    disabled={edu.current}
                                    placeholder={edu.current ? "Present" : ""}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Currently Enrolled</Label>
                                  <div className="flex items-center gap-3 mt-2">
                                    <input
                                      type="checkbox"
                                      id={`edu-current-${index}`}
                                      checked={edu.current}
                                      onChange={(e) =>
                                        updateEducation(
                                          index,
                                          "current",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4"
                                    />
                                    <Label
                                      htmlFor={`edu-current-${index}`}
                                      className="mb-0"
                                    >
                                      I am currently studying here
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "projects" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Projects</h2>
                      <Button onClick={addProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </div>

                    {resume.projects.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Code className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No projects added yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add your projects to showcase your skills
                          </p>
                          <Button onClick={addProject}>
                            Add Your First Project
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {resume.projects.map((project, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                  Project #{index + 1}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeProject(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label>Project Title *</Label>
                                  <Input
                                    value={project.title}
                                    onChange={(e) =>
                                      updateProject(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="E-commerce Platform"
                                  />
                                </div>

                                <div>
                                  <Label>Description *</Label>
                                  <Textarea
                                    value={project.description}
                                    onChange={(e) =>
                                      updateProject(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Built a full-stack e-commerce platform with React, Node.js, and MongoDB..."
                                    rows={4}
                                  />
                                </div>

                                <div>
                                  <Label>Technologies</Label>
                                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                    {project.technologies.map(
                                      (tech, techIndex) => (
                                        <Badge
                                          key={techIndex}
                                          variant="secondary"
                                          className="flex items-center gap-1"
                                        >
                                          {tech}
                                          <button
                                            onClick={() =>
                                              removeProjectTechnology(
                                                index,
                                                techIndex
                                              )
                                            }
                                            className="hover:text-red-500"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Add a technology"
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addProjectTechnology(
                                            index,
                                            e.currentTarget.value
                                          );
                                          e.currentTarget.value = "";
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        const input = document.querySelector(
                                          `input[placeholder="Add a technology"]`
                                        ) as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                          addProjectTechnology(
                                            index,
                                            input.value
                                          );
                                          input.value = "";
                                        }
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <Label>Project Link</Label>
                                  <Input
                                    value={project.link || ""}
                                    onChange={(e) =>
                                      updateProject(
                                        index,
                                        "link",
                                        e.target.value
                                      )
                                    }
                                    placeholder="https://github.com/username/project"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "certifications" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Certifications</h2>
                      <Button onClick={addCertification}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Certification
                      </Button>
                    </div>

                    {resume.certifications.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No certifications added yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add your professional certifications
                          </p>
                          <Button onClick={addCertification}>
                            Add Your First Certification
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {resume.certifications.map((cert, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                  Certification #{index + 1}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCertification(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Certification Name *</Label>
                                  <Input
                                    value={cert.name}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="AWS Certified Solutions Architect"
                                  />
                                </div>
                                <div>
                                  <Label>Issuing Organization *</Label>
                                  <Input
                                    value={cert.issuer}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "issuer",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Amazon Web Services"
                                  />
                                </div>
                                <div>
                                  <Label>Date Earned *</Label>
                                  <Input
                                    type="month"
                                    value={cert.date}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "date",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Credential ID</Label>
                                  <Input
                                    value={cert.credentialId || ""}
                                    onChange={(e) =>
                                      updateCertification(
                                        index,
                                        "credentialId",
                                        e.target.value
                                      )
                                    }
                                    placeholder="ABC123456"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "languages" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Languages</h2>
                      <Button onClick={addLanguage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Language
                      </Button>
                    </div>

                    {resume.languages.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No languages added yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add languages you speak
                          </p>
                          <Button onClick={addLanguage}>
                            Add Your First Language
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {resume.languages.map((lang, index) => (
                          <Card key={index}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold">
                                  Language #{index + 1}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLanguage(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Language *</Label>
                                  <Input
                                    value={lang.language}
                                    onChange={(e) =>
                                      updateLanguage(
                                        index,
                                        "language",
                                        e.target.value
                                      )
                                    }
                                    placeholder="English"
                                  />
                                </div>
                                <div>
                                  <Label>Proficiency Level *</Label>
                                  <Select
                                    value={lang.proficiency}
                                    onValueChange={(value) =>
                                      updateLanguage(
                                        index,
                                        "proficiency",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select proficiency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Native">
                                        Native
                                      </SelectItem>
                                      <SelectItem value="Fluent">
                                        Fluent
                                      </SelectItem>
                                      <SelectItem value="Intermediate">
                                        Intermediate
                                      </SelectItem>
                                      <SelectItem value="Basic">
                                        Basic
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
