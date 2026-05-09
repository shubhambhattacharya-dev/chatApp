"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useChatStore, Message } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Image,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const users = [
  { id: 1, name: "Alex Rivera", avatar: "AR", status: "online", unread: 2 },
  { id: 2, name: "Maria Santos", avatar: "MS", status: "online", unread: 0 },
  { id: 3, name: "James Wilson", avatar: "JW", status: "offline", unread: 1 },
  { id: 4, name: "Emily Chen", avatar: "EC", status: "online", unread: 0 },
  { id: 5, name: "David Kim", avatar: "DK", status: "offline", unread: 0 },
];

const sampleMessages: Message[] = [
  { _id: "1", senderId: "1", receiverId: "me", message: "Hey, can you review the design mockups?", isRead: true, createdAt: new Date().toISOString() },
  { _id: "2", senderId: "me", receiverId: "1", message: "Sure! I'll take a look right now.", isRead: true, createdAt: new Date().toISOString() },
  { _id: "3", senderId: "1", receiverId: "me", message: "Great! Let me know if you have any questions.", isRead: true, createdAt: new Date().toISOString() },
];

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { authUser } = useAuthStore();
  const { messages, getMessages, sendMessage } = useChatStore();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // For demo, add to local state
    if (selectedUser) {
      await sendMessage(selectedUser.id.toString(), message);
    }
    setMessage("");
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 lg:gap-6">
      {/* Users List - Hidden on mobile when chat is selected */}
      <Card className={cn(
        "w-full lg:w-80 flex-shrink-0 flex flex-col",
        isMobileView ? "hidden lg:flex" : "flex"
      )}>
        <CardContent className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
        <div className="flex-1 overflow-y-auto p-0">
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setSelectedUser(user);
                setIsMobileView(true);
              }}
              className={cn(
                "w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors border-b",
                selectedUser.id === user.id && "bg-muted"
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                {user.status === "online" && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.status === "online" ? "Active now" : "Offline"}
                </p>
              </div>
              {user.unread > 0 && (
                <Badge variant="default" className="bg-primary">{user.unread}</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col min-w-0",
        !isMobileView && "hidden lg:flex"
      )}>
        {/* Chat Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setIsMobileView(false)}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {selectedUser.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedUser.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.status === "online" ? "Active now" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="size-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="size-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="size-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {sampleMessages.map((msg) => {
            const isMe = msg.receiverId === "me" || msg.senderId === "me";
            return (
              <div
                key={msg._id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-[10px] opacity-70">{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      msg.isRead ? (
                        <CheckCheck className="size-3 opacity-70" />
                      ) : (
                        <Check className="size-3 opacity-70" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Image className="size-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button variant="ghost" size="icon">
              <Smile className="size-4" />
            </Button>
            <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}