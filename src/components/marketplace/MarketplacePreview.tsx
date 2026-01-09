
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Star, 
  ArrowRight, 
  Play,
  Sparkles,
  Building,
  Camera,
  Music,
  Utensils
} from "lucide-react";

const sampleVenues = [
  {
    name: "Innovation Lab Cambridge",
    location: "Cambridge, MA",
    category: "Modern Conference Center",
    capacity: "50-200 guests",
    price: "$5,500/day",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop",
    badges: ["Verified", "Popular"]
  },
  {
    name: "Rooftop Garden NYC", 
    location: "Manhattan, NY",
    category: "Outdoor Venue",
    capacity: "100-300 guests", 
    price: "$8,200/day",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&fit=crop",
    badges: ["Premium", "City Views"]
  },
  {
    name: "Historic Mansion SF",
    location: "San Francisco, CA", 
    category: "Historic Venue",
    capacity: "80-150 guests",
    price: "$6,800/day", 
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&fit=crop",
    badges: ["Historic", "Elegant"]
  }
];

const sampleServices = [
  {
    name: "Elite Catering Co",
    category: "Catering",
    service: "Premium event catering with farm-to-table cuisine",
    price: "From $85/person", 
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&fit=crop",
    icon: Utensils
  },
  {
    name: "Lens & Light Photography",
    category: "Photography", 
    service: "Professional event photography and videography",
    price: "From $2,500/event",
    rating: 4.8, 
    image: "https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=800&fit=crop",
    icon: Camera
  },
  {
    name: "Harmony Events",
    category: "Entertainment",
    service: "Live music, DJ services, and entertainment coordination", 
    price: "From $1,800/event",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&fit=crop", 
    icon: Music
  }
];

export default function MarketplacePreview({ isAuthenticated, onLoginClick, onDemoClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-sm font-medium text-purple-700 mb-6">
            <MapPin className="w-4 h-4" />
            Curated Marketplace
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Perfect Venues &<br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Premium Services
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access our curated collection of verified venues and service providers. Every partner is vetted for quality, reliability, and excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={isAuthenticated ? onDemoClick : onLoginClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-xl font-semibold group"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isAuthenticated ? "Request Demo to Access" : "Explore Full Marketplace"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Sample Venues */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Venues
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From modern conference centers to historic mansions—find your perfect venue
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {sampleVenues.map((venue, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={venue.image} 
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {venue.badges.map((badge, i) => (
                      <Badge key={i} className="bg-white/90 text-gray-700 text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {venue.rating}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{venue.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{venue.category}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {venue.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {venue.capacity}
                    </div>
                    <div className="font-bold text-gray-900">
                      {venue.price}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted Service Providers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Work with verified professionals who deliver exceptional results every time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sampleServices.map((service, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {service.rating}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
                      <service.icon className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{service.name}</h3>
                    <Badge className="mb-2 text-xs bg-gray-100 text-gray-700">
                      {service.category}
                    </Badge>
                    <p className="text-sm text-gray-600 mb-3">{service.service}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-gray-900">
                      {service.price}
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      Learn More
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white">
            <CardContent className="p-12">
              <Building className="w-16 h-16 mx-auto mb-6 text-pink-200" />
              <h3 className="text-3xl font-bold mb-4">
                Ready to Find Your Perfect Match?
              </h3>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join Strathwell to access our full marketplace of verified venues and service providers, complete with AI-powered matching and booking tools.
              </p>
              <Button 
                onClick={isAuthenticated ? onDemoClick : onLoginClick}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold group"
              >
                {isAuthenticated ? "Request Demo" : "Sign In to Explore"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
