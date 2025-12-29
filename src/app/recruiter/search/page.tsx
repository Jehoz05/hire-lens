"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Search,
  Filter,
  Download,
  Mail,
  User,
  Briefcase,
  MapPin,
  Star,
  Clock,
  GraduationCap,
  DollarSign,
  CheckCircle,
  Bookmark,
  Eye,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const mockCandidates = [
  {
    id: "1",
    name: "John Doe",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA",
    experience: "7 years",
    education: "BS Computer Science, Stanford",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
    matchScore: 92,
    lastActive: "2 hours ago",
    salaryExpectation: "$120k - $150k",
    noticePeriod: "30 days",
    availability: "Immediate",
    isSaved: true,
    resumeUrl: "/resumes/john_doe.pdf",
  },
  {
    id: "2",
    name: "Jane Smith",
    title: "UX Designer",
    location: "New York, NY",
    experience: "5 years",
    education: "MFA Design, RISD",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    matchScore: 88,
    lastActive: "1 day ago",
    salaryExpectation: "$90k - $120k",
    noticePeriod: "15 days",
    availability: "2 weeks",
    isSaved: false,
    resumeUrl: "/resumes/jane_smith.pdf",
  },
  {
    id: "3",
    name: "Mike Johnson",
    title: "Full Stack Developer",
    location: "Remote",
    experience: "4 years",
    education: "BS Software Engineering, MIT",
    skills: ["Python", "Django", "React", "PostgreSQL", "AWS"],
    matchScore: 85,
    lastActive: "Just now",
    salaryExpectation: "$100k - $130k",
    noticePeriod: "60 days",
    availability: "1 month",
    isSaved: true,
    resumeUrl: "/resumes/mike_johnson.pdf",
  },
  {
    id: "4",
    name: "Sarah Williams",
    title: "Product Manager",
    location: "Austin, TX",
    experience: "6 years",
    education: "MBA, Harvard Business School",
    skills: ["Product Strategy", "Agile", "Roadmapping", "Analytics"],
    matchScore: 78,
    lastActive: "3 days ago",
    salaryExpectation: "$130k - $160k",
    noticePeriod: "45 days",
    availability: "3 weeks",
    isSaved: false,
    resumeUrl: "/resumes/sarah_williams.pdf",
  },
  {
    id: "5",
    name: "David Chen",
    title: "DevOps Engineer",
    location: "Seattle, WA",
    experience: "5 years",
    education: "MS Computer Science, University of Washington",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    matchScore: 90,
    lastActive: "5 hours ago",
    salaryExpectation: "$110k - $140k",
    noticePeriod: "30 days",
    availability: "Immediate",
    isSaved: false,
    resumeUrl: "/resumes/david_chen.pdf",
  },
];

const savedSearches = [
  { id: "1", name: "React Developers", count: 24, lastUsed: "Today" },
  {
    id: "2",
    name: "Senior Product Managers",
    count: 12,
    lastUsed: "2 days ago",
  },
  { id: "3", name: "UX Designers in NY", count: 8, lastUsed: "1 week ago" },
  { id: "4", name: "Full Stack Engineers", count: 18, lastUsed: "3 days ago" },
  { id: "5", name: "Remote Developers", count: 32, lastUsed: "Yesterday" },
];

const experienceOptions = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (5-8 years)" },
  { value: "lead", label: "Lead (8+ years)" },
  { value: "executive", label: "Executive" },
];

