import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  message, 
  className, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}