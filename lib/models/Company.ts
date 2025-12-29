import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  logo: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Company description is required"],
  },
  industry: {
    type: String,
    required: [true, "Industry is required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  website: {
    type: String,
  },
  employeeCount: {
    type: String,
    enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Use Mongoose's timestamps instead of manual middleware
export const Company =
  mongoose.models.Company || mongoose.model("Company", CompanySchema);
