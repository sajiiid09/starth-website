import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Users, 
  DollarSign, 
  MessageSquare,
  X,
  ExternalLink,
  Award,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ServiceProviderCard({ provider, onRequestQuote }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleWebsiteClick = (e) => {
    e.stopPropagation();
    const url = provider.website || provider.maps_url || 
      (provider.google_place_id ? `https://www.google.com/maps/place/?q=place_id:${provider.google_place_id}` : '#');
    window.open(url, '_blank');
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    alert(`Starting conversation with ${provider.name}. (This would open the messaging platform in a full app)`);
  };

  const handleRequestPricing = (e) => {
    e.stopPropagation();
    alert(`Pricing request sent to ${provider.name}. (This would trigger a quote request in a full app)`);
  };

  const categoryColors = {
    catering: "bg-orange-100 text-orange-800",
    photography_videography: "bg-purple-100 text-purple-800",
    event_technology: "bg-blue-100 text-blue-800",
    florist: "bg-green-100 text-green-800",
    entertainment_media: "bg-pink-100 text-pink-800",
    transportation: "bg-indigo-100 text-indigo-800",
    decor: "bg-yellow-100 text-yellow-800",
    security_bouncers: "bg-red-100 text-red-800",
    cleaning_housekeeping: "bg-gray-100 text-gray-800",
    bakery_cakes: "bg-rose-100 text-rose-800"
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                {provider.name}
              </h3>
              <Badge className={categoryColors[provider.category] || "bg-gray-100 text-gray-800"}>
                {provider.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service Provider'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{provider.rating}</span>
            </div>
          </div>

          {/* Services */}
          {provider.services && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {provider.services.slice(0, 2).map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {provider.services.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.services.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Coverage Area */}
          {provider.coverage_regions && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{provider.coverage_regions.slice(0, 2).join(", ")}</span>
              {provider.coverage_regions.length > 2 && (
                <span>+{provider.coverage_regions.length - 2} more</span>
              )}
            </div>
          )}

          {/* Pricing */}
          {provider.rate_card_json && (
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>From ${provider.rate_card_json.base_price?.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="relative">
              <button
                onClick={() => setShowDetails(false)}
                className="absolute -top-2 -right-2 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogHeader>
          
          {/* Header Info */}
          <div className="space-y-2 -mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={provider.source === 'google' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}>
                {provider.source === 'google' ? 'Google Places' : 'Marketplace'}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{provider.rating}</span>
                <span className="text-gray-500">({provider.google_reviews || '8'} reviews)</span>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {provider.name}
            </DialogTitle>
            <Badge className={categoryColors[provider.category] || "bg-gray-100 text-gray-800"}>
              {provider.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Service Provider'}
            </Badge>
          </div>
          
          {/* Services */}
          {provider.services && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Services Offered</h3>
              <div className="grid grid-cols-1 gap-2">
                {provider.services.map((service, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coverage Areas */}
          {provider.coverage_regions && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Coverage Areas</h3>
              <div className="flex flex-wrap gap-2">
                {provider.coverage_regions.map((region, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          {provider.rate_card_json && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Starting Rates</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    ${provider.rate_card_json.base_price?.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    {provider.rate_card_json.per_person ? 'per person' : 
                     provider.rate_card_json.hourly_rate ? 'per hour' : 
                     provider.rate_card_json.per_event ? 'per event' : 'starting rate'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Google Attribution */}
          {(provider.source === 'google' || provider.google_place_id) && (
            <div className="text-xs text-gray-500 italic">
              Powered by Google
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleWebsiteClick}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMessageClick}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRequestPricing}
              className="flex-1"
            >
              Request Pricing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}