import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ 
  message, 
  className 
}: SuccessMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 bg-green-50 text-green-800 rounded-lg",
        className
      )}
    >
      <CheckCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}