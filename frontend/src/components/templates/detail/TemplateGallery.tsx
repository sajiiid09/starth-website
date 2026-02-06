import React from "react";

type TemplateGalleryProps = {
  title?: string;
  images: string[];
  templateTitle: string;
};

const altLabels = ["Conference venue", "Banquet setup", "Stage lighting"];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  title = "Reference Gallery",
  images,
  templateTitle
}) => {
  return (
    <section className="rounded-3xl border border-brand-dark/5 bg-white/70 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Visuals
          </p>
          <h2 className="mt-2 text-lg font-semibold text-brand-dark">{title}</h2>
        </div>
        <span className="hidden rounded-full bg-brand-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-dark/60 md:inline-flex">
          Preview
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image}
            className="group relative h-60 overflow-hidden rounded-2xl bg-brand-dark/5 md:h-64"
          >
            <img
              src={image}
              alt={`${templateTitle} reference visual - ${
                altLabels[index] ?? "Event atmosphere"
              }`}
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-brand-dark/50">Reference visuals (demo).</p>
    </section>
  );
};

export default TemplateGallery;
