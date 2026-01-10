import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, ListChecks, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const upcomingEvents = [
  {
    name: "Summit Planning Kickoff",
    date: "Apr 12, 2025",
    location: "Austin, TX"
  },
  {
    name: "Design Sprint Mixer",
    date: "May 02, 2025",
    location: "Remote"
  }
];

const UserDashboardHome: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          User Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your events, manage conversations, and keep planning on pace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Events planned", value: "4", icon: Calendar },
          { label: "Messages", value: "12", icon: Sparkles },
          { label: "Budget in progress", value: "2", icon: ListChecks }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <Icon className="h-4 w-4 text-brand-teal" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your upcoming events</h2>
              <Link to="/dashboard/events" className="text-sm text-brand-teal">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                    <p className="text-xs text-gray-500">
                      {event.date} · {event.location}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No upcoming events yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              <Button className="w-full justify-between rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
                Create an event
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between rounded-full">
                Browse templates
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between rounded-full">
                Open AI planner
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHome;
