export function formatExperienceLevel(level: string): string {
  const levels: Record<string, string> = {
    'entry': 'Entry Level',
    'mid': 'Mid Level',
    'senior': 'Senior Level',
    'executive': 'Executive',
  };
  return levels[level] || level;
}

export function formatJobType(type: string): string {
  const types: Record<string, string> = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    'contract': 'Contract',
    'internship': 'Internship',
    'remote': 'Remote',
  };
  return types[type] || type;
}

export function formatApplicationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'reviewed': 'Reviewed',
    'shortlisted': 'Shortlisted',
    'rejected': 'Rejected',
    'hired': 'Hired',
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'reviewed': 'bg-blue-100 text-blue-800',
    'shortlisted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'hired': 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}