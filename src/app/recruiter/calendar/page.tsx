"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "interview" | "meeting" | "deadline" | "reminder";
  candidate?: {
    name: string;
    role: string;
  };
  date: string;
  time: string;
  duration: string;
  location: string;
  mode: "in-person" | "video" | "phone";
  status: "scheduled" | "completed" | "cancelled";
  color: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Technical Interview - John Doe",
    type: "interview",
    candidate: {
      name: "John Doe",
      role: "Senior Frontend Developer",
    },
    date: "2024-01-15",
    time: "10:00 AM",
    duration: "1 hour",
    location: "Conference Room A",
    mode: "in-person",
    status: "scheduled",
    color: "#0077b5",
  },
  {
    id: "2",
    title: "HR Screening - Jane Smith",
    type: "interview",
    candidate: {
      name: "Jane Smith",
      role: "UX Designer",
    },
    date: "2024-01-15",
    time: "2:00 PM",
    duration: "45 minutes",
    location: "Google Meet",
    mode: "video",
    status: "scheduled",
    color: "#00a866",
  },
  {
    id: "3",
    title: "Team Sync Meeting",
    type: "meeting",
    date: "2024-01-16",
    time: "11:00 AM",
    duration: "30 minutes",
    location: "Team Room",
    mode: "in-person",
    status: "scheduled",
    color: "#7950f2",
  },
  {
    id: "4",
    title: "Application Deadline",
    type: "deadline",
    date: "2024-01-17",
    time: "5:00 PM",
    duration: "-",
    location: "Online",
    mode: "in-person",
    status: "scheduled",
    color: "#ff6b6b",
  },
  {
    id: "5",
    title: "Follow-up Call - Mike Johnson",
    type: "interview",
    candidate: {
      name: "Mike Johnson",
      role: "Full Stack Developer",
    },
    date: "2024-01-18",
    time: "3:30 PM",
    duration: "30 minutes",
    location: "Phone",
    mode: "phone",
    status: "scheduled",
    color: "#ff922b",
  },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<string>("2024-01-15");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "recruiter") {
      router.push("/candidate/dashboard");
      return;
    }
  }, [session, status, router]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${(currentMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    calendarDays.push({
      day,
      date: dateStr,
      isToday:
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear,
      isSelected: selectedDate === dateStr,
      events: getEventsForDate(dateStr),
    });
  }

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              Manage interviews, meetings, and deadlines
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-xl">
                      {months[currentMonth]} {currentYear}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={view === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("month")}
                    >
                      Month
                    </Button>
                    <Button
                      variant={view === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("week")}
                    >
                      Week
                    </Button>
                    <Button
                      variant={view === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setView("day")}
                    >
                      Day
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center font-medium text-sm py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`min-h-24 border rounded-lg p-2 ${
                        dayInfo?.isToday
                          ? "bg-primary/10 border-primary"
                          : dayInfo?.isSelected
                          ? "bg-secondary border-primary"
                          : "border-border"
                      } ${
                        !dayInfo
                          ? "opacity-0"
                          : "cursor-pointer hover:bg-secondary"
                      }`}
                      onClick={() => dayInfo && setSelectedDate(dayInfo.date)}
                    >
                      {dayInfo && (
                        <>
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={`text-sm font-medium ${
                                dayInfo.isToday ? "text-primary" : ""
                              }`}
                            >
                              {dayInfo.day}
                            </span>
                            {dayInfo.events.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {dayInfo.events.length}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {dayInfo.events.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded truncate"
                                style={{ backgroundColor: `${event.color}20` }}
                              >
                                <div className="font-medium truncate">
                                  {event.title}
                                </div>
                                <div className="text-muted-foreground">
                                  {event.time}
                                </div>
                              </div>
                            ))}
                            {dayInfo.events.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayInfo.events.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-6">
            {/* Today's Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No events scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            {event.candidate && (
                              <p className="text-sm text-muted-foreground">
                                {event.candidate.name} • {event.candidate.role}
                              </p>
                            )}
                          </div>
                          <Badge
                            style={{ backgroundColor: event.color }}
                            className="text-white"
                          >
                            {event.type}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {event.time} • {event.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.mode === "video" ? (
                              <Video className="h-3 w-3" />
                            ) : event.mode === "phone" ? (
                              <Phone className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Interviews</span>
                    <Badge>5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Meetings</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deadlines</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <Badge variant="default">8</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
