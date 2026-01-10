import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type VendorCardData = {
  name: string;
  category: string;
  location: string;
  description: string;
  image: string;
};

const VendorCard: React.FC<{ vendor: VendorCardData }> = ({ vendor }) => {
  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-card",
        "transition duration-200 ease-smooth hover:-translate-y-1 hover:border-white/60 hover:bg-white"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/60">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="h-full w-full object-contain p-10 transition duration-300 ease-smooth group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-5">
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
          {vendor.category}
        </Badge>
        <h3 className="text-xl font-semibold text-brand-dark">{vendor.name}</h3>
        <p className="text-sm leading-relaxed text-brand-dark/70">{vendor.description}</p>
        <span className="mt-auto text-sm text-brand-dark/60">{vendor.location}</span>
      </div>
    </div>
  );
};

export default VendorCard;
