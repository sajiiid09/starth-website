import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const events = [
  { name: "Summit Planning Kickoff", date: "Apr 12, 2025", status: "Planning" },
  { name: "Design Sprint Mixer", date: "May 02, 2025", status: "In progress" },
  { name: "Holiday Gala", date: "Dec 15, 2025", status: "Draft" }
];

const UserEvents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Events
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Your events</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage timelines, budgets, and vendor coordination in one place.
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.name} className="border-none shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-base font-semibold text-gray-900">{event.name}</p>
                <p className="text-sm text-gray-500">{event.date}</p>
              </div>
              <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                {event.status}
              </span>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No upcoming events yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserEvents;
