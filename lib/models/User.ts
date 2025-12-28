import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for TypeScript
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'recruiter' | 'candidate';
  avatar?: string;
  company?: string;
  title?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: Array<{
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }>;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['recruiter', 'candidate'],
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      current: { type: Boolean, default: false },
      description: String,
    }],
    education: [{
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      current: { type: Boolean, default: false },
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add methods to the schema
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

// Create the model
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export { User };