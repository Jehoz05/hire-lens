"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Building,
  MapPin,
  Users,
  Globe,
  Star,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
} from "lucide-react";

interface Company {
  _id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  location: string;
  website?: string;
  employeeCount?: string;
  rating?: number;
  featured?: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

interface Job {
  _id: string;
  title: string;
  type: string;
  location: string;
  experienceLevel: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  isRemote: boolean;
  createdAt: string;
  expiresAt?: string;
  applicantsCount: number;
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchCompanyData();
      fetchCompanyJobs();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data.data);
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const response = await fetch(`/api/companies/${id}/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching company jobs:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Company Not Found</h3>
            <p className="text-gray-600 mb-6">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/companies">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Format salary
  const formatSalary = (salary: {
    min: number;
    max: number;
    currency: string;
  }) => {
    return `${
      salary.currency
    } ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/companies"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </div>

        {/* Company Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-linear-to-r from-primary to-primary/80"></div>
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-6">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-32 w-32 rounded-lg border-4 border-white shadow-lg object-cover bg-white"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-lg border-4 border-white shadow-lg bg-white flex items-center justify-center">
                    <Building className="h-16 w-16 text-primary" />
                  </div>
                )}
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{company.name}</h1>
                    {company.isVerified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {company.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                    {company.employeeCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{company.employeeCount} employees</span>
                      </div>
                    )}
                    {company.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{company.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {company.website && (
                  <Button variant="outline">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Link href={`/jobs?company=${company._id}`}>
                  <Button>
                    <Briefcase className="h-4 w-4 mr-2" />
                    View Jobs ({jobs.length})
                  </Button>
                </Link>
              </div>
            </div>

            {/* Social Links */}
            {company.socialLinks && (
              <div className="flex items-center gap-3 mb-6">
                {company.socialLinks.linkedin && (
                  <a
                    href={company.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {company.socialLinks.twitter && (
                  <a
                    href={company.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-400"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {company.socialLinks.facebook && (
                  <a
                    href={company.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-700"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {company.socialLinks.instagram && (
                  <a
                    href={company.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-pink-50 text-pink-600"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Description */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {company.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Company Details */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Industry:</span>
                          <span className="text-gray-600">
                            {company.industry}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Location:</span>
                          <span className="text-gray-600">
                            {company.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Founded:</span>
                          <span className="text-gray-600">
                            {formatDate(company.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {company.employeeCount && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Company Size:</span>
                            <span className="text-gray-600">
                              {company.employeeCount}
                            </span>
                          </div>
                        )}
                        {company.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">Rating:</span>
                            <span className="text-gray-600">
                              {company.rating}/5
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Open Positions:</span>
                          <span className="text-gray-600">{jobs.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats & Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Jobs</span>
                      <span className="font-bold text-lg">{jobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Jobs</span>
                      <span className="font-bold text-lg">
                        {
                          jobs.filter(
                            (j) =>
                              !j.expiresAt || new Date(j.expiresAt) > new Date()
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remote Jobs</span>
                      <span className="font-bold text-lg">
                        {jobs.filter((j) => j.isRemote).length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {company.contactEmail && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${company.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {company.contactEmail}
                        </a>
                      </div>
                      {company.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <a
                            href={`tel:${company.contactPhone}`}
                            className="text-primary hover:underline"
                          >
                            {company.contactPhone}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Open Positions at {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No open positions
                    </h3>
                    <p className="text-gray-600">
                      This company doesn't have any active job postings at the
                      moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job._id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                              <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <Badge variant="outline">{job.type}</Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {job.location}
                                  {job.isRemote && " • Remote"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {job.experienceLevel}
                              </div>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1 mt-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  {formatSalary(job.salary)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm text-gray-500">
                              {job.applicantsCount} applicants
                            </div>
                            <Link href={`/jobs/${job._id}`}>
                              <Button size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {company.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {company.contactEmail && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <a
                          href={`mailto:${company.contactEmail}`}
                          className="text-primary hover:underline"
                        >
                          {company.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.contactPhone && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-50">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Phone</h4>
                        <a
                          href={`tel:${company.contactPhone}`}
                          className="text-primary hover:underline"
                        >
                          {company.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-purple-50">
                        <Globe className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Website</h4>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
