'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import JobCard from '@/components/candidate/JobCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Briefcase,
  Users,
  TrendingUp,
  Award,
  Shield,
  Zap,
} from 'lucide-react';

const featuredJobs = [
  {
    _id: '1',
    title: 'Senior Frontend Developer',
    company: {
      name: 'TechCorp',
      logo: '/logo-techcorp.png',
    },
    location: 'Remote',
    type: 'full-time',
    experienceLevel: 'senior',
    salary: {
      min: 120000,
      max: 160000,
      currency: 'USD',
    },
    description: 'We are looking for an experienced Frontend Developer to join our team...',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    createdAt: '2024-01-15T10:30:00Z',
    isActive: true,
  },
  {
    _id: '2',
    title: 'UX/UI Designer',
    company: {
      name: 'DesignStudio',
      logo: '/logo-designstudio.png',
    },
    location: 'New York, NY',
    type: 'full-time',
    experienceLevel: 'mid',
    salary: {
      min: 90000,
      max: 120000,
      currency: 'USD',
    },
    description: 'Join our design team to create beautiful and functional user interfaces...',
    skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping'],
    createdAt: '2024-01-14T14:20:00Z',
    isActive: true,
  },
  {
    _id: '3',
    title: 'DevOps Engineer',
    company: {
      name: 'CloudSystems',
      logo: '/logo-cloudsystems.png',
    },
    location: 'San Francisco, CA',
    type: 'remote',
    experienceLevel: 'senior',
    salary: {
      min: 130000,
      max: 180000,
      currency: 'USD',
    },
    description: 'Build and maintain our cloud infrastructure and CI/CD pipelines...',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    createdAt: '2024-01-13T09:15:00Z',
    isActive: true,
  },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data is protected with enterprise-grade security.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Matching',
    description: 'Get matched with the perfect job using our intelligent algorithms.',
  },
  {
    icon: Users,
    title: 'Top Companies',
    description: 'Connect with leading companies across all industries.',
  },
  {
    icon: Award,
    title: 'Career Growth',
    description: 'Access resources and tools to advance your career.',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/10 to-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your <span className="text-primary">Dream Job</span> or{' '}
              <span className="text-primary">Top Talent</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Connect with opportunities that match your skills and ambitions. 
              Join thousands of professionals and companies already using our platform.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Job title, keyword, or company"
                    className="pl-12 h-14 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8">
                  Search Jobs
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,000+</div>
              <div className="text-muted-foreground">Hired This Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Jobs</h2>
              <p className="text-muted-foreground">Hand-picked opportunities from top companies</p>
            </div>
            <Link href="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the tools and resources you need to succeed in your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="h-12 w-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Take the Next Step?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals and companies who have found success on our platform
              </p>
              <div className="flex gap-4 justify-center">
                {!isAuthenticated ? (
                  <>
                    <Button size="lg" variant="secondary" >
                      <Link href="/auth/register?role=candidate">
                        Sign Up as Candidate
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-primary" >
                      <Link href="/auth/register?role=recruiter">
                        Sign Up as Recruiter
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button size="lg" variant="secondary" >
                    <Link href={user?.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'}>
                      Go to Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}