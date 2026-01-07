import React from "react";
import { newsItems } from "@/components/home-v2/config/news";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const NewsTicker: React.FC = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="mt-12 border-t border-brand-dark/10 bg-brand-light/90">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-6 px-4 py-6 text-sm text-brand-dark/70 sm:px-6 lg:px-8">
          {newsItems.map((item) => (
            <span key={item.title} className="flex items-center gap-2">
              <span className="font-semibold text-brand-dark">{item.source}</span>
              <span>{item.title}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  const tickerItems = [...newsItems, ...newsItems];

  return (
    <div className="marquee-wrapper mt-12 overflow-hidden border-t border-brand-dark/10 bg-brand-light/90">
      <div className="marquee-track flex w-max items-center gap-10 px-4 py-6 text-sm text-brand-dark/70">
        {tickerItems.map((item, index) => (
          <a
            key={`${item.title}-${index}`}
            href={item.href}
            className="group flex items-center gap-2 whitespace-nowrap transition duration-250 ease-smooth hover:text-brand-dark"
          >
            <span className="font-semibold text-brand-dark">{item.source}</span>
            <span>{item.title}</span>
            <span className="text-brand-dark/30">•</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
