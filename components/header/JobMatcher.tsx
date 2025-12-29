// components/header/JobMatcher.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Modal";
import {
  Sparkles,
  TrendingUp,
  Target,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface JobMatch {
  _id: string;
  title: string;
  company: {
    name: string;
  };
  matchScore: number;
  skillsMatched: string[];
  missingSkills: string[];
  suggestions: string[];
}

export default function JobMatcher() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const user = session?.user;

  // Check if user has a resume uploaded
  const hasResume = true; // You'll need to implement this check from your API

  useEffect(() => {
    if (open && user?.role === "candidate" && hasResume) {
      fetchJobMatches();
    }
  }, [open, user, hasResume]);

  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs/match");
      if (response.ok) {
        const data = await response.json();
        setMatches(data.data || []);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error fetching job matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getMatchIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Target className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (user?.role !== "candidate") {
    return null;
  }

  return (
    <>
      {/* Matcher Button in Header */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
            <Sparkles className="h-4 w-4" />
            <span className="hidden lg:inline">Job Matcher</span>
            {matches.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {matches.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Job Matcher
            </DialogTitle>
            <DialogDescription>
              Based on your resume, here are your best job matches
              {lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">
                  Updated: {lastUpdated}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {!hasResume ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Your Resume</h3>
              <p className="text-gray-600 mb-6">
                Upload your resume to get personalized job matches
              </p>
              <Link href="/candidate/resume">
                <Button>Upload Resume</Button>
              </Link>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Finding your perfect matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
              <p className="text-gray-600 mb-6">
                Try updating your resume or broaden your search criteria
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/candidate/resume">
                  <Button variant="outline">Update Resume</Button>
                </Link>
                <Link href="/jobs">
                  <Button>Browse All Jobs</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {matches.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {matches.filter((m) => m.matchScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-600">Excellent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      matches.filter(
                        (m) => m.matchScore >= 60 && m.matchScore < 80
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Good</div>
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                {matches.slice(0, 5).map((match, index) => (
                  <div
                    key={match._id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg mb-1">
                          {match.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {match.company.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getMatchColor(match.matchScore)}>
                          <div className="flex items-center gap-1">
                            {getMatchIcon(match.matchScore)}
                            {match.matchScore}% Match
                          </div>
                        </Badge>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    {match.skillsMatched.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Matched Skills ({match.skillsMatched.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {match.skillsMatched.slice(0, 5).map((skill, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs bg-green-50 text-green-700"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {match.skillsMatched.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.skillsMatched.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {match.missingSkills.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Skills to Improve
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {match.missingSkills.slice(0, 3).map((skill, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-red-50 text-red-700 border-red-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {match.suggestions.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Suggestions: </span>
                        {match.suggestions[0]}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        #{index + 1} of {matches.length}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${match._id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Job
                          </Button>
                        </Link>
                        <Link href={`/jobs/${match._id}/apply`}>
                          <Button size="sm">Apply Now</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              {matches.length > 5 && (
                <div className="text-center pt-4 border-t">
                  <Link href="/candidate/matches">
                    <Button variant="outline" className="w-full">
                      View All {matches.length} Matches
                    </Button>
                  </Link>
                </div>
              )}

              {/* Update Button */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchJobMatches}
                  disabled={loading}
                >
                  <Loader2
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh Matches
                </Button>
                <span className="text-xs">
                  Powered by AI • Updates every hour
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Matcher Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden p-2"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-5 w-5" />
        {matches.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
            {matches.length > 9 ? "9+" : matches.length}
          </Badge>
        )}
      </Button>
    </>
  );
}
