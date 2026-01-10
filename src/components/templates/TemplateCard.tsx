import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { DummyTemplate } from "@/data/dummyTemplates";

const TemplateCard: React.FC<{ template: DummyTemplate }> = ({ template }) => {
  return (
    <Link
      to={`/templates/${template.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-card",
        "transition duration-200 ease-smooth hover:-translate-y-1 hover:border-white/60 hover:bg-white"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/60">
        <img
          src={template.image}
          alt={template.title}
          className="h-full w-full object-contain p-10 transition duration-300 ease-smooth group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-5">
        <h3 className="text-xl font-semibold text-brand-dark">{template.title}</h3>
        <p className="text-sm leading-relaxed text-brand-dark/70">{template.description}</p>
        <span className="mt-auto inline-flex items-center text-sm font-medium text-brand-teal">
          View Blueprint →
        </span>
      </div>
    </Link>
  );
};

export default TemplateCard;
