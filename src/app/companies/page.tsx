"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Search,
  Building,
  MapPin,
  Users,
  Globe,
  Star,
  Briefcase,
  Filter,
  Loader2,
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
  openPositions?: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    industry: "all",
    location: "all",
    size: "all",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/companies");

      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }

      const data = await response.json();
      setCompanies(data.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    // Only show active companies
    if (!company.isActive) return false;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        company.name.toLowerCase().includes(query) ||
        company.industry.toLowerCase().includes(query) ||
        company.description.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query)
      );
    }

    // Apply industry filter
    if (filters.industry !== "all" && company.industry !== filters.industry) {
      return false;
    }

    // Apply location filter
    if (filters.location !== "all") {
      if (
        filters.location === "remote" &&
        !company.location.toLowerCase().includes("remote")
      ) {
        return false;
      }
      if (
        filters.location !== "remote" &&
        !company.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
    }

    // Apply size filter
    if (filters.size !== "all") {
      if (!company.employeeCount) return false;
      const sizeMap: { [key: string]: string[] } = {
        startup: ["1-10", "11-50"],
        small: ["51-200"],
        medium: ["201-1000"],
        large: ["1000+"],
      };
      if (!sizeMap[filters.size].includes(company.employeeCount)) {
        return false;
      }
    }

    return true;
  });

  // Get unique industries for filter dropdown
  const industries = Array.from(
    new Set(companies.map((c) => c.industry))
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary to-primary/90 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Discover Top Companies
          </h1>
          <p className="text-xl text-center mb-8 max-w-2xl mx-auto">
            Explore companies hiring on our platform and find your perfect
            workplace
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search companies by name, industry, or location..."
                className="pl-12 pr-4 py-6 text-lg border-none rounded-full shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry
                  </label>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) =>
                      setFilters({ ...filters, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) =>
                      setFilters({ ...filters, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="united-states">
                        United States
                      </SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Size
                  </label>
                  <Select
                    value={filters.size}
                    onValueChange={(value) =>
                      setFilters({ ...filters, size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="small">Small (51-200)</SelectItem>
                      <SelectItem value="medium">Medium (201-1000)</SelectItem>
                      <SelectItem value="large">Large (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      industry: "all",
                      location: "all",
                      size: "all",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Companies</span>
                    <span className="font-bold">{companies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Companies</span>
                    <span className="font-bold">
                      {companies.filter((c) => c.isActive).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Featured</span>
                    <span className="font-bold">
                      {companies.filter((c) => c.featured).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified</span>
                    <span className="font-bold">
                      {companies.filter((c) => c.isVerified).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Companies Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {filteredCompanies.length} Companies Found
                </h2>
                <p className="text-gray-600">
                  Browse all companies registered on our platform
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue="name">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="featured">Featured First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No companies found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ||
                    filters.industry !== "all" ||
                    filters.location !== "all" ||
                    filters.size !== "all"
                      ? "Try adjusting your search terms or filters"
                      : "No companies are currently registered"}
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setFilters({
                        industry: "all",
                        location: "all",
                        size: "all",
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCompanies.map((company) => (
                  <Card
                    key={company._id}
                    className="hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <CardContent className="p-6">
                      {/* Company Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="h-16 w-16 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center border">
                              <Building className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">
                              <Link
                                href={`/companies/${company._id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {company.name}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {company.industry}
                              </Badge>
                              {company.featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  Featured
                                </Badge>
                              )}
                              {company.isVerified && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {company.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-bold">{company.rating}</span>
                          </div>
                        )}
                      </div>

                      {/* Company Description */}
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {company.description}
                      </p>

                      {/* Company Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
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
                        {company.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Open Positions & Actions */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {company.openPositions || 0} open positions
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/companies/${company._id}`}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                          <Link href={`/jobs?company=${company._id}`}>
                            <Button size="sm">View Jobs</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredCompanies.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
