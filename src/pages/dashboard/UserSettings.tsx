import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const UserSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Profile settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your profile details and notification preferences.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="userName">Name</Label>
            <Input id="userName" placeholder="Alex Morgan" />
          </div>
          <div>
            <Label htmlFor="userEmail">Email</Label>
            <Input id="userEmail" type="email" placeholder="alex@company.com" />
          </div>
          <Button className="rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
