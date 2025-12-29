"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Download,
  MessageSquare,
  Star,
  StarOff,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface CandidateCardProps {
  candidate: {
    _id: string;
    name: string;
    title?: string;
    location?: string;
    email: string;
    phone?: string;
    skills: string[];
    experience?: string;
    education?: string;
    matchScore: number;
    isFavorite?: boolean;
    resumeUrl?: string;
    appliedJobs: Array<{
      jobTitle: string;
      appliedAt: string;
      status: string;
    }>;
  };
  onViewProfile?: () => void;
  onContact?: () => void;
  onToggleFavorite?: () => void;
  onDownloadResume?: () => void;
}

export default function CandidateCard({
  candidate,
  onViewProfile,
  onContact,
  onToggleFavorite,
  onDownloadResume,
}: CandidateCardProps) {
  const [isFavorited, setIsFavorited] = useState(candidate.isFavorite || false);

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {candidate.title && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {candidate.title}
                  </div>
                )}
                {candidate.location && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn("font-medium", getMatchColor(candidate.matchScore))}
            >
              {candidate.matchScore}% Match
            </Badge>
            <button
              onClick={handleFavoriteToggle}
              className="p-1 hover:bg-secondary rounded"
            >
              {isFavorited ? (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.phone}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <div className="text-sm font-medium mb-2">Skills</div>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Experience & Education */}
        {(candidate.experience || candidate.education) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {candidate.experience && (
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Experience</div>
                  <div className="text-muted-foreground">
                    {candidate.experience}
                  </div>
                </div>
              </div>
            )}
            {candidate.education && (
              <div className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Education</div>
                  <div className="text-muted-foreground">
                    {candidate.education}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={onViewProfile}>
            View Profile
          </Button>
          <Button size="sm" variant="outline" onClick={onContact}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Contact
          </Button>
          {candidate.resumeUrl && (
            <Button size="sm" variant="outline" onClick={onDownloadResume}>
              <Download className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
