import mongoose, { Document, Schema } from 'mongoose';

export interface IParsedResume {
  extractedText: string;
  structuredData: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      fieldOfStudy: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  rawData: any;
  matchScore?: number;
}

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  parsedData: IParsedResume;
  aiSuggestions: {
    improvements: string[];
    missingSkills: string[];
    score: number;
    generatedDate: Date;
  }[];
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    parsedData: {
      extractedText: String,
      structuredData: {
        name: String,
        email: String,
        phone: String,
        summary: String,
        skills: [String],
        experience: [{
          title: String,
          company: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
        }],
        education: [{
          degree: String,
          institution: String,
          fieldOfStudy: String,
          startDate: String,
          endDate: String,
          current: Boolean,
        }],
        certifications: [{
          name: String,
          issuer: String,
          date: String,
        }],
        languages: [{
          language: String,
          proficiency: String,
        }],
      },
      rawData: Schema.Types.Mixed,
      matchScore: Number,
    },
    aiSuggestions: [{
      improvements: [String],
      missingSkills: [String],
      score: Number,
      generatedDate: Date,
    }],
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user and primary resume
resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ 'parsedData.structuredData.skills': 1 });

export const Resume = mongoose.models.Resume || mongoose.model<IResume>('Resume', resumeSchema);