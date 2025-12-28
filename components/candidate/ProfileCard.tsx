'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  Edit,
  Check,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ProfileCardProps {
  user: {
    name: string;
    title?: string;
    location?: string;
    email: string;
    phone?: string;
    bio?: string;
    skills: string[];
    experience?: Array<{
      title: string;
      company: string;
      duration: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
  };
  editable?: boolean;
}

export default function ProfileCard({ user, editable = false }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Profile Overview</CardTitle>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user.name}</h3>
            {user.title && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {user.title}
              </p>
            )}
            {user.location && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <div>
            <h4 className="font-medium mb-2">About</h4>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        )}

        {/* Skills */}
        <div>
          <h4 className="font-medium mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience */}
        {user.experience && user.experience.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience
            </h4>
            <div className="space-y-3">
              {user.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <div className="font-medium">{exp.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {exp.company}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {exp.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {user.education && user.education.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </h4>
            <div className="space-y-3">
              {user.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <div className="font-medium">{edu.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {edu.institution}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {edu.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}