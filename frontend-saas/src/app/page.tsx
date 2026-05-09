"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Users,
  Shield,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Play,
  Sparkles,
  TrendingUp,
  Layers,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Instant delivery with typing indicators, read receipts, and reactions",
  },
  {
    icon: Users,
    title: "Team Workspaces",
    description: "Organize conversations by teams, projects, or departments",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, SSO, and compliance with GDPR",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with global edge deployment",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at TechFlow",
    content: "JustChat transformed how our distributed team communicates. It's the Slack killer we've been waiting for.",
    avatar: "SC",
  },
  {
    name: "Michael Torres",
    role: "Engineering Lead at Scale",
    content: "The workspace feature alone saved us hours of context switching. Clean, fast, and actually works.",
    avatar: "MT",
  },
  {
    name: "Emily Watson",
    role: "Product Manager at Innovate",
    content: "Finally a chat app that doesn't feel bloated. Every feature is useful, nothing is wasteful.",
    avatar: "EW",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 team members",
      "10 GB storage",
      "Basic integrations",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "12",
    description: "For growing teams that need more",
    popular: true,
    features: [
      "Unlimited team members",
      "100 GB storage",
      "Advanced integrations",
      "Priority support",
      "Custom workspaces",
      "Analytics dashboard",
    ],
  },
  {
    name: "Enterprise",
    price: "49",
    description: "For organizations that need it all",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "SSO & SAML",
      "24/7 dedicated support",
      "Custom contracts",
      "Audit logs",
    ],
  },
];

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">JustChat</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="size-3 mr-1" />
            Now with AI-powered responses
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Team communication,
            <br />
            <span className="text-primary">reimagined</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The modern chat platform built for speed, security, and seamless collaboration. 
            Connect your team across workspaces with enterprise-grade features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/signup">
                Start Free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="size-4" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image / Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500" />
                  <div className="size-3 rounded-full bg-yellow-500" />
                  <div className="size-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-muted-foreground ml-2">JustChat Preview</span>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="size-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Modern chat interface</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">2M+</div>
              <div className="text-sm text-muted-foreground mt-1">Messages/Day</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground mt-1">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to make team communication effortless and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your team communication?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Join thousands of teams already using JustChat to collaborate better.
            </p>
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-primary shadow-lg" : ""}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-6">
                    ${plan.price}
                    <span className="text-muted-foreground text-base font-normal">/mo</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-muted-foreground text-lg">
              See what our customers have to say about JustChat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                  <MessageSquare className="size-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">JustChat</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern team communication for the modern workplace.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 JustChat. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Globe className="size-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Lock className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}