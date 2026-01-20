import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketplaceItem } from "@/data/dummyMarketplace";

const MarketplaceCard: React.FC<{ item: MarketplaceItem }> = ({ item }) => {
  return (
    <Link
      to={`/marketplace/${item.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-card",
        "transition duration-200 ease-smooth hover:-translate-y-1 hover:border-white/60 hover:bg-white"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/60">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-contain p-10 transition duration-300 ease-smooth group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-5">
        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
          {item.category}
        </Badge>
        <h3 className="text-xl font-semibold text-brand-dark">{item.title}</h3>
        <p className="text-sm leading-relaxed text-brand-dark/70">{item.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between text-sm text-brand-dark/70">
          <span>{item.location}</span>
          <span className="font-semibold text-brand-dark">
            {item.startingPrice || item.priceRange}
          </span>
        </div>
        <span className="inline-flex items-center text-sm font-medium text-brand-teal">
          View details →
        </span>
      </div>
    </Link>
  );
};

export default MarketplaceCard;
