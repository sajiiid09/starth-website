import React, { useState, useEffect, useCallback } from "react";
import { Venue } from "@/api/entities";
import { Service } from "@/api/entities";
import { User } from "@/api/entities";
import { DemoRequest } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MapPin, Users, Sparkles } from "lucide-react";
import VenueGrid from "../components/marketplace/VenueGrid";
import ServiceProviderGrid from "../components/marketplace/ServiceProviderGrid";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import DemoRequestModal from "../components/marketing/DemoRequestModal";
import VendorPartners from "../components/marketplace/VendorPartners";

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasRequestedDemo, setHasRequestedDemo] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  
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

  const checkAuthAndDemoStatus = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const demoRequests = await DemoRequest.filter({ email: currentUser.email });
      const approvedDemo = demoRequests.find(req => req.status === 'approved');
      setHasRequestedDemo(!!approvedDemo);
      
      if (!approvedDemo) {
        setLoading(false);
        return;
      }
      
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
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthAndDemoStatus();
  }, [checkAuthAndDemoStatus]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-none shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Marketplace Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              Request a demo to unlock access to our curated marketplace of venues and service providers
            </p>
            <Button 
              onClick={() => setShowDemoModal(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Request Demo Access
            </Button>
          </CardContent>
        </Card>
        <DemoRequestModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
        />
      </div>
    );
  }

  if (!hasRequestedDemo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-none shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Demo Approval Required
            </h2>
            <p className="text-gray-600 mb-6">
              Your demo request is pending approval. Our team will reach out shortly to grant marketplace access.
            </p>
            <p className="text-sm text-gray-500">
              Check back soon or contact us at info@renzairegroup.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Event Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Affordable, unique spaces & trusted service providers for unforgettable events
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-medium text-green-700">
              💰 Budget-Friendly: $150-$1,500/day
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700">
              🏢 Unique Spaces: Warehouses, Rooftops, Lofts
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-blue-700">
              👥 10-200 Guest Capacity
            </div>
          </div>
        </div>

        <Card className="border-none shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search venues, services, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <MarketplaceFilters 
              filters={filters}
              setFilters={setFilters}
              activeTab="venues"
            />
          </CardContent>
        </Card>

        <VendorPartners />

        <Tabs defaultValue="venues" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venues ({filteredVenues.length})
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Services ({filteredServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venues">
            <VenueGrid venues={filteredVenues} />
          </TabsContent>

          <TabsContent value="providers">
            <ServiceProviderGrid services={filteredServices} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}