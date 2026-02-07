import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CaretRight,
  ListChecks,
  ChatCircle
} from "@phosphor-icons/react";
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

const recentBookings = [
  {
    name: "Harbor Loft",
    detail: "Venue hold confirmed",
    date: "May 15, 2025"
  },
  {
    name: "Northline Catering Studio",
    detail: "Menu tasting request submitted",
    date: "May 18, 2025"
  }
];

const vendorRequests = [
  {
    title: "Lighting package revision",
    sender: "Summit AV Collective"
  },
  {
    title: "Floorplan dimensions follow-up",
    sender: "Harbor Loft"
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
          { label: "Vendor requests", value: "6", icon: ChatCircle },
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
                  <CaretRight className="h-4 w-4 text-gray-400" />
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
              <Button asChild className="w-full justify-between rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
                <Link to="/dashboard/ai-planner">
                  Open AI planner
                  <CaretRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-full">
                <Link to="/dashboard/events">
                  View events
                  <CaretRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between rounded-full">
                <Link to="/dashboard/create">
                  Create event
                  <CaretRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent bookings</h2>
            <div className="mt-4 space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.name}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-gray-900">{booking.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{booking.detail}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{booking.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Vendor messages</h2>
            <div className="mt-4 space-y-3">
              {vendorRequests.map((request) => (
                <div
                  key={request.title}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-gray-900">{request.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{request.sender}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHome;
