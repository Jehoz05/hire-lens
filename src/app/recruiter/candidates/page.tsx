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
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  location?: string;
  phone?: string;
  skills: string[];
  experience?: string;
  education?: string;
  matchScore?: number;
  isFavorite?: boolean;
  resumeUrl?: string;
  appliedJobs: Array<{
    jobId: string;
    jobTitle: string;
    appliedAt: string;
    status: string;
  }>;
  lastApplied?: string;
}

export default function CandidatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }

    if (session?.user?.role === "recruiter") {
      fetchCandidates();
      fetchFavorites();
    }
  }, [session, status, router]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recruiter/candidates");

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await response.json();
      setCandidates(data.data || []);
      setFilteredCandidates(data.data || []);
    } catch (error: any) {
      console.error("Error fetching candidates:", error);
      toast.error(error.message || "Failed to load candidates");
      setCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/recruiter/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.data?.map((fav: any) => fav.candidateId) || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    if (!searchQuery && activeTab === "all") {
      setFilteredCandidates(candidates);
      return;
    }

    let filtered = [...candidates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          `${candidate.firstName} ${candidate.lastName}`
            .toLowerCase()
            .includes(query) ||
          candidate.title?.toLowerCase().includes(query) ||
          candidate.skills.some((skill) =>
            skill.toLowerCase().includes(query)
          ) ||
          candidate.email.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (activeTab === "favorites") {
      filtered = filtered.filter((candidate) =>
        favorites.includes(candidate._id)
      );
    } else if (activeTab === "high-match") {
      filtered = filtered.filter(
        (candidate) => (candidate.matchScore || 0) >= 80
      );
    } else if (activeTab === "recent") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = a.lastApplied ? new Date(a.lastApplied).getTime() : 0;
        const dateB = b.lastApplied ? new Date(b.lastApplied).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredCandidates(filtered);
  }, [searchQuery, activeTab, candidates, favorites]);

  const handleToggleFavorite = async (candidateId: string) => {
    try {
      const response = await fetch(
        `/api/recruiter/candidates/${candidateId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ favorite: !favorites.includes(candidateId) }),
        }
      );

      if (response.ok) {
        setFavorites((prev) =>
          prev.includes(candidateId)
            ? prev.filter((id) => id !== candidateId)
            : [...prev, candidateId]
        );
        toast.success(
          !favorites.includes(candidateId)
            ? "Added to favorites"
            : "Removed from favorites"
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleViewProfile = (candidateId: string) => {
    router.push(`/recruiter/candidates/${candidateId}`);
  };

  const handleContact = (candidateId: string) => {
    // Navigate to messages with this candidate
    router.push(`/recruiter/messages?candidate=${candidateId}`);
  };

  const handleDownloadResume = async (candidateId: string) => {
    try {
      const response = await fetch(`/api/resume/download/${candidateId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Failed to download resume");
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Failed to download resume");
    }
  };

  const stats = {
    total: candidates.length,
    favorites: favorites.length,
    highMatch: candidates.filter((c) => (c.matchScore || 0) >= 80).length,
    contacted: candidates.filter((c) =>
      c.appliedJobs?.some((job) => job.status === "contacted")
    ).length,
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Candidate Pool</h1>
            <p className="text-muted-foreground">
              Discover candidates who have applied to your jobs (
              {candidates.length} candidates)
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/recruiter/jobs")}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              View Your Jobs
            </Button>
            <Button onClick={() => router.push("/recruiter/search/candidates")}>
              <Search className="h-4 w-4 mr-2" />
              Search More Candidates
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
                    High Match (80%+)
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
              placeholder="Search candidates by name, skills, job title, or email..."
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
            <TabsTrigger value="recent">Recently Applied</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {candidates.length === 0
                  ? "No candidates yet"
                  : "No candidates match your search"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {candidates.length === 0
                  ? "Candidates will appear here when they apply to your jobs"
                  : "Try adjusting your search terms or filters"}
              </p>
              {candidates.length === 0 && (
                <Button onClick={() => router.push("/recruiter/jobs/new")}>
                  Post Your First Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={{
                  _id: candidate._id,
                  name: `${candidate.firstName} ${candidate.lastName}`,
                  title: candidate.title || "Not specified",
                  location: candidate.location || "Location not specified",
                  email: candidate.email,
                  phone: candidate.phone || "Not provided",
                  skills: candidate.skills || [],
                  experience:
                    candidate.experience || "Experience not specified",
                  education: candidate.education || "Education not specified",
                  matchScore: candidate.matchScore || 0,
                  isFavorite: favorites.includes(candidate._id),
                  resumeUrl: candidate.resumeUrl,
                  appliedJobs: candidate.appliedJobs || [],
                }}
                onViewProfile={() => handleViewProfile(candidate._id)}
                onContact={() => handleContact(candidate._id)}
                onToggleFavorite={() => handleToggleFavorite(candidate._id)}
                onDownloadResume={() => handleDownloadResume(candidate._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination - Add if needed */}
        {filteredCandidates.length > 20 && (
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
