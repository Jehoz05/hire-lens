'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Briefcase, Clock, DollarSign, Building, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { formatDate, formatCurrency, truncateText } from '@/lib/utils/helpers';

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
    };
    location: string;
    type: string;
    experienceLevel: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    description: string;
    skills: string[];
    createdAt: string;
    isActive: boolean;
  };
  showApplyButton?: boolean;
  className?: string;
}

export default function JobCard({
  job,
  showApplyButton = true,
  className,
}: JobCardProps) {
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    // Apply logic here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsApplying(false);
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {job.company.logo && (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                  <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {job.company.name}
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant={job.isActive ? 'default' : 'secondary'}
            className={cn(
              'capitalize',
              !job.isActive && 'bg-yellow-100 text-yellow-800'
            )}
          >
            {job.isActive ? 'Active' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-4">
          {truncateText(job.description, 150)}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{job.type.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {formatCurrency(job.salary.min, job.salary.currency)} -{' '}
              {formatCurrency(job.salary.max, job.salary.currency)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{job.experienceLevel}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          Posted {formatDate(job.createdAt)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/jobs/${job._id}`}>
              View Details
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          {showApplyButton && job.isActive && (
            <Button
              size="sm"
              onClick={handleApply}
              disabled={isApplying}
              className="min-w-20"
            >
              {isApplying ? 'Applying...' : 'Apply Now'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}