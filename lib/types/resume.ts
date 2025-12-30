// lib/types/resume.ts
export interface ResumeData {
  _id?: string;
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
  lastUpdated?: Date;
  isDefault?: boolean;
}
