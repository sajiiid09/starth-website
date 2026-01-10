import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserCreateEvent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Create
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Start a new event</h1>
        <p className="mt-2 text-sm text-gray-600">
          Capture the basics and we’ll help build the plan.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="eventName">Event name</Label>
            <Input id="eventName" placeholder="Spring Launch" />
          </div>
          <div>
            <Label htmlFor="eventDate">Event date</Label>
            <Input id="eventDate" type="date" />
          </div>
          <div>
            <Label htmlFor="eventLocation">Location</Label>
            <Input id="eventLocation" placeholder="Austin, TX" />
          </div>
          <Button className="rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
            Save draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreateEvent;
