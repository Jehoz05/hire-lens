import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
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
  recruiter: mongoose.Types.ObjectId;
  category: string;
  skills: string[];
  applicationDeadline?: Date;
  isActive: boolean;
  status: "active" | "draft" | "closed";
  views: number;
  applications: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  requirements: [String],
  responsibilities: [String],
  location: String,
  type: String,
  experienceLevel: String,
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: "USD" },
    period: { type: String, default: "yearly" },
  },
  category: String,
  skills: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // 🔥 NEW: Publishing fields
  isActive: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["draft", "published", "closed", "archived"],
    default: "draft",
  },

  applicationDeadline: Date,
  isRemote: Boolean,
  applicantsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for search functionality
jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ isActive: 1, applicationDeadline: 1 });
jobSchema.index({ recruiter: 1 });

export const Job =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);
