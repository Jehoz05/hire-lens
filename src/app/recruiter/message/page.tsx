"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
} from "lucide-react";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  read: boolean;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    lastActive: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  isActive: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "101",
      name: "John Doe",
      avatar: "",
      role: "Candidate",
      lastActive: "2 hours ago",
    },
    lastMessage: "Looking forward to the interview tomorrow!",
    timestamp: "10:30 AM",
    unread: 2,
    isActive: true,
  },
  {
    id: "2",
    participant: {
      id: "102",
      name: "Jane Smith",
      avatar: "",
      role: "Candidate",
      lastActive: "1 day ago",
    },
    lastMessage: "Thank you for the opportunity!",
    timestamp: "Yesterday",
    unread: 0,
    isActive: false,
  },
  {
    id: "3",
    participant: {
      id: "103",
      name: "Mike Johnson",
      avatar: "",
      role: "Candidate",
      lastActive: "Just now",
    },
    lastMessage: "I have submitted my assignment.",
    timestamp: "10:00 AM",
    unread: 1,
    isActive: true,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender: {
      id: "101",
      name: "John Doe",
      avatar: "",
      role: "Candidate",
    },
    content:
      "Hi! I wanted to follow up on my application for the Frontend Developer position.",
    timestamp: "9:30 AM",
    read: true,
    isOwn: false,
  },
  {
    id: "2",
    sender: {
      id: "recruiter",
      name: "You",
      avatar: "",
      role: "Recruiter",
    },
    content:
      "Hi John! Thanks for following up. We're reviewing applications this week.",
    timestamp: "9:45 AM",
    read: true,
    isOwn: true,
  },
  {
    id: "3",
    sender: {
      id: "101",
      name: "John Doe",
      avatar: "",
      role: "Candidate",
    },
    content:
      "Great! Looking forward to hearing back. When can I expect an update?",
    timestamp: "10:00 AM",
    read: true,
    isOwn: false,
  },
  {
    id: "4",
    sender: {
      id: "recruiter",
      name: "You",
      avatar: "",
      role: "Recruiter",
    },
    content:
      "We'll get back to all candidates by Friday. Is there anything specific you'd like to know about the role?",
    timestamp: "10:15 AM",
    read: true,
    isOwn: true,
  },
  {
    id: "5",
    sender: {
      id: "101",
      name: "John Doe",
      avatar: "",
      role: "Candidate",
    },
    content:
      "Yes, I'm curious about the team structure and tech stack you're using.",
    timestamp: "10:30 AM",
    read: false,
    isOwn: false,
  },
];

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation>(
    mockConversations[0]
  );
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: {
        id: "recruiter",
        name: "You",
        avatar: "",
        role: "Recruiter",
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
      isOwn: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Mark conversation as read
    setConversations((convs) =>
      convs.map((conv) =>
        conv.id === activeConversation.id ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    // In real app, fetch messages for this conversation
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with candidates and team members
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Mark All as Read</Button>
            <Button>New Message</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <Badge variant="secondary">{conversations.length}</Badge>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto h-[calc(100vh-20rem)]">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-secondary transition-colors ${
                      activeConversation.id === conversation.id
                        ? "bg-secondary"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isActive && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium truncate">
                            {conversation.participant.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.participant.role}
                          </Badge>
                          {conversation.unread > 0 && (
                            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {activeConversation.participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {activeConversation.participant.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {activeConversation.participant.role} •{" "}
                      {activeConversation.participant.lastActive}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {!message.isOwn && (
                        <div className="font-medium text-sm mb-1">
                          {message.sender.name}
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs opacity-75">
                          {message.timestamp}
                        </span>
                        {message.isOwn && (
                          <span className="ml-2">
                            {message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
