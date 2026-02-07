import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Service } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FavoriteButton from "../components/venue/FavoriteButton";
import MessageServiceButton from "../components/service/MessageServiceButton"; // Added import
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  CurrencyDollar, 
  Star, 
  Shield,
  ArrowSquareOut,
  Globe,
  Calendar,
  SpinnerGap,
  Heart,
  ChatCircle,
  Camera,
  MusicNotes,
  Truck,
  Palette
} from "@phosphor-icons/react";
import { getGooglePlacePhotos } from "@/api/functions";
import { convertGoogleDriveUrl } from "@/components/utils/imageUtils";


const categoryIcons = {
  "Photography & Videography": Camera,
  "Catering": Users,
  "Entertainment & Media": MusicNotes,
  "Audio & DJ Services": MusicNotes,
  "Transportation": Truck,
  "Decor": Palette,
  "default": Star
};

const PhotoCollage = ({ photos, providerName, category }) => {
  const getCategoryImages = (category) => {
    const defaultImages = [
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1550985543-49bee3167284?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop"
    ];
    return photos && photos.length > 0 ? photos.map(url => convertGoogleDriveUrl(url)) : defaultImages;
  };

  const allPhotos = getCategoryImages(category);

  if (!allPhotos || allPhotos.length === 0) return <div className="h-96 bg-gray-200" />;

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100">
       <img src={allPhotos[0]} alt={providerName} className="w-full h-full object-cover" />
    </div>
  );
};


export default function ServiceDetailsPage() {
  const [id, setId] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState([]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setId(urlParams.get('id'));
  }, []);

  useEffect(() => {
    const loadService = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const foundService = await Service.get(id);
        setService(foundService);

        // Photo loading logic (with Google Drive conversion)
        let loadedPhotos = foundService.portfolio_photos?.map(url => convertGoogleDriveUrl(url)) || [];
        
        if (loadedPhotos.length === 0) {
           try {
            const response = await getGooglePlacePhotos({
              place_id: foundService.google_place_id,
              name: foundService.name,
              location: `${foundService.city}, ${foundService.state}`
            });
            if (response.data && response.data.photos && response.data.photos.length > 0) {
              loadedPhotos = response.data.photos;
            }
          } catch (error) {
            console.error("Failed to fetch Google Photos for service details:", error);
          }
        }

        setGalleryPhotos(loadedPhotos);

      } catch (error) {
        console.error("Error loading service:", error);
        setService(null);
      }
      setLoading(false);
    };

    loadService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Provider Not Found</h2>
          <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="outline">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rating = service.rating || service.google_rating;
  const CategoryIcon = categoryIcons[service.category] || categoryIcons.default;


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
            <h1 className="text-2xl font-semibold text-gray-900">{service.name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <CategoryIcon className="w-4 h-4" />
              <span>{service.category}</span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <FavoriteButton entityType="service_provider" entityId={service.id} />

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PhotoCollage photos={galleryPhotos} providerName={service.name} category={service.category} />
          
          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle>About This Provider</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {service.description || `A leading provider of ${service.category} services in Massachusetts.`}
              </p>
            </CardContent>
          </Card>

          {service.event_types && service.event_types.length > 0 && (
            <Card className="border-none shadow-lg">
              <CardHeader><CardTitle>Specializes In</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.event_types.map((type, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">{type}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {service.coverage_regions && service.coverage_regions.length > 0 && (
             <Card className="border-none shadow-lg">
              <CardHeader><CardTitle>Service Area</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-2 text-gray-700">
                 <MapPin className="w-5 h-5 text-indigo-600" />
                 <span>{service.coverage_regions.join(", ")}</span>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CurrencyDollar className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-600">Starting at</span></div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">${service.rate_card_json?.base_rate?.toLocaleString() || 'N/A'}</div>
                    <div className="text-sm text-gray-500">per event</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-current" /><span className="text-sm text-gray-600">Rating</span></div>
                  <div className="font-semibold text-gray-900">{rating ? `${rating}/5.0` : 'N/A'}</div>
                </div>

                {service.insurance_verified && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Insurance Verified</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle>Get In Touch</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <MessageServiceButton
                service={service}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Request Quote
              </MessageServiceButton>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}