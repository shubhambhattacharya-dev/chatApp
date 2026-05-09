"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Link as LinkIcon,
  Save,
  Edit,
  Camera,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { authUser } = useAuthStore();

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || name?.[0]?.toUpperCase() || "?";
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>
        <Button variant="outline">
          <Edit className="size-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <Avatar className="size-32">
                    <AvatarImage src={authUser?.profilePic || "/avatar.png"} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {authUser ? getInitials(authUser.fullName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full size-8">
                    <Camera className="size-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-semibold">{authUser?.fullName || "User"}</h2>
                <p className="text-muted-foreground">@{authUser?.username || "username"}</p>
                <div className="flex gap-2 mt-4">
                  <Badge>Free Plan</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span>{authUser?.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>Joined {formatDate(authUser?.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["Product Management", "Agile", "User Research", "Data Analysis", "Roadmapping"].map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {authUser ? `Member since ${formatDate(authUser.createdAt)}. Welcome to JustChat!` : "Please log in to view your profile."}
              </p>
            </CardContent>
          </Card>

          {/* Work Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue={authUser?.username || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={authUser?.fullName || ""} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={authUser?.email || ""} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authUser ? (
                  <div className="flex items-center justify-between py-2 border-b last:border-0">
                    <p className="text-sm">Joined JustChat</p>
                    <p className="text-xs text-muted-foreground">{formatDate(authUser.createdAt)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}