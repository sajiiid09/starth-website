import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare,
  X,
  ExternalLink 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getGooglePlacePhotos } from "@/api/functions";
import { convertGoogleDriveUrl } from "@/components/utils/imageUtils";

import { User } from "@/api/entities";
import { Conversation } from "@/api/entities";
import { ConversationParticipant } from "@/api/entities";
import { Message } from "@/api/entities";
import { createPageUrl } from "@/utils";

export default function VendorCard({ vendor }) { // Removed onRequestQuote from props
  const [showDetails, setShowDetails] = useState(false);

  const categoryColors = {
    catering: "bg-orange-100 text-orange-800",
    "audio/visual": "bg-blue-100 text-blue-800", 
    photography: "bg-purple-100 text-purple-800",
    "event staffing": "bg-green-100 text-green-800",
    decor: "bg-pink-100 text-pink-800",
    floral: "bg-rose-100 text-rose-800",
    av_tech: "bg-blue-100 text-blue-800",
    entertainment: "bg-yellow-100 text-yellow-800" // Added entertainment category color
  };

  const categoryColor = categoryColors[vendor.category?.toLowerCase()] || "bg-gray-100 text-gray-800";

  const handleRequestQuote = async () => {
    try {
      const currentUser = await User.me();
      
      const existingParticipants = await ConversationParticipant.filter({ 
        user_id: currentUser.id 
      });
      
      let existingConversation = null;
      for (const participant of existingParticipants) {
        const otherParticipants = await ConversationParticipant.filter({ 
          conversation_id: participant.conversation_id 
        });
        
        // Find if any other participant in this conversation belongs to the current vendor
        const hasVendor = otherParticipants.some(p => p.user_id === vendor.provider_id && p.user_id !== currentUser.id);
        if (hasVendor) {
          existingConversation = participant.conversation_id;
          break;
        }
      }
      
      let conversationId = existingConversation;
      
      if (!conversationId) {
        // Create a new conversation if none exists
        const conversation = await Conversation.create({});
        conversationId = conversation.id;
        
        // Add current user as participant
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: currentUser.id
        });
        
        // Add vendor as participant (using vendor.provider_id)
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: vendor.provider_id || 'default_provider' // Fallback for provider_id if not present
        });
        
        // Send initial message
        await Message.create({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          text: `Hi! I found your ${vendor.category} services through the AI planner and I'm interested in learning more for my upcoming event. Could you please provide details about your offerings and pricing?`
        });
      }
      
      // Redirect to the Messages page
      window.location.href = createPageUrl("Messages");
      
    } catch (error) {
      console.error("Error creating message:", error);
      if (error.message.includes('Unauthorized')) {
        // If unauthorized, redirect to login
        await User.loginWithRedirect(window.location.href);
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
          <PhotoCollage vendor={vendor} /> {/* Updated PhotoCollage usage */}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${categoryColor} font-medium`}>
              {vendor.category}
            </Badge>
          </div>
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-900">
              {vendor.rating}
            </span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            {vendor.name}
          </h3>
          
          {/* Service Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {vendor.service}
          </p>
          
          {/* Service Tags */}
          <div className="mt-4 flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              Professional Service
            </Badge>
            <Badge variant="outline" className="text-xs">
              Insured
            </Badge>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-green-600 font-semibold text-lg">
              ${vendor.price?.toLocaleString()}
            </div>
            <span className="text-xs text-gray-500">Starting from</span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </DialogHeader>
          
          {/* Hero Image */}
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
            <PhotoCollage 
              vendor={vendor} // Updated PhotoCollage usage
            />
          </div>
          
          {/* Header Info */}
          <div className="space-y-2 p-4 pt-0">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {vendor.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={categoryColor}>
                {vendor.category}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{vendor.rating}</span>
              </div>
            </div>
          </div>
          
          {/* Services Offered */}
          <div className="space-y-3 p-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold">Services Offered</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">{vendor.service}</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium">Starting Price: </span>
                  <span className="text-green-600">${vendor.price?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Rating: </span>
                  <span>{vendor.rating}/5.0</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 p-4 pt-0">
            <Button 
              onClick={handleRequestQuote}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Vendor Admin
            </Button>
            {vendor.website && (
              <a 
                href={vendor.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
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

// Photo Collage Component for Vendors
const PhotoCollage = ({ vendor }) => { // Changed props to accept a single 'vendor' object
  const [imageUrls, setImageUrls] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const getCategoryImages = (category, service = "", vendorName = "") => {
    const searchTerms = (service + " " + vendorName).toLowerCase();
    
    const categoryImages = {
      catering: {
        default: [
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp"
        ],
        corporate: [
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp"
        ],
        wedding: [
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp",
          "/images/marketplace/vendor-catering.webp"
        ]
      },
      photography: {
        default: [
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp"
        ],
        wedding: [
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp",
          "/images/marketplace/vendor-photo.webp"
        ]
      },
      'audio/visual': {
        default: [
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp"
        ],
        dj: [
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp",
          "/images/marketplace/vendor-av.webp"
        ]
      },
      entertainment: {
        default: [
          "/images/templates/template-wedding-gala.webp",
          "/images/templates/template-wedding-gala.webp",
          "/images/templates/template-wedding-gala.webp",
          "/images/templates/template-wedding-gala.webp"
        ]
      },
      floral: {
        default: [
          "/images/marketplace/vendor-floral.webp",
          "/images/marketplace/vendor-floral.webp",
          "/images/marketplace/vendor-floral.webp",
          "/images/marketplace/vendor-floral.webp"
        ]
      },
      decor: {
        default: [
          "/images/templates/template-fundraiser.webp",
          "/images/templates/template-fundraiser.webp",
          "/images/templates/template-fundraiser.webp",
          "/images/templates/template-fundraiser.webp"
        ]
      },
      default: {
        default: [
          "/images/misc/abstract-bg.webp",
          "/images/misc/abstract-bg.webp",
          "/images/misc/abstract-bg.webp",
          "/images/misc/abstract-bg.webp"
        ]
      }
    };

    // Determine subcategory based on search terms
    let subcategory = 'default';
    if (searchTerms.includes('wedding') || searchTerms.includes('bride') || searchTerms.includes('bridal') || searchTerms.includes('ceremony')) {
      subcategory = 'wedding';
    } else if (searchTerms.includes('corporate') || searchTerms.includes('business') || searchTerms.includes('professional')) {
      subcategory = 'corporate';
    } else if (searchTerms.includes('dj') || searchTerms.includes('disc jockey')) {
      subcategory = 'dj';
    }

    const categoryKey = category?.toLowerCase();
    const imagesForCategory = categoryImages[categoryKey];
    
    if (imagesForCategory && imagesForCategory[subcategory]) {
      return imagesForCategory[subcategory];
    } else if (imagesForCategory && imagesForCategory.default) {
      return imagesForCategory.default;
    }
    
    // Fallback to general default if category not found or no specific default for category
    return categoryImages.default.default;
  };

  React.useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      
      // Step 1: Collect ALL existing image fields
      const existingImages = [
        vendor.image_url,
        vendor.photo_url,
        ...(vendor.photos || []),
        ...(vendor.portfolio_photos || [])
      ].filter(url => url && typeof url === 'string' && url.startsWith('http'));

      // Step 2: Filter out stock images
      const realImages = existingImages.filter(url => 
        !url.includes('unsplash.com') &&
        !url.includes('pexels.com') &&
        !url.includes('pixabay.com')
      );

      let finalPhotos = realImages;

      // Step 3: MANDATORY - If NO real images found, FORCE fetch from Google
      if (finalPhotos.length === 0 && vendor.name) {
        console.log(`🔍 FORCING Google Photos fetch for: ${vendor.name}`);
        
        try {
          const location = vendor.location || (vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : null);
          console.log(`   Searching: ${vendor.name} in ${location || 'unknown'}`);
          
          const result = await getGooglePlacePhotos({
            place_id: vendor.google_place_id || null,
            name: vendor.name,
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
          } else if (result?.photos) {
            photos = result.photos;
            console.log(`   Found via result.photos`);
          } else if (Array.isArray(result)) {
            photos = result;
            console.log(`   Found via direct array`);
          }
          
          if (photos && photos.length > 0) {
            console.log(`📸 SUCCESS: Found ${photos.length} photos for ${vendor.name}`);
            console.log(`   First photo: ${photos[0]}`);
            finalPhotos = photos;
          } else {
            console.error(`❌ ZERO PHOTOS for ${vendor.name}`);
            console.error(`   Full response:`, JSON.stringify(result, null, 2));
          }
        } catch (error) {
          console.error(`❌ FETCH ERROR for ${vendor.name}:`, error);
          console.error(`   Message: ${error.message}`);
        }
      }
      
      // No Street View fallback - let it render business name instead
      setImageUrls(finalPhotos);
      setIsLoading(false);
    };
    
    if (vendor?.name) {
      fetchPhotos();
    } else {
      setImageUrls([]);
      setIsLoading(false);
    }
  }, [vendor]);
  
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
            {vendor.name}
          </div>
          <div className="text-white/80 text-sm">
            {vendor.category}
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
          alt={vendor.name}
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
          alt={`${vendor.name} - Main`}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
      <div className="col-span-2">
        <img 
          src={allPhotos[1] || allPhotos[0]} 
          alt={`${vendor.name} - Work 2`}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>
      <div className="grid grid-cols-2 gap-1 col-span-2">
        <img 
          src={allPhotos[2] || allPhotos[0]} 
          alt={`${vendor.name} - Work 3`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="relative">
          <img 
            src={allPhotos[3] || allPhotos[0]} 
            alt={`${vendor.name} - Work 4`}
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