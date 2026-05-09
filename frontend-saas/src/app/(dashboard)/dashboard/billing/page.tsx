"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Check, Zap, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for small teams",
    features: ["5 team members", "10 GB storage", "Basic integrations"],
  },
  {
    name: "Pro",
    price: "12",
    popular: true,
    description: "For growing teams",
    features: ["Unlimited members", "100 GB storage", "Advanced integrations", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "49",
    description: "For organizations",
    features: ["Everything in Pro", "Unlimited storage", "SSO & SAML", "24/7 support"],
  },
];

const invoices = [
  { id: "INV-001", date: "Dec 1, 2024", amount: "$12.00", status: "Paid" },
  { id: "INV-002", date: "Nov 1, 2024", amount: "$12.00", status: "Paid" },
  { id: "INV-003", date: "Oct 1, 2024", amount: "$12.00", status: "Paid" },
];

export default function BillingPage() {
  const { authUser } = useAuthStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>{authUser ? `Welcome, ${authUser.fullName}` : "Loading..."}</CardDescription>
            </div>
            <Badge className="bg-primary">Free Plan</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 mb-4">
            <div>
              <p className="font-semibold">$0.00 / month</p>
              <p className="text-sm text-muted-foreground">You are on the free plan</p>
            </div>
            <Button variant="outline">Upgrade</Button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">0 GB</p>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Active Channels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg" : ""}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.name === "Starter" ? "Downgrade" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border mb-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="size-6" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <Button variant="outline">
            <Zap className="size-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">{invoice.amount}</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">{invoice.status}</Badge>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}