const availabilityOptions = [
  { value: "immediate", label: "Immediate" },
  { value: "2weeks", label: "Within 2 weeks" },
  { value: "1month", label: "Within 1 month" },
  { value: "2months", label: "Within 2 months" },
  { value: "3months", label: "Within 3 months" },
];

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState(mockCandidates);
  const [filteredCandidates, setFilteredCandidates] = useState(mockCandidates);
  const [activeTab, setActiveTab] = useState("candidates");
  const [filters, setFilters] = useState({
    location: "",
    experience: "",
    skills: "",
    salaryMin: "",
    salaryMax: "",
    availability: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedSearchName, setSavedSearchName] = useState("");
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    applyFilters();
  }, [session, status, router, filters, searchQuery]);

  const applyFilters = () => {
    setIsLoading(true);

    let filtered = [...candidates];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          candidate.education.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter((candidate) =>
        candidate.location
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    // Apply experience filter
    if (filters.experience) {
      filtered = filtered.filter((candidate) => {
        const expYears = parseInt(candidate.experience);
        switch (filters.experience) {
          case "entry":
            return expYears <= 2;
          case "mid":
            return expYears >= 3 && expYears <= 5;
          case "senior":
            return expYears >= 5 && expYears <= 8;
          case "lead":
            return expYears >= 8;
          case "executive":
            return (
              candidate.title.toLowerCase().includes("director") ||
              candidate.title.toLowerCase().includes("vp") ||
              candidate.title.toLowerCase().includes("chief")
            );
          default:
            return true;
        }
      });
    }

    // Apply availability filter
    if (filters.availability) {
      filtered = filtered.filter((candidate) =>
        candidate.availability.toLowerCase().includes(filters.availability)
      );
    }

    // Apply salary filter
    if (filters.salaryMin || filters.salaryMax) {
      filtered = filtered.filter((candidate) => {
        const salaryMatch =
          candidate.salaryExpectation.match(/\$(\d+)k - \$(\d+)k/);
        if (salaryMatch) {
          const minSalary = parseInt(salaryMatch[1]) * 1000;
          const maxSalary = parseInt(salaryMatch[2]) * 1000;
          const filterMin = filters.salaryMin ? parseInt(filters.salaryMin) : 0;
          const filterMax = filters.salaryMax
            ? parseInt(filters.salaryMax)
            : Infinity;
          return maxSalary >= filterMin && minSalary <= filterMax;
        }
        return true;
      });
    }

    // Apply skills filter
    if (filters.skills) {
      const skillKeywords = filters.skills
        .toLowerCase()
        .split(",")
        .map((s) => s.trim());
      filtered = filtered.filter((candidate) =>
        skillKeywords.every((keyword) =>
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(keyword)
          )
        )
      );
    }

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    setFilteredCandidates(filtered);
    setTimeout(() => setIsLoading(false), 500); // Simulate loading
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleSaveSearch = () => {
    if (!savedSearchName.trim()) {
      alert("Please enter a name for your saved search");
      return;
    }

    const newSearch = {
      id: Date.now().toString(),
      name: savedSearchName,
      count: filteredCandidates.length,
      lastUsed: "Just now",
      filters: { ...filters, searchQuery },
    };

    savedSearches.unshift(newSearch);
    setSavedSearchName("");
    setShowSaveSearch(false);

    // In a real app, save to backend
    console.log("Saved search:", newSearch);
  };

  const handleContactCandidate = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      // In a real app, open contact modal or redirect to messages
      console.log("Opening contact modal for:", candidate.name);
      router.push(`/recruiter/messages?candidate=${candidateId}`);
    }
  };

  const handleSaveCandidate = (candidateId: string) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, isSaved: !candidate.isSaved }
          : candidate
      )
    );
  };

  const handleViewProfile = (candidateId: string) => {
    router.push(`/recruiter/candidates/${candidateId}`);
  };

  const handleResetFilters = () => {
    setFilters({
      location: "",
      experience: "",
      skills: "",
      salaryMin: "",
      salaryMax: "",
      availability: "",
    });
    setSearchQuery("");
  };

  const handleLoadSavedSearch = (searchId: string) => {
    const savedSearch = savedSearches.find((s) => s.id === searchId);
    if (savedSearch) {
      // In a real app, load the saved filters from backend
      console.log("Loading saved search:", savedSearch.name);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Search Candidates</h1>
            <p className="text-muted-foreground">
              Find the perfect talent for your open positions
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            <Button onClick={() => setShowSaveSearch(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skills, job title, or education..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size="sm"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Input
                    placeholder="City, State, or Remote"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  <Select
                    value={filters.experience}
                    onValueChange={(value) =>
                      setFilters({ ...filters, experience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Experience</SelectItem>
                      {experienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Skills
                  </label>
                  <Input
                    placeholder="e.g., React, Python, AWS"
                    value={filters.skills}
                    onChange={(e) =>
                      setFilters({ ...filters, skills: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple skills with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.salaryMin}
                      onChange={(e) =>
                        setFilters({ ...filters, salaryMin: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.salaryMax}
                      onChange={(e) =>
                        setFilters({ ...filters, salaryMax: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Availability
                  </label>
                  <Select
                    value={filters.availability}
                    onValueChange={(value) =>
                      setFilters({ ...filters, availability: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Availability</SelectItem>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Applying Filters..." : "Apply Filters"}
                </Button>
              </CardContent>
            </Card>

            {/* Saved Searches */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Saved Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="p-3 border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                      onClick={() => handleLoadSavedSearch(search.id)}
                    >
                      <div className="font-medium">{search.name}</div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{search.count} candidates</span>
                        <span>{search.lastUsed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="candidates">
                  Candidates ({filteredCandidates.length})
                </TabsTrigger>
                <TabsTrigger value="saved">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved ({candidates.filter((c) => c.isSaved).length})
                </TabsTrigger>
                <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="font-medium">
                  Showing {filteredCandidates.length} of {candidates.length}{" "}
                  candidates
                </span>
                {Object.values(filters).some((f) => f) && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (with filters applied)
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Sorted by: <span className="font-medium">Match Score</span>
              </div>
            </div>

            {/* Candidates List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Loading candidates...</span>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No candidates found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search filters or search terms
                  </p>
                  <Button onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <Card
                    key={candidate.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {candidate.title}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{candidate.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <span>{candidate.experience} experience</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                  <span>{candidate.education}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Available: {candidate.availability}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>{candidate.salaryExpectation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                  <span>Notice: {candidate.noticePeriod}</span>
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="mb-4">
                                <div className="text-sm font-medium mb-2">
                                  Skills
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <Badge
                                className={`px-3 py-1 font-medium ${getMatchColor(
                                  candidate.matchScore
                                )}`}
                              >
                                {candidate.matchScore}% Match
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                Last active: {candidate.lastActive}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t">
                            <Button
                              size="sm"
                              onClick={() => handleViewProfile(candidate.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleContactCandidate(candidate.id)
                              }
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveCandidate(candidate.id)}
                            >
                              {candidate.isSaved ? (
                                <>
                                  <Bookmark className="h-4 w-4 mr-2 fill-current" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Save Candidate
                                </>
                              )}
                            </Button>
                            {candidate.resumeUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  window.open(candidate.resumeUrl, "_blank")
                                }
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Search Modal */}
        {showSaveSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Search Name
                    </label>
                    <Input
                      placeholder="e.g., Senior React Developers in SF"
                      value={savedSearchName}
                      onChange={(e) => setSavedSearchName(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>This search will save:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Search query: {searchQuery || "(none)"}</li>
                      <li>Location: {filters.location || "Any"}</li>
                      <li>Experience: {filters.experience || "Any"}</li>
                      <li>Skills: {filters.skills || "Any"}</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveSearch} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Search
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveSearch(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
