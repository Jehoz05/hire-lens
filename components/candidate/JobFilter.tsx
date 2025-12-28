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
import { Slider } from '@/components/ui/Slider';
import { Search, Filter, X } from 'lucide-react';
import { JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES } from '@/lib/utils/constants';

interface JobFilterProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export default function JobFilter({ onFilterChange, initialFilters = {} }: JobFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    location: initialFilters.location || '',
    type: initialFilters.type || '',
    experienceLevel: initialFilters.experienceLevel || '',
    category: initialFilters.category || '',
    minSalary: initialFilters.minSalary || 0,
    maxSalary: initialFilters.maxSalary || 200000,
    remoteOnly: initialFilters.remoteOnly || false,
  });

  const handleInputChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      location: '',
      type: '',
      experienceLevel: '',
      category: '',
      minSalary: 0,
      maxSalary: 200000,
      remoteOnly: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, keywords..."
              value={filters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="City, State, or Remote"
                value={filters.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Type</label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              <Filter className="h-4 w-4" />
              {isExpanded ? 'Hide' : 'Show'} Advanced Filters
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-6 pt-4 border-t">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience Level
                  </label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) => handleInputChange('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Experience</SelectItem>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {JOB_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Salary Range
                  </label>
                  <div className="space-y-4">
                    <Slider
                      value={[filters.minSalary, filters.maxSalary]}
                      min={0}
                      max={500000}
                      step={10000}
                      onValueChange={([min, max]) => {
                        handleInputChange('minSalary', min);
                        handleInputChange('maxSalary', max);
                      }}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${filters.minSalary.toLocaleString()}</span>
                      <span>${filters.maxSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Remote Only */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remoteOnly"
                    checked={filters.remoteOnly}
                    onChange={(e) => handleInputChange('remoteOnly', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="remoteOnly" className="text-sm">
                    Remote jobs only
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={() => onFilterChange(filters)}>
              <Search className="h-4 w-4 mr-2" />
              Search Jobs
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}