'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import {
  Home,
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  User,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/companies', icon: Users, label: 'Companies' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <nav className="sticky top-16 z-40 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-secondary hover:text-foreground",
                  "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search jobs, people, companies..."
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* User Menu */}
          {session?.user && (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">
                {session.user.name}
              </span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}