import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Admin settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update system defaults and notification rules.
        </p>
      </div>

      <Card className="border-none shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div>
            <Label htmlFor="supportEmail">Support email</Label>
            <Input id="supportEmail" type="email" placeholder="support@strathwell.com" />
          </div>
          <div>
            <Label htmlFor="approvalSla">Approval SLA (hours)</Label>
            <Input id="approvalSla" type="number" placeholder="48" />
          </div>
          <Button className="rounded-full bg-brand-teal text-brand-light hover:bg-brand-teal/90">
            Save settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
