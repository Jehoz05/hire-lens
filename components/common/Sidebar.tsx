'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/helpers';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  Settings,
  BarChart,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const recruiterItems = [
    {
      title: 'Dashboard',
      href: '/recruiter/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Job Postings',
      href: '/recruiter/jobs',
      icon: Briefcase,
      subItems: [
        { title: 'All Jobs', href: '/recruiter/jobs' },
        { title: 'Create New', href: '/recruiter/jobs/new' },
        { title: 'Active Jobs', href: '/recruiter/jobs?status=active' },
        { title: 'Drafts', href: '/recruiter/jobs?status=draft' },
      ],
    },
    {
      title: 'Applications',
      href: '/recruiter/applications',
      icon: FileText,
    },
    {
      title: 'Candidates',
      href: '/recruiter/candidates',
      icon: Users,
    },
    {
      title: 'Messages',
      href: '/recruiter/messages',
      icon: MessageSquare,
      badge: 3,
    },
    {
      title: 'Analytics',
      href: '/recruiter/analytics',
      icon: BarChart,
    },
    {
      title: 'Notifications',
      href: '/recruiter/notifications',
      icon: Bell,
      badge: 5,
    },
  ];

  const candidateItems = [
    {
      title: 'Dashboard',
      href: '/candidate/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Find Jobs',
      href: '/candidate/jobs',
      icon: Briefcase,
    },
    {
      title: 'My Applications',
      href: '/candidate/applications',
      icon: FileText,
    },
    {
      title: 'My Resume',
      href: '/candidate/resume',
      icon: FileText,
    },
    {
      title: 'Messages',
      href: '/candidate/messages',
      icon: MessageSquare,
    },
    {
      title: 'Profile',
      href: '/candidate/profile',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/candidate/settings',
      icon: Settings,
    },
  ];

  const commonItems = [
    {
      title: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
    },
  ];

  const items = session?.user?.role === 'recruiter' ? recruiterItems : candidateItems;
  const user = session?.user;

  return (
    <aside
      className={cn(
        "sticky top-28 h-[calc(100vh-7rem)] border-r bg-background transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background flex items-center justify-center hover:bg-secondary"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* User Profile */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="rounded-full"
                />
              ) : (
                <span className="font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            {!collapsed && (
              <div>
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                  {item.subItems && !collapsed && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-secondary"
                          >
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Common Items */}
          <div className="mt-8 pt-4 border-t">
            <ul className="space-y-1">
              {commonItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Collapsed Info */}
        {collapsed && (
          <div className="p-4 border-t text-center">
            <div className="text-xs text-muted-foreground">Menu</div>
          </div>
        )}
      </div>
    </aside>
  );
}