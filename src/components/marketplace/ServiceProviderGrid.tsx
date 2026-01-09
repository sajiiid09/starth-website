import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Star,
  Shield,
  ExternalLink,
  MapPin,
  MessageSquare,
  Sparkles // Added Sparkles import
} from "lucide-react";
import SmartImage from "@/components/shared/SmartImage";
import MessageServiceButton from "@/components/service/MessageServiceButton";


export default function ServiceProviderGrid({ services, onAskAI }) { // Added onAskAI prop
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
        <p className="text-gray-600">Try adjusting your filters to see more results</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card
          key={service.id}
          data-marketplace-card
          className="group flex flex-col overflow-hidden rounded-2xl border border-brand-dark/10 bg-white/90 shadow-soft transition duration-250 ease-smooth hover:-translate-y-1 hover:shadow-card"
        >
          <Link to={createPageUrl(`ServiceDetails?id=${service.id}`)} className="block">
            <div className="relative">
              <SmartImage 
                item={service}
                type="service"
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt={service.name}
              />

              {service.featured && (
                <Badge className="absolute top-3 left-3 bg-brand-teal text-white">
                  Featured
                </Badge>
              )}
              {service.insurance_verified && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" title="Insurance Verified">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>

            <CardHeader className="p-5">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg font-semibold text-brand-dark line-clamp-1">
                  {service.name}
                </CardTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-brand-dark">
                    {service.rating || "4.8"}
                  </span>
                </div>
              </div>

              <Badge className="mb-3 w-fit bg-brand-blue/60 text-brand-dark capitalize">
                {service.category.replace(/_/g, ' ')}
              </Badge>

              <p className="text-sm text-brand-dark/70 line-clamp-2 mb-3 h-10">
                {service.description || `Professional ${service.category.replace(/_/g, ' ')} services for your event needs.`}
              </p>
            </CardHeader>
          </Link>

          <CardContent className="p-5 pt-0 mt-auto">
            {service.coverage_regions && service.coverage_regions.length > 0 && (
              <div className="mb-4 flex items-center gap-1 text-sm text-brand-dark/60">
                <MapPin className="w-3 h-3" />
                <span>Serves {service.coverage_regions.slice(0, 2).join(', ')}</span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
               <div className="text-lg font-semibold text-brand-dark">
                ${service.rate_card_json?.base_rate?.toLocaleString() || "N/A"}
               </div>
               <span className="text-xs text-brand-dark/50">Starting from</span>
            </div>

            <div className="flex gap-2">
              <Link to={createPageUrl(`ServiceDetails?id=${service.id}`)} className="flex-1">
                  <Button variant="outline" className="w-full border-brand-dark/20 text-brand-dark">
                    View Details
                  </Button>
              </Link>
              {onAskAI && (
                <Button
                  onClick={() => onAskAI(service)}
                  variant="outline"
                  size="icon"
                  title="Ask AI about this service"
                  className="flex-shrink-0" // Added to prevent button from expanding too much
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              )}
              {/* Removed the original MessageServiceButton and wrapped it in a conditional statement or adjusted layout if onAskAI is present */}
              {/* If onAskAI is present, we only show View Details and AI button. 
                  If not, we show View Details and MessageServiceButton.
                  Assuming the new requirement replaces the MessageServiceButton directly next to "View Details"
                  when onAskAI is provided, or keeps the original two buttons if onAskAI is not.
                  Based on the outline, it seems the AI button should be *alongside* "View Details",
                  potentially making the MessageServiceButton a third button, or replacing it depending on UI intent.
                  The outline provided only shows View Details and then the new AI button.
                  Let's make MessageServiceButton conditional based on onAskAI presence to avoid too many buttons.
              */}
              {!onAskAI && ( // Render MessageServiceButton only if onAskAI is NOT provided
                <MessageServiceButton 
                  service={service}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Request Quote
                </MessageServiceButton>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
