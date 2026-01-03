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
          "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop", // elegant plated meal
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", // pizza
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", // food prep
          "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop" // pasta
        ],
        corporate: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop", // business lunch
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", // salad
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop", // sandwich spread
          "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop" // coffee break
        ],
        wedding: [
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop", // wedding cake
          "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop", // elegant appetizers
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", // champagne
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" // dessert table
        ]
      },
      photography: {
        default: [
          "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop", // camera gear
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop", // photographer at work
          "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=300&fit=crop", // photography studio
          "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop" // portrait session
        ],
        wedding: [
          "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop", // wedding photography
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop", // bride and groom
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop", // wedding rings
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop" // wedding ceremony
        ]
      },
      'audio/visual': {
        default: [
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop", // sound mixing board
          "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop", // microphones
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop", // lighting equipment
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop" // stage setup
        ],
        dj: [
          "https://images.unsplash.com/photo-1571266028243-d220c9fa96bb?w=800&h=600&fit=crop", // DJ setup
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop", // turntables
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop", // dance floor
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop" // party lighting
        ]
      },
      entertainment: {
        default: [
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop", // live performance
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop", // concert
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop", // dance
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" // musician
        ]
      },
      floral: {
        default: [
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=600&fit=crop", // flower arrangement
          "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop", // wedding flowers
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", // bouquet
          "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=400&h=300&fit=crop" // centerpiece
        ]
      },
      decor: {
        default: [
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop", // event setup
          "https://images.unsplash.com/photo-1519167758481-83f29b1fe26e?w=400&h=300&fit=crop", // elegant table
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop", // lighting
          "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop" // decor elements
        ]
      },
      default: {
        default: [
          "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop"
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