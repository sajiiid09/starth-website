import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  CurrencyDollar,
  Star,
  Heart,
  ChatCircle,
  ArrowSquareOut
} from "@phosphor-icons/react";
import SmartImage from "@/components/shared/SmartImage";

export default function VenueCard({ venue, showActions = true }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleMessage = () => {
    alert(`Message sent to ${venue.name}. (This would open a chat in a full app)`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
        <div className="relative h-48 overflow-hidden">
          <SmartImage
            item={venue}
            type="venue"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            alt={venue.name}
          />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-900">
              {venue.rating || venue.google_rating || 4.5}
            </span>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
          <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {venue.name}
          </h3>
        </Link>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{venue.city}, {venue.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Capacity: {venue.capacity_min}-{venue.capacity_max} guests</span>
          </div>
        </div>
        
        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-green-600 font-semibold text-lg">
            ${venue.rate_card_json?.base_rate?.toLocaleString() || 'Contact for pricing'}
          </div>
          {venue.rate_card_json?.base_rate && (
            <span className="text-xs text-gray-500">Base rate</span>
          )}
        </div>

        {showActions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={toggleFavorite}>
              <Heart className={`w-4 h-4 mr-1 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} weight={isFavorite ? "fill" : "regular"} />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={handleMessage}>
              <ChatCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            {venue.website && (
              <Button variant="ghost" size="sm" asChild>
                <a href={venue.website} target="_blank" rel="noopener noreferrer">
                  <ArrowSquareOut className="w-4 h-4 mr-1" />
                  Website
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}