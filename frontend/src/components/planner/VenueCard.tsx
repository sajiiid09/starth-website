import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Users,
  ArrowSquareOut,
  ChatCircle,
  X
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getGooglePlacePhotos } from "@/api/functions";
import { convertGoogleDriveUrl } from "@/components/utils/imageUtils";

import { User } from "@/api/entities";
import { Conversation } from "@/api/entities";
import { ConversationParticipant } from "@/api/entities";
import { Message } from "@/api/entities";
import { createPageUrl } from "@/utils";

// Photo Collage Component
const PhotoCollage = ({ venue }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      
      // Step 1: Collect ALL existing image fields
      const existingImages = [
        venue.image_url,
        venue.photo_url,
        venue.hero_photo_url,
        ...(venue.photos || []),
        ...(venue.gallery_urls || [])
      ].filter(url => url && typeof url === 'string' && url.startsWith('http'));

      // Step 2: Filter out stock images
      const realImages = existingImages.filter(url => 
        !url.includes('unsplash.com') &&
        !url.includes('pexels.com') &&
        !url.includes('pixabay.com')
      );

      let finalPhotos = realImages;

      // Step 3: MANDATORY - If NO real images found, FORCE fetch from Google
      if (finalPhotos.length === 0 && venue.name) {
        console.log(`🔍 FORCING Google Photos fetch for: ${venue.name}`);
        
        try {
          const location = venue.location || `${venue.city}, ${venue.state}` || venue.city;
          console.log(`   Searching: ${venue.name} in ${location}`);
          
          const result = await getGooglePlacePhotos({
            place_id: venue.google_place_id || null,
            name: venue.name,
            location: location
          });
          
          console.log(`✅ Raw result:`, result);
          console.log(`   Type: ${typeof result}`);
          console.log(`   Keys:`, Object.keys(result || {}));
          
          // Try multiple response structures
          let photos = null;
          if (result?.data?.photos) {
            photos = result.data.photos;
            console.log(`   Found via result.data.photos`);
          } else if ((result as any)?.photos) {
            photos = (result as any).photos;
            console.log(`   Found via result.photos`);
          } else if (Array.isArray(result)) {
            photos = result;
            console.log(`   Found via direct array`);
          }
          
          if (photos && photos.length > 0) {
            console.log(`📸 SUCCESS: Found ${photos.length} photos for ${venue.name}`);
            console.log(`   First photo: ${photos[0]}`);
            finalPhotos = photos;
          } else {
            console.error(`❌ ZERO PHOTOS for ${venue.name}`);
            console.error(`   Full response:`, JSON.stringify(result, null, 2));
          }
        } catch (error) {
          console.error(`❌ FETCH ERROR for ${venue.name}:`, error);
          console.error(`   Message: ${error.message}`);
          console.error(`   Stack: ${error.stack}`);
        }
      }
      
      // No Street View fallback - let it render business name instead
      setImageUrls(finalPhotos);
      setIsLoading(false);
    };

    if (venue?.name) {
      fetchPhotos();
    }
  }, [venue]);

  if (isLoading) {
    return <div className="h-48 w-full bg-gray-200 animate-pulse rounded-t-lg"></div>;
  }
  
  const allPhotos = imageUrls;

  // Fallback with business name if no photos
  if (allPhotos.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-2">
            {venue.name}
          </div>
          <div className="text-white/80 text-sm">
            {venue.city}, {venue.state}
          </div>
        </div>
      </div>
    );
  }

  if (allPhotos.length === 1) {
    return (
      <div className="w-full h-48 bg-gray-100">
        <img 
          src={allPhotos[0]} 
          alt={venue.name}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 h-48 bg-gray-100">
      <div className="col-span-2 row-span-2">
        <img 
          src={allPhotos[0]} 
          alt={`${venue.name} - Main`}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
      <div className="col-span-2">
        <img 
          src={allPhotos[1] || allPhotos[0]} 
          alt={`${venue.name} - View 2`}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
      <div className="grid grid-cols-2 gap-1 col-span-2">
        <img 
          src={allPhotos[2] || allPhotos[0]} 
          alt={`${venue.name} - View 3`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="relative">
          <img 
            src={allPhotos[3] || allPhotos[0]} 
            alt={`${venue.name} - View 4`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {allPhotos.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                +{allPhotos.length - 4} more
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function VenueCard({ venue, onRequestQuote }: { venue: any; onRequestQuote?: any }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleRequestQuote = async () => {
    try {
      // Check if user is logged in
      const currentUser = await User.me();
      
      // Check if conversation already exists (same logic as MessageVenueButton)
      const existingParticipants = await ConversationParticipant.filter({ 
        user_id: currentUser.id 
      });
      
      let existingConversation = null;
      for (const participant of existingParticipants) {
        const otherParticipants = await ConversationParticipant.filter({ 
          conversation_id: participant.conversation_id 
        });
        
        const hasVenueOwner = otherParticipants.some(p => p.user_id === venue.owner_id && p.user_id !== currentUser.id);
        if (hasVenueOwner) {
          existingConversation = participant.conversation_id;
          break;
        }
      }
      
      let conversationId = existingConversation;
      
      if (!conversationId) {
        const conversation = await Conversation.create({});
        conversationId = conversation.id;
        
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: currentUser.id
        });
        
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: venue.owner_id || 'default_venue_owner' // Fallback if venue.owner_id is not set
        });
        
        await Message.create({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          text: `Hi! I found ${venue.name} through the AI planner and I'm interested in booking it for my event. Could you please provide more details about availability and pricing?`
        });
      }
      
      window.location.href = createPageUrl("Messages");
      
    } catch (error) {
      console.error("Error creating message:", error);
      if (error.message.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative">
          <PhotoCollage venue={venue} />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-900">
              {venue.rating}
            </span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {venue.name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{venue.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Capacity: {venue.capacity} guests</span>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {venue.amenities?.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3} more
              </Badge>
            )}
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-green-600 font-semibold text-lg">
              ${venue.price?.toLocaleString()}
            </div>
            <span className="text-xs text-gray-500">Base rate</span>
          </div>
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
          
          {/* Hero Image */}
          <div className="relative h-64 w-full rounded-lg overflow-hidden -mt-6 bg-gray-100">
            <PhotoCollage venue={venue} />
          </div>
          
          {/* Header Info */}
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {venue.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{venue.rating}</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Capacity: {venue.capacity}
              </Badge>
            </div>
          </div>
          
          {/* Location & Contact */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Location & Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{venue.location}</span>
              </div>
            </div>
          </div>
          
          {/* Amenities */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {venue.amenities?.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Description */}
          {venue.description && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">About This Venue</h3>
              <p className="text-gray-700">{venue.description}</p>
            </div>
          )}
          
          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">Base Rate</span>
                <div className="text-2xl font-bold text-green-600">
                  ${venue.price?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleRequestQuote}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ChatCircle className="w-4 h-4 mr-2" />
              Message {venue.name} Admin
            </Button>
            {venue.website && (
              <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowSquareOut className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}