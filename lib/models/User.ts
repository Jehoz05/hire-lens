import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  experience?: {
    title: string;
    company: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }[];
  education?: {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

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
      current: Boolean,
      description: String,
    }],
    education: [{
      degree: String,
      institution: String,
      fieldOfStudy: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);