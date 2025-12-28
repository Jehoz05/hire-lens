'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Filter, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/helpers';

interface ApplicationFilterProps {
  onFilterChange: (filters: any) => void;
  jobs?: Array<{ _id: string; title: string }>;
}

export default function ApplicationFilter({ onFilterChange, jobs = [] }: ApplicationFilterProps) {
  const [filters, setFilters] = useState({
    search: '',
    job: '',
    status: '',
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
    sortBy: 'newest',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      job: '',
      status: '',
      dateRange: { from: undefined, to: undefined },
      sortBy: 'newest',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <Input
              placeholder="Search by candidate name or email"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Job Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Job</label>
            <Select
              value={filters.job}
              onValueChange={(value) => handleFilterChange('job', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Date Applied</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={(range) => handleDateRangeChange({
                    from: range?.from,
                    to: range?.to,
                  })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="match">Match Score (High to Low)</SelectItem>
                <SelectItem value="name">Candidate Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => onFilterChange(filters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}