import React, { useEffect, useState } from "react";
import { SpinnerGap } from "@phosphor-icons/react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import TemplateCard from "@/components/templates/TemplateCard";
import { fetchAllTemplates } from "@/api/templates";
import { dummyTemplates, type DummyTemplate } from "@/data/dummyTemplates";

const Templates: React.FC = () => {
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

  return (
    <div className="pb-20 pt-10">
      <Container>
        <FadeIn className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Templates
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-dark md:text-5xl">
            Event Blueprint Gallery
          </h1>
          <p className="mt-4 text-base text-brand-dark/70 md:text-lg">
            Browse curated event templates designed to accelerate your planning process.
          </p>
        </FadeIn>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <SpinnerGap className="h-8 w-8 animate-spin text-brand-teal" />
          </div>
        ) : (
          <FadeIn className="mt-12" staggerChildren={0.08} childSelector=".template-card">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="template-card h-full">
                  <TemplateCard template={template} />
                </div>
              ))}
            </div>
          </FadeIn>
        )}
      </Container>
    </div>
  );
};

export default Templates;
