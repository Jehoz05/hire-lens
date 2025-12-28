import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  resume: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Date;
  reviewedAt?: Date;
  recruiterNotes?: string;
  interviewSchedule?: {
    date: Date;
    time: string;
    type: 'phone' | 'video' | 'in-person';
    location?: string;
    link?: string;
  };
  matchingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    recruiterNotes: String,
    interviewSchedule: {
      date: Date,
      time: String,
      type: {
        type: String,
        enum: ['phone', 'video', 'in-person'],
      },
      location: String,
      link: String,
    },
    matchingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick queries
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ matchingScore: -1 });

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);