"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const stats = [
  { label: "Total Messages", value: "0", icon: MessageSquare, trend: "+0%" },
  { label: "Active Users", value: "0", icon: Users, trend: "+0%" },
  { label: "Engagement", value: "0%", icon: TrendingUp, trend: "+0%" },
];

const recentActivity = [
  { id: 1, user: "Welcome to JustChat!", action: "Start by sending a message", time: "Now", avatar: "JC" },
];

const channels = [
  { name: "general", members: 0, unread: 0 },
];

export default function DashboardPage() {
  const { authUser } = useAuthStore();
  const userName = authUser?.fullName?.split(" ")[0] || authUser?.username || "User";
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}. Here&apos;s what&apos;s happening.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          New Channel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="size-3 text-green-500" />
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {activity.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Channels</CardTitle>
                <CardDescription>Your workspace channels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="size-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">#</span>
                    </div>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.members} members</p>
                    </div>
                  </div>
                  {channel.unread > 0 && (
                    <Badge variant="default" className="bg-primary">
                      {channel.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People in your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {authUser ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {authUser.fullName?.split(" ").map(n => n[0]).join("") || authUser.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{authUser.fullName}</p>
                  <p className="text-xs text-muted-foreground">You</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">?</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Not logged in</p>
                  <p className="text-xs text-muted-foreground">Guest</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}