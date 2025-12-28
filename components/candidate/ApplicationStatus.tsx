'use client';

import { cn } from '@/lib/utils/helpers';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Users 
} from 'lucide-react';

interface ApplicationStatusProps {
  status: string;
  date?: string;
  nextStep?: string;
  className?: string;
}

export default function ApplicationStatus({
  status,
  date,
  nextStep,
  className,
}: ApplicationStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pending Review',
    },
    reviewed: {
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Under Review',
    },
    shortlisted: {
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Shortlisted',
    },
    interview: {
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      label: 'Interview Stage',
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Not Selected',
    },
    hired: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      label: 'Hired',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-3 p-4 rounded-lg", config.bgColor, className)}>
      <div className={cn("p-2 rounded-full", config.bgColor)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-foreground">{config.label}</div>
        {date && (
          <div className="text-sm text-muted-foreground">
            Applied on {new Date(date).toLocaleDateString()}
          </div>
        )}
        {nextStep && (
          <div className="text-sm font-medium mt-1">
            Next: {nextStep}
          </div>
        )}
      </div>
    </div>
  );
}