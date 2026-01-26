import React, { useState } from "react";
import TagPill from "@/components/home-v2/primitives/TagPill";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { cn } from "@/lib/utils";
import type { PublicVendor } from "@/data/dummyVendors";

type VendorCardProps = {
  vendor: PublicVendor;
  onViewProfile?: (vendor: PublicVendor) => void;
  onInvite?: (vendor: PublicVendor) => void;
};

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewProfile, onInvite }) => {
  const isVenueOwner = vendor.vendorType === "venue_owner";
  const vendorTypeLabel = isVenueOwner ? "Venue Owner" : "Service Provider";
  const categories = vendor.categories?.slice(0, 3) ?? [];
  const areas = vendor.areas?.slice(0, 2) ?? [];
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-card",
        "transition duration-200 ease-smooth hover:-translate-y-1 hover:border-white/60 hover:bg-white"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-cream/60">
        <img
          src={vendor.heroImage}
          alt={vendor.name}
          className={cn(
            "h-full w-full object-cover transition duration-300 ease-smooth group-hover:scale-105",
            !imageLoaded && "blur-sm"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute left-5 top-5">
          <TagPill variant="dark" size="sm">
            {vendorTypeLabel}
          </TagPill>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
        <div>
          <h3 className="text-xl font-semibold text-brand-dark">{vendor.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-dark/70">{vendor.description}</p>
        </div>
        {isVenueOwner ? (
          <div className="grid gap-2 text-sm text-brand-dark/70">
            <span>
              <span className="font-semibold text-brand-dark">Venue size:</span>{" "}
              {vendor.sqft ? `${vendor.sqft.toLocaleString()} sqft` : "Custom footprint"}
            </span>
            <span>
              <span className="font-semibold text-brand-dark">Guest range:</span>{" "}
              {vendor.guestRange ?? "Flexible"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <TagPill key={category} variant="neutral" size="sm">
                {category}
              </TagPill>
            ))}
            {areas.length > 0 && (
              <TagPill variant="coral" size="sm">
                {areas.join(" • ")}
              </TagPill>
            )}
          </div>
        )}
        <span className="text-sm text-brand-dark/60">{vendor.location}</span>
        <div className="mt-auto flex flex-wrap gap-3">
          <PillButton
            size="sm"
            variant="primary"
            className="min-h-[40px] flex-1"
            onClick={() => onViewProfile?.(vendor)}
          >
            View profile
          </PillButton>
          <PillButton
            size="sm"
            variant="secondary"
            className="min-h-[40px] flex-1"
            onClick={() => onInvite?.(vendor)}
          >
            Invite to blueprint
          </PillButton>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
