// components/common/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import JobMatcher from "@/components/header/JobMatcher"; // Add this import
import { Bell, Search, User, Briefcase, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search/jobs?q=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Open Door</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/jobs"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Companies
              </Link>
              {user?.role === "recruiter" && (
                <>
                  <Link
                    href="/recruiter/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/recruiter/jobs/new"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Post Job
                  </Link>
                </>
              )}
              {user?.role === "candidate" && (
                <>
                  <Link
                    href="/candidate/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/candidate/resume"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Resume
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs, companies, skills..."
                className="pl-10 pr-4 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Job Matcher (Candidate Only) */}
            <JobMatcher />

            {/* Search Icon for Mobile */}
            <button className="lg:hidden p-2">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            {user && (
              <button className="relative p-2">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-primary capitalize">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}/profile`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}/settings`}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}/dashboard`}>Dashboard</Link>
                  </DropdownMenuItem>
                  {user.role === "candidate" && (
                    <DropdownMenuItem asChild>
                      <Link href="/candidate/matches">Job Matches</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/jobs"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Companies
              </Link>
              {!user && (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
