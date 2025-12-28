import { cn } from '@/lib/utils/helpers';
import { FileText, Search, Briefcase } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'search' | 'briefcase';
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon = 'file',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const icons = {
    file: FileText,
    search: Search,
    briefcase: Briefcase,
  };

  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
}