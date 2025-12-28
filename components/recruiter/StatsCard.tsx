'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: number;
  description?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  description,
  className,
}: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
          )}
          <span className={cn(isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-muted-foreground ml-2">
            {description || 'from last month'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}