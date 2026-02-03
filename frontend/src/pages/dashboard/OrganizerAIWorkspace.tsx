import React from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const OrganizerAIWorkspace: React.FC = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-light p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Strathwell AI
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Ready to plan</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Your dashboard is now centered around a dedicated AI planning workspace.
        </p>
      </section>

      <Card className="border border-dashed border-slate-300 bg-white/90 shadow-sm">
        <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-brand-teal/10 p-3">
            <Sparkles className="h-6 w-6 text-brand-teal" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            AI Workspace (UI coming in Phase 2+)
          </h2>
          <p className="max-w-xl text-sm text-slate-600">
            We&apos;re setting up the new workspace shell first, then layering in interactive AI
            tooling.
          </p>
          {/* TODO: Add the chat experience and right-side planning context panel in Phase 2. */}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizerAIWorkspace;
