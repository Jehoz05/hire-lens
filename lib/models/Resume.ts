// lib/models/Resume.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
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
  lastUpdated: Date;
  isDefault: boolean;
  isParsed: boolean;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      location: { type: String, required: true },
      portfolio: String,
      linkedin: String,
      github: String,
    },
    summary: {
      type: String,
      required: true,
      default: "",
    },
    skills: [
      {
        category: { type: String, required: true, default: "Technical" },
        items: [{ type: String }],
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: String,
        current: { type: Boolean, default: false },
        description: [{ type: String }],
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        location: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: String,
        current: { type: Boolean, default: false },
        gpa: String,
        achievements: [{ type: String }],
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String }],
        link: String,
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String, required: true },
        credentialId: String,
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ["Native", "Fluent", "Intermediate", "Basic"],
          required: true,
        },
      },
    ],
    template: {
      type: String,
      default: "modern",
      enum: ["modern", "classic", "creative", "minimal"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isParsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default resume per user
resumeSchema.index(
  { userId: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

export const Resume =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", resumeSchema);

// Export the interface for use in components
export type ResumeData = Omit<
  IResume,
  keyof Document | "userId" | "lastUpdated" | "isDefault" | "isParsed"
>;
