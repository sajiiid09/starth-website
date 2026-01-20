import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const VendorSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Business settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your profile and lead preferences.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="vendorName">Business name</Label>
            <Input id="vendorName" placeholder="Lumen AV" />
          </div>
          <div>
            <Label htmlFor="vendorEmail">Contact email</Label>
            <Input id="vendorEmail" type="email" placeholder="team@lumenav.com" />
          </div>
          <Button className="rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSettings;
