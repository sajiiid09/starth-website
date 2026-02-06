import React, { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Storefront, Funnel, X, SpinnerGap } from "@phosphor-icons/react";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dummyMarketplaceItems } from "@/data/dummyMarketplace";
import type { MarketplaceItem } from "@/data/dummyMarketplace";
import { fetchAllMarketplaceItems } from "@/api/marketplace";
import {
  filterMarketplaceItems,
  getFeaturedMarketplaceItems,
  type MarketplaceFilterState,
  type MarketplaceSortOption
} from "@/utils/marketplaceFilter";

const UserMarketplace: React.FC = () => {
  const [allItems, setAllItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<MarketplaceFilterState>({
    state: "",
    city: "",
    category: "",
    eventType: ""
  });
  const [sortBy, setSortBy] = useState<MarketplaceSortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch marketplace items from API on mount
  useEffect(() => {
    async function loadItems() {
      try {
        const items = await fetchAllMarketplaceItems();
        setAllItems(items.length > 0 ? items : dummyMarketplaceItems);
      } catch {
        setAllItems(dummyMarketplaceItems);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

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
    () => getFeaturedMarketplaceItems(allItems),
    [allItems]
  );

  const marketplaceItems = useMemo(() => {
    if (!hasActiveFilters) {
      return featuredItems;
    }

    return filterMarketplaceItems({
      items: allItems,
      searchQuery: debouncedSearch,
      filters,
      sortBy
    });
  }, [allItems, debouncedSearch, featuredItems, filters, hasActiveFilters, sortBy]);

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

  const activeFilterCount = Object.values(filters).filter(v => v.trim().length > 0).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SpinnerGap className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-brand-teal">
            <Storefront className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Marketplace</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-dark md:text-4xl">
            Find Venues & Vendors
          </h1>
          <p className="mt-2 text-brand-dark/60">
            Discover the perfect venues and service providers for your event.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 rounded-2xl border border-brand-dark/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search venues, services, or locations..."
                className="h-11 rounded-xl border-brand-dark/10 bg-gray-50 pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as MarketplaceSortOption)}>
              <SelectTrigger className="h-11 w-full rounded-xl border-brand-dark/10 md:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button 
              variant="outline" 
              className="h-11 gap-2 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Funnel className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full bg-brand-teal p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-11 gap-1 text-brand-dark/60 hover:text-brand-dark"
                onClick={handleClearFilters}
              >
                <X className="h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-dark/5 pt-4 md:grid-cols-4">
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="rounded-xl border-brand-dark/10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venues</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="decor">Decor & Florals</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.state} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger className="rounded-xl border-brand-dark/10">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.city} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger className="rounded-xl border-brand-dark/10">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boston">Boston</SelectItem>
                  <SelectItem value="Cambridge">Cambridge</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.eventType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger className="rounded-xl border-brand-dark/10">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between text-sm text-brand-dark/60">
          <span>
            {hasActiveFilters 
              ? `${marketplaceItems.length} results found`
              : "Featured venues & vendors"}
          </span>
        </div>

        {/* Results Grid */}
        {marketplaceItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-dark/20 bg-white py-16">
            <Storefront className="mb-4 h-12 w-12 text-brand-dark/20" />
            <h3 className="text-lg font-medium text-brand-dark/70">No results found</h3>
            <p className="mt-1 text-sm text-brand-dark/50">
              Try adjusting your filters or search terms.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleClearFilters}
            >
              Clear all filters
            </Button>
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
      </div>
    </div>
  );
};

export default UserMarketplace;
