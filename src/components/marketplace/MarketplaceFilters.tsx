import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cityOptions = {
  MA: [
    "Boston", "Cambridge", "Worcester", "Springfield", "Salem", "Plymouth",
    "Northampton", "Amherst", "Lenox", "Pittsfield"
  ],
  NY: [
    "New York", "Brooklyn", "Flushing", "Bronx", "Staten Island", "Albany", 
    "Saratoga Springs", "Cooperstown", "Geneva", "Ithaca", "Rochester", 
    "Buffalo", "Niagara Falls", "Alexandria Bay", "Blue Mountain Lake", 
    "Ticonderoga", "Syracuse", "Corning", "Watkins Glen", "Elmira", 
    "Hyde Park", "New Windsor", "New Paltz", "Garrison", "Beacon"
  ],
  CA: [
    "Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"
  ]
};

const serviceCategories = [
  "Venue",
  "Food & Beverage",
  "Decor", 
  "Entertainment & Media",
  "Transportation",
  "Beauty and Fashion",
  "Catering",
  "Event Management",
  "Rentals",
  "Lighting & Effects",
  "Invitations & Printing",
  "Jewelry & Accessories",
  "Gifts & Souvenirs",
  "Bakery & Cakes",
  "Drinks & Beverages",
  "Security & Bouncers",
  "Event Technology (AV/Stage)",
  "Florist & Fresh Flowers",
  "Photography & Videography",
  "Kids Entertainment",
  "Fireworks & Special Effects",
  "Makeup & Styling",
  "Event Furniture",
  "Audio & DJ Services",
  "Live Performers & Bands",
  "Cultural Performances",
  "Travel & Tour Packages",
  "Destination Management",
  "Health & Wellness",
  "Childcare & Babysitting",
  "Cleaning & Housekeeping",
  "Event Insurance",
  "Transportation – Luxury Cars",
  "Transportation – Limousines",
  "Transportation – Buses",
  "Stage & Set Design"
];

export default function MarketplaceFilters({ filters, setFilters, activeTab }) {
  const handleStateChange = (value) => {
    setFilters(prev => ({
      ...prev,
      state: value === "all" ? "" : value,
      city: "" // Reset city when state changes
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value
    }));
  };

  const currentCities = filters.state ? cityOptions[filters.state] || [] : [];

  if (activeTab === "venues") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={filters.state || "all"} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="MA">Massachusetts</SelectItem>
            <SelectItem value="CA">California</SelectItem>
            <SelectItem value="NY">New York</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.city || "all"} 
          onValueChange={(value) => handleFilterChange("city", value)}
          disabled={!filters.state}
        >
          <SelectTrigger>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {currentCities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.capacity || "all"} onValueChange={(value) => handleFilterChange("capacity", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Size</SelectItem>
            <SelectItem value="small">Under 50</SelectItem>
            <SelectItem value="medium">50-150</SelectItem>
            <SelectItem value="large">150+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priceRange || "all"} onValueChange={(value) => handleFilterChange("priceRange", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="budget">Under $3,000</SelectItem>
            <SelectItem value="mid">$3,000 - $7,000</SelectItem>
            <SelectItem value="premium">$7,000+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.eventType || "all"} onValueChange={(value) => handleFilterChange("eventType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="product_launch">Product Launch</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <SelectItem value="all">All Categories</SelectItem>
          {serviceCategories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.state || "all"} onValueChange={handleStateChange}>
        <SelectTrigger>
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All States</SelectItem>
          <SelectItem value="MA">Massachusetts</SelectItem>
          <SelectItem value="CA">California</SelectItem>
          <SelectItem value="NY">New York</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.city || "all"} 
        onValueChange={(value) => handleFilterChange("city", value)}
        disabled={!filters.state}
      >
        <SelectTrigger>
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
            {currentCities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={filters.eventType || "all"} onValueChange={(value) => handleFilterChange("eventType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Event Types</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="wedding">Wedding</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="conference">Conference</SelectItem>
          </SelectContent>
        </Select>
    </div>
  );
}