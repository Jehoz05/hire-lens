import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['recruiter', 'candidate']),
  company: z.string().optional(),
  title: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'Add at least one requirement'),
  responsibilities: z.array(z.string()).min(1, 'Add at least one responsibility'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  salaryMin: z.number().min(0, 'Salary must be positive'),
  salaryMax: z.number().min(0, 'Salary must be positive'),
  currency: z.string().default('USD'),
  salaryPeriod: z.enum(['hourly', 'monthly', 'yearly']).default('yearly'),
  companyName: z.string().min(2, 'Company name is required'),
  companyLogo: z.string().optional(),
  companyDescription: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  skills: z.array(z.string()),
  applicationDeadline: z.string().optional(),
});
export const applicationSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  resumeId: z.string(),
});

export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean(),
      description: z.string().optional(),
    })
  ).optional(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      fieldOfStudy: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      current: z.boolean(),
    })
  ).optional(),
});