'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface SkillTagProps {
  skill: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function SkillTag({
  skill,
  removable = false,
  onRemove,
  className,
}: SkillTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium",
        className
      )}
    >
      <span>{skill}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="h-4 w-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}