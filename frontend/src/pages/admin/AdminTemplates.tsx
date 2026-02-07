import React, { useEffect, useState } from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Template } from "@/api/entities";

type TemplateItem = {
  id: string;
  name: string;
  status: string;
};

function normalizeTemplate(raw: any): TemplateItem {
  return {
    id: raw.id ?? raw.data?.id ?? crypto.randomUUID(),
    name: raw.name ?? raw.data?.name ?? "Untitled template",
    status: raw.status ?? raw.data?.status ?? "draft",
  };
}

function formatStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    case "pending_review":
    case "pending":
      return "Pending review";
    case "archived":
      return "Archived";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

const AdminTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const raw = await Template.filter();
        setTemplates(raw.map(normalizeTemplate));
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SpinnerGap className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

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
        {templates.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No templates found.</p>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="border-none shadow-soft">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-base font-semibold text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">{formatStatus(template.status)}</p>
                </div>
                <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                  Manage
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTemplates;
