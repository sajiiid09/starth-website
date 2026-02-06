import React, { useEffect, useState } from "react";
import { SquaresFour, ArrowRight, Sparkle, SpinnerGap } from "@phosphor-icons/react";
import TemplateCard from "@/components/templates/TemplateCard";
import { fetchAllTemplates } from "@/api/templates";
import { dummyTemplates, type DummyTemplate } from "@/data/dummyTemplates";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UserTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DummyTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllTemplates()
      .then((items) => {
        if (cancelled) return;
        setTemplates(items.length > 0 ? items : dummyTemplates);
      })
      .catch(() => {
        if (!cancelled) setTemplates(dummyTemplates);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleUseTemplate = (templateId: string) => {
    // Navigate to AI planner with the template pre-selected
    navigate(`/dashboard/ai-planner?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 text-brand-teal">
            <SquaresFour className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Templates</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-dark md:text-4xl">
            Event Templates
          </h1>
          <p className="mt-2 text-brand-dark/60">
            Start with a curated template and customize it with AI assistance.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="mb-8 rounded-2xl border border-brand-teal/20 bg-gradient-to-br from-brand-teal/5 to-brand-blue/10 p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/10">
                <Sparkle className="h-6 w-6 text-brand-teal" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-dark">Start from scratch with AI</h3>
                <p className="text-sm text-brand-dark/60">
                  Describe your event and let AI create a custom plan for you.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/ai-planner')}
              className="group bg-brand-teal hover:bg-brand-teal/90"
            >
              Open AI Planner
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <SpinnerGap className="h-8 w-8 animate-spin text-brand-teal" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="group relative cursor-pointer"
                onClick={() => handleUseTemplate(template.id)}
              >
                <TemplateCard template={template} />
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-brand-dark/0 opacity-0 transition-all duration-300 group-hover:bg-brand-dark/40 group-hover:opacity-100">
                  <Button className="bg-white text-brand-dark hover:bg-white/90">
                    Use Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTemplates;
