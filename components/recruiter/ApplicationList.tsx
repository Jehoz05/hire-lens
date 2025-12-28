'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils/helpers';
import Link from 'next/link';

interface Application {
  _id: string;
  candidate: {
    name: string;
    email: string;
    avatar?: string;
  };
  job: {
    title: string;
    _id: string;
  };
  status: string;
  appliedAt: string;
  matchingScore: number;
  resume: {
    _id: string;
    originalFileName: string;
  };
}

interface ApplicationListProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: string) => Promise<void>;
  onSearch: (query: string) => void;
  onFilterChange: (filter: { status?: string; date?: string }) => void;
}

export default function ApplicationList({
  applications,
  onStatusChange,
  onSearch,
  onFilterChange,
}: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onFilterChange({ status: value === 'all' ? undefined : value, date: dateFilter });
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    onFilterChange({ status: statusFilter === 'all' ? undefined : statusFilter, date: value });
  };

  const getMatchingScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-35">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {application.candidate.avatar ? (
                      <img
                        src={application.candidate.avatar}
                        alt={application.candidate.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {application.candidate.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{application.candidate.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {application.candidate.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/recruiter/jobs/${application.job._id}`}
                    className="text-primary hover:underline"
                  >
                    {application.job.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getMatchingScoreColor(
                      application.matchingScore
                    )} font-medium`}
                  >
                    {application.matchingScore}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                    <Select
                      value={application.status}
                      onValueChange={(value) =>
                        onStatusChange(application._id, value)
                      }
                    >
                      <SelectTrigger className="h-6 w-6 p-0 border-0">
                        <MoreVertical className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>{formatDate(application.appliedAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/recruiter/applications/${application._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Candidate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onStatusChange(application._id, 'shortlisted')}
                      >
                        Shortlist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(application._id, 'rejected')}
                      >
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {applications.length} applications
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <div className="text-muted-foreground">No applications found</div>
          <Button variant="outline" className="mt-4">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}