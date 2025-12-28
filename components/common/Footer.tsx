import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">RecruitPro</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting top talent with amazing opportunities. 
              Your next career move starts here.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>support@recruitpro.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/candidate/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/candidate/resume"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/candidate/applications"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Applications
                </Link>
              </li>
              <li>
                <Link
                  href="/candidate/settings"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h3 className="font-semibold mb-4">For Recruiters</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/recruiter/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/recruiter/jobs/new"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/recruiter/candidates"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Find Candidates
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} RecruitPro. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}