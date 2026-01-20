import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { cn } from "@/lib/utils";
import { dummyMarketplaceItems } from "@/data/dummyMarketplace";
import {
  filterMarketplaceItems,
  getFeaturedMarketplaceItems,
  type MarketplaceFilterState,
  type MarketplaceSortOption
} from "@/utils/marketplaceFilter";

const MarketplacePage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<MarketplaceFilterState>({
    state: "",
    city: "",
    category: "",
    eventType: ""
  });
  const [sortBy, setSortBy] = useState<MarketplaceSortOption>("relevance");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchValue.trim().length > 0 ||
      Object.values(filters).some((value) => value.trim().length > 0)
    );
  }, [filters, searchValue]);

  const featuredItems = useMemo(
    () => getFeaturedMarketplaceItems(dummyMarketplaceItems),
    []
  );

  const marketplaceItems = useMemo(() => {
    if (!hasActiveFilters) {
      return featuredItems;
    }

    return filterMarketplaceItems({
      items: dummyMarketplaceItems,
      searchQuery: debouncedSearch,
      filters,
      sortBy
    });
  }, [debouncedSearch, featuredItems, filters, hasActiveFilters, sortBy]);

  const handleClearFilters = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setFilters({
      state: "",
      city: "",
      category: "",
      eventType: ""
    });
    setSortBy("relevance");
  };

  const showEmptyState = hasActiveFilters && marketplaceItems.length === 0;

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

        <FadeIn className="mt-10">
          <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.6fr]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search venues, services, or locations"
                  className="h-11 rounded-full border-brand-dark/10 bg-brand-light/70 pl-10 text-brand-dark placeholder:text-brand-dark/40"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as MarketplaceSortOption)}>
                <SelectTrigger className="h-11 rounded-full border-brand-dark/10 bg-brand-light/70 px-4 text-brand-dark">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-brand-dark/10 bg-white">
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_low">Price (Low to High)</SelectItem>
                  <SelectItem value="price_high">Price (High to Low)</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              <PillButton
                size="sm"
                variant="ghost"
                className={cn(
                  "min-h-[44px] w-full border border-brand-dark/10 text-brand-dark/70 hover:text-brand-dark",
                  !hasActiveFilters && "opacity-60"
                )}
                disabled={!hasActiveFilters}
                onClick={handleClearFilters}
              >
                Clear filters
              </PillButton>
            </div>
            <div className="mt-6">
              <MarketplaceFilters filters={filters} setFilters={setFilters} activeTab="providers" />
            </div>
          </div>
        </FadeIn>

        <FadeIn className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-brand-dark/60">
            <span>
              {hasActiveFilters ? "Matching results" : "Featured marketplace picks"}
            </span>
            {hasActiveFilters && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
                {marketplaceItems.length} results
              </span>
            )}
          </div>
        </FadeIn>

        <FadeIn className="mt-8" staggerChildren={0.08} childSelector=".marketplace-card">
          {showEmptyState ? (
            <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/40 p-6 text-center text-sm text-brand-dark/60">
              No matches yet. Try adjusting the category, location, or search terms.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {marketplaceItems.map((item) => (
                <div key={item.id} className="marketplace-card h-full">
                  <MarketplaceCard item={item} />
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </Container>
    </div>
  );
};

export default MarketplacePage;
