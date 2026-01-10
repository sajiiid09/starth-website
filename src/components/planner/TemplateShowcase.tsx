import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { dummyTemplates } from "@/data/dummyTemplates";
import FadeIn from "@/components/animations/FadeIn";
import { cn } from "@/lib/utils";

const TemplateShowcase: React.FC = () => {
  const templates = dummyTemplates.slice(0, 4);

  return (
    <section className="mt-16">
      <FadeIn className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Templates
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-brand-dark">
          Jumpstart with a proven blueprint
        </h2>
        <p className="mt-3 text-base text-brand-dark/70">
          Explore curated event templates tailored for fast, confident planning.
        </p>
      </FadeIn>

      <FadeIn className="mt-10" staggerChildren={0.08} childSelector=".template-card">
        <div className="grid gap-6 lg:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "template-card flex flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-card",
                "transition duration-200 ease-smooth hover:-translate-y-1"
              )}
            >
              <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
                    Blueprint
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-brand-dark">
                    {template.title}
                  </h3>
                  <p className="mt-3 text-sm text-brand-dark/70">
                    {template.description}
                  </p>
                  {template.stats && template.stats.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {template.stats.slice(0, 2).map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-full border border-brand-dark/10 bg-brand-cream/60 px-3 py-1 text-xs text-brand-dark/70"
                        >
                          <span className="font-semibold text-brand-dark">{stat.value}</span> {stat.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/templates/${template.id}`}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-brand-teal"
                  >
                    View Blueprint →
                  </Link>
                </div>
                <div className="flex items-center justify-center rounded-2xl border border-white/40 bg-brand-cream/60 p-4">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="h-40 w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/40 px-6 py-4 text-xs text-brand-dark/60">
                <span>Designed by Strathwell</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
};

export default TemplateShowcase;
