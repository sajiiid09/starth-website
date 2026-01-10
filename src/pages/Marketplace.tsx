import React from "react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import { dummyMarketplaceItems } from "@/data/dummyMarketplace";

const MarketplacePage: React.FC = () => {
  return (
    <div className="pb-24 pt-10">
      <Container>
        <FadeIn className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-teal">
            Marketplace
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-dark md:text-5xl">
            Marketplace Essentials
          </h1>
          <p className="mt-4 text-base text-brand-dark/70 md:text-lg">
            Discover venues, vendors, and production partners curated for standout events.
          </p>
        </FadeIn>

        <FadeIn className="mt-12" staggerChildren={0.08} childSelector=".marketplace-card">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dummyMarketplaceItems.map((item) => (
              <div key={item.id} className="marketplace-card h-full">
                <MarketplaceCard item={item} />
              </div>
            ))}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default MarketplacePage;
