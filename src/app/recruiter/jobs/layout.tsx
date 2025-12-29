import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Postings - RecruitPro",
  description: "Manage your job postings and track applications",
};

interface JobsLayoutProps {
  children: ReactNode;
}

export default function JobsLayout({ children }: JobsLayoutProps) {
  return children;
}
