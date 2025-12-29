// lib/models/User.ts - Simplified
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "recruiter" | "candidate";
  avatar?: string;
  company?: string;
  title?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: any[];
  education?: any[];
  favorites?: any[];
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  authProvider?: "credentials" | "google" | "github" | null;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ["candidate", "recruiter"], required: true },
    avatar: { type: String, default: "" },
    company: { type: String, default: "" },
    title: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    experience: [{ type: Schema.Types.Mixed }],
    education: [{ type: Schema.Types.Mixed }],
    favorites: [{ type: Schema.Types.Mixed }],
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    authProvider: {
      type: String,
      enum: ["credentials", "google", "github", null],
      default: null,
    },
    providerId: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
