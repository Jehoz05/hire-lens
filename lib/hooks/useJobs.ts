'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  createdAt: string;
}

interface UseJobsProps {
  initialJobs?: Job[];
  pageSize?: number;
}

export function useJobs({ initialJobs = [], pageSize = 10 }: UseJobsProps = {}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  const fetchJobs = useCallback(async (filters = {}, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters,
      });

      const response = await fetch(`/api/jobs?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      setJobs(data.data);
      setPagination(data.pagination);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const searchJobs = useCallback(async (query: string, filters = {}) => {
    return fetchJobs({ ...filters, search: query });
  }, [fetchJobs]);

  const fetchJobById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id: string, jobData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete job');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    searchJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    setJobs,
    setError,
  };
}