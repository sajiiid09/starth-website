import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const templates = [
  { name: "Modern Wedding Gala", status: "Published" },
  { name: "Executive Retreat", status: "Draft" },
  { name: "Fundraiser Gala", status: "Pending review" }
];

const AdminTemplates: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Templates
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Template moderation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review, publish, or archive event blueprints.
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.name} className="border-none shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-base font-semibold text-gray-900">{template.name}</p>
                <p className="text-sm text-gray-500">{template.status}</p>
              </div>
              <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                Manage
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTemplates;
