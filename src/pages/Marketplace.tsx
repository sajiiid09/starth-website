import React, { useState, useEffect, useCallback } from "react";
import { Venue } from "@/api/entities";
import { Service } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin, Users, Sparkles } from "lucide-react";
import VenueGrid from "../components/marketplace/VenueGrid";
import ServiceProviderGrid from "../components/marketplace/ServiceProviderGrid";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import VendorPartners from "../components/marketplace/VendorPartners";
import useGsapReveal from "@/components/utils/useGsapReveal";

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  
  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    capacity: "",
    priceRange: "",
    category: "",
    eventType: ""
  });
  const headerRef = React.useRef<HTMLDivElement>(null);
  const filterRef = React.useRef<HTMLDivElement>(null);
  const partnersRef = React.useRef<HTMLDivElement>(null);
  const venueGridRef = React.useRef<HTMLDivElement>(null);
  const providerGridRef = React.useRef<HTMLDivElement>(null);

  const filterData = useCallback(() => {
    let filteredV = venues.filter(venue => {
      const matchesSearch = !searchQuery || 
        (venue.name && venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (venue.city && venue.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesState = !filters.state || venue.state === filters.state;
      const matchesCity = !filters.city || venue.city === filters.city;
      
      const matchesCapacity = !filters.capacity || 
        (filters.capacity === "small" && venue.capacity_max < 50) ||
        (filters.capacity === "medium" && venue.capacity_max >= 50 && venue.capacity_max <= 150) ||
        (filters.capacity === "large" && venue.capacity_max > 150);
      
      const matchesPrice = !filters.priceRange ||
        (filters.priceRange === "budget" && venue.rate_card_json?.base_rate < 1500) ||
        (filters.priceRange === "mid" && venue.rate_card_json?.base_rate >= 1500 && venue.rate_card_json?.base_rate <= 5000) ||
        (filters.priceRange === "premium" && venue.rate_card_json?.base_rate > 5000);

      const matchesEventType = !filters.eventType || (venue.tags && venue.tags.includes(filters.eventType));

      return matchesSearch && matchesState && matchesCity && matchesCapacity && matchesPrice && matchesEventType;
    })
      .sort((a, b) => {
        // Prioritize featured venues
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then sort by affordability (lower prices first)
        const priceA = a.rate_card_json?.base_rate || 5000;
        const priceB = b.rate_card_json?.base_rate || 5000;
        return priceA - priceB;
      });
    setFilteredVenues(filteredV);

    let filteredS = services.filter(service => {
      const matchesSearch = !searchQuery ||
        (service.name && service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !filters.category || service.category === filters.category;
      
      const stateMatch = !filters.state || service.state === filters.state || 
        (service.coverage_regions && service.coverage_regions.some(r => r.includes(filters.state)));
      
      const cityMatch = !filters.city || service.city === filters.city ||
        (service.coverage_regions && service.coverage_regions.some(r => 
          r.includes(filters.city) || 
          (r.toLowerCase().startsWith("all of") && filters.state && r.includes(filters.state))
        ));
      
      const matchesEventType = !filters.eventType || (service.event_types && service.event_types.includes(filters.eventType));

      return matchesSearch && matchesCategory && stateMatch && cityMatch && matchesEventType;
    })
      .sort((a, b) => Number(b.featured || false) - Number(a.featured || false));
    setFilteredServices(filteredS);
  }, [venues, services, searchQuery, filters]);

  const loadMarketplaceData = useCallback(async () => {
    setLoading(true);
    try {
      const [venuesData, servicesData] = await Promise.all([
        Venue.filter({ status: "active" }),
        Service.filter({ status: "active" })
      ]);
      
      setVenues(venuesData);
      setServices(servicesData);
      setFilteredVenues(venuesData);
      setFilteredServices(servicesData);
      
    } catch (error) {
      console.error("Error loading marketplace:", error);
      setVenues([]);
      setServices([]);
      setFilteredVenues([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketplaceData();
  }, [loadMarketplaceData]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  useGsapReveal(headerRef);
  useGsapReveal(filterRef);
  useGsapReveal(partnersRef);
  useGsapReveal(venueGridRef, {
    targets: "[data-marketplace-card]",
    stagger: 0.08,
    distance: 24
  });
  useGsapReveal(providerGridRef, {
    targets: "[data-marketplace-card]",
    stagger: 0.08,
    distance: 24
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream/40">
        <Loader2 className="w-8 h-8 animate-spin text-brand-dark/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/40 px-4 py-12 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div ref={headerRef} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/60 px-4 py-2 text-sm font-medium text-brand-teal shadow-soft">
            <Sparkles className="h-4 w-4" />
            Strathwell Marketplace
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-brand-dark md:text-4xl">
            Event Marketplace
          </h1>
          <p className="mt-3 text-lg text-brand-dark/60">
            Affordable, unique spaces and trusted service providers for
            unforgettable events.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-brand-dark/70">
            <span className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2">
              💰 Budget-Friendly: $150-$1,500/day
            </span>
            <span className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2">
              🏢 Unique Spaces: Warehouses, Rooftops, Lofts
            </span>
            <span className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2">
              👥 10-200 Guest Capacity
            </span>
          </div>
        </div>

        <Card ref={filterRef} className="border-none bg-white/80 shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                <Input
                  placeholder="Search venues, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 bg-white pl-10"
                />
              </div>
            </div>

            <div className="mt-6">
              <MarketplaceFilters
                filters={filters}
                setFilters={setFilters}
                activeTab="venues"
              />
            </div>
          </CardContent>
        </Card>

        <div ref={partnersRef}>
          <VendorPartners />
        </div>

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full bg-white/80 p-1 shadow-soft">
            <TabsTrigger value="venues" className="flex items-center gap-2 rounded-full">
              <MapPin className="h-4 w-4" />
              Venues ({filteredVenues.length})
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2 rounded-full">
              <Users className="h-4 w-4" />
              Services ({filteredServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venues">
            <div ref={venueGridRef}>
              <VenueGrid venues={filteredVenues} />
            </div>
          </TabsContent>

          <TabsContent value="providers">
            <div ref={providerGridRef}>
              <ServiceProviderGrid services={filteredServices} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
