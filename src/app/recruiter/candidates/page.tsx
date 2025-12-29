"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CandidateCard from "@/components/recruiter/CandidateCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Search,
  Filter,
  Star,
  Download,
  Mail,
  User,
  Briefcase,
} from "lucide-react";

const mockCandidates = [
  {
    _id: "1",
    name: "John Doe",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
    experience: "7+ years in web development",
    education: "BS Computer Science, Stanford University",
    matchScore: 92,
    isFavorite: true,
    resumeUrl: "/resumes/john_doe.pdf",
  },
  {
    _id: "2",
    name: "Jane Smith",
    title: "UX Designer",
    location: "New York, NY",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    skills: [
      "Figma",
      "UI/UX Design",
      "Prototyping",
      "User Research",
      "Adobe Creative Suite",
    ],
    experience: "5+ years in product design",
    education: "MFA Design, Rhode Island School of Design",
    matchScore: 88,
    isFavorite: false,
    resumeUrl: "/resumes/jane_smith.pdf",
  },
  {
    _id: "3",
    name: "Mike Johnson",
    title: "Full Stack Developer",
    location: "Remote",
    email: "mike.johnson@example.com",
    phone: "+1 (555) 456-7890",
    skills: ["Python", "Django", "React", "PostgreSQL", "AWS"],
    experience: "4+ years in full-stack development",
    education: "BS Software Engineering, MIT",
    matchScore: 85,
    isFavorite: true,
    resumeUrl: "/resumes/mike_johnson.pdf",
  },
  {
    _id: "4",
    name: "Sarah Williams",
    title: "Product Manager",
    location: "Austin, TX",
    email: "sarah.williams@example.com",
    phone: "+1 (555) 234-5678",
    skills: [
      "Product Strategy",
      "Agile",
      "User Stories",
      "Roadmapping",
      "Analytics",
    ],
    experience: "6+ years in product management",
    education: "MBA, Harvard Business School",
    matchScore: 78,
    isFavorite: false,
    resumeUrl: "/resumes/sarah_williams.pdf",
  },
];

export default function CandidatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState(mockCandidates);
  const [filteredCandidates, setFilteredCandidates] = useState(mockCandidates);
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>(["1", "3"]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    // Filter candidates based on search and tab
    let filtered = candidates;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply tab filter
    if (activeTab === "favorites") {
      filtered = filtered.filter((candidate) =>
        favorites.includes(candidate._id)
      );
    } else if (activeTab === "high-match") {
      filtered = filtered.filter((candidate) => candidate.matchScore >= 80);
    } else if (activeTab === "recent") {
      // Sort by most recent (for now just keep as is)
      filtered = [...filtered];
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, activeTab, candidates, favorites, session, status, router]);

  const handleToggleFavorite = (candidateId: string) => {
    setFavorites((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleViewProfile = (candidateId: string) => {
    router.push(`/recruiter/candidates/${candidateId}`);
  };

  const handleContact = (candidateId: string) => {
    console.log("Contact candidate:", candidateId);
    // Open contact modal or redirect to messages
  };

  const handleDownloadResume = (candidateId: string) => {
    console.log("Download resume for:", candidateId);
    // Trigger download
  };

  const stats = {
    total: candidates.length,
    favorites: favorites.length,
    highMatch: candidates.filter((c) => c.matchScore >= 80).length,
    contacted: 12,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Candidate Pool</h1>
            <p className="text-muted-foreground">
              Discover and connect with top talent ({candidates.length}{" "}
              candidates)
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search Candidates
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Candidates
                  </div>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.favorites}
                  </div>
                  <div className="text-sm text-muted-foreground">Favorites</div>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.highMatch}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    High Match
                  </div>
                </div>
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.contacted}
                  </div>
                  <div className="text-sm text-muted-foreground">Contacted</div>
                </div>
                <Mail className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name, skills, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Candidates</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="high-match">High Match (80%+)</TabsTrigger>
            <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No candidates found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No candidates match your filters"}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                onViewProfile={() => handleViewProfile(candidate._id)}
                onContact={() => handleContact(candidate._id)}
                onToggleFavorite={() => handleToggleFavorite(candidate._id)}
                onDownloadResume={() => handleDownloadResume(candidate._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredCandidates.length > 0 && (
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
    </DashboardLayout>
  );
}
