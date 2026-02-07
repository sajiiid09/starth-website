import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Venue } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SmartImage from "@/components/shared/SmartImage";
import {
  ArrowLeft,
  MapPin,
  Users,
  CurrencyDollar,
  Star,
  Shield,
  ArrowSquareOut,
  Phone,
  Envelope,
  Globe,
  Calendar,
  WifiHigh,
  Car,
  Camera,
  ForkKnife,
  SpinnerGap,
  Heart
} from "@phosphor-icons/react";
import MessageVenueButton from "../components/venue/MessageVenueButton"; // Added import

const amenityIcons = {
  "WiFi": WifiHigh,
  "Parking": Car,
  "AV Equipment": Camera,
  "Catering Kitchen": ForkKnife,
  "High-speed WiFi": WifiHigh,
  "Audio Visual": Camera,
  "Catering": ForkKnife
};

export default function VenueDetailsPage() {
  const [id, setId] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [showContactForm, setShowContactForm] = useState(false); // Removed

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setId(urlParams.get('id'));
  }, []);

  useEffect(() => {
    const loadVenue = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const foundVenue = await Venue.get(id);
        setVenue(foundVenue);
      } catch (error) {
        console.error("Error loading venue:", error);
        setVenue(null);
      }
      setLoading(false);
    };

    loadVenue();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Venue Not Found</h2>
          <p className="text-gray-600 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="outline">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rating = venue.rating || venue.google_rating;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{venue.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{venue.city}, {venue.state}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="icon">
              <Heart className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg overflow-hidden">
             <SmartImage 
                item={venue}
                type="venue"
                className="w-full h-96 object-cover"
                alt={venue.name}
              />
          </Card>

          {/* Description, Amenities, Location Cards */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>About This Venue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {venue.description || `${venue.name} is a premier event venue located in ${venue.city}, ${venue.state}. Perfect for corporate events, weddings, conferences, and special celebrations.`}
              </p>
            </CardContent>
          </Card>
          {venue.amenities && venue.amenities.length > 0 && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || Star;
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <IconComponent className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Location & Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{venue.address}</p>
                    <p className="text-gray-600">{venue.city}, {venue.state} {venue.country}</p>
                  </div>
                </div>
                {venue.maps_url && (
                  <a href={venue.maps_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <ArrowSquareOut className="w-4 h-4 mr-2" />
                      View on Google Maps
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Pricing & Capacity, Contact, Quick Stats Cards */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CurrencyDollar className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Starting at</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">
                      ${venue.rate_card_json?.base_rate?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">per day</div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Capacity</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Up to {venue.capacity_max || 'N/A'} guests
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">Rating</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {rating ? `${rating}/5.0` : 'N/A'}
                  </div>
                </div>

                {venue.insurance_verified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Insurance Verified
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MessageVenueButton // Replaced Button with MessageVenueButton
                venue={venue}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Request Quote
              </MessageVenueButton>


            </CardContent>
          </Card>
        </div>
      </div>

      {/* Removed the showContactForm modal, as MessageVenueButton handles its own interaction */}
    </div>
  );
}