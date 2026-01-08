import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  DollarSign,
  Star,
  Shield,
  ExternalLink,
  Heart,
  MessageSquare,
  Sparkles // Added Sparkles import
} from "lucide-react";
import SmartImage from "@/components/shared/SmartImage";

// Placeholder for createPageUrl function
const createPageUrl = (path) => {
  return `/${path}`;
};

// Placeholder for FavoriteButton component
const FavoriteButton = ({ entityType, entityId, className }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const toggleFavorite = () => setIsFavorite(!isFavorite);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full ${className}`}
      onClick={toggleFavorite}
    >
      <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
    </Button>
  );
};

// Placeholder for MessageVenueButton component
// This component is no longer used in the VenueGrid after the update, but kept for completeness
const MessageVenueButton = ({ venue, className }) => {
  const handleMessageClick = () => {
    alert(`Opening chat with ${venue.name}`);
  };

  return (
    <Button
      className={`bg-gray-200 hover:bg-gray-300 text-gray-800 ${className}`}
      onClick={handleMessageClick}
    >
      <MessageSquare className="w-4 h-4" />
    </Button>
  );
};

export default function VenueGrid({ venues, onAskAI }) { // Added onAskAI prop
  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
        <p className="text-gray-600">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <Card key={venue.id} className="border-none shadow-lg hover:shadow-xl strathwell-transition overflow-hidden group">
          <div className="relative">
            <SmartImage 
              item={venue}
              type="venue"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              alt={venue.name}
            />

            {venue.featured && (
              <Badge className="absolute top-3 left-3 bg-indigo-600 text-white">
                Featured
              </Badge>
            )}
            <div className="absolute top-3 right-3 flex gap-2">
              <FavoriteButton entityType="venue" entityId={venue.id} className="bg-white/90 backdrop-blur-sm hover:bg-white" />
              {venue.insurance_verified && (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          </div>

          <CardHeader className="p-4">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                {venue.name}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{venue.rating || venue.google_rating || "4.5"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">{venue.city}, {venue.state}</span>
              </div>
              {venue.rate_card_json?.base_rate && venue.rate_card_json.base_rate < 1500 && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  💰 Affordable
                </Badge>
              )}
            </div>

            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
              {venue.description || `Beautiful venue in ${venue.city} perfect for your next event.`}
            </p>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-3 h-3" />
                <span>{venue.capacity_max} capacity</span>
              </div>
              <div className="text-right">
                {venue.rate_card_json?.base_rate ? (
                  <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    <span>{venue.rate_card_json.base_rate.toLocaleString()}</span>
                  </div>
                ) : venue.rate_card_json?.hourly_rate ? (
                  <div className="text-sm font-medium text-gray-700">
                    ${venue.rate_card_json.hourly_rate}/hour
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-700">
                    Contact for pricing
                  </div>
                )}
              </div>
            </div>

            {venue.amenities && (
              <div className="flex flex-wrap gap-1 mb-4">
                {venue.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {venue.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{venue.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <a href={createPageUrl(`VenueDetails?id=${venue.id}`)} className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group">
                  View Details
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 strathwell-transition" />
                </Button>
              </a>
              {onAskAI && (
                <Button
                  onClick={() => onAskAI(venue)}
                  variant="outline"
                  size="icon"
                  className="px-3"
                  title="Ask AI about this venue"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}