import React, { useState, useEffect, useCallback } from "react";
import { Venue } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Save,
  Loader2,
  X,
  Upload,
  Building,
  MapPin,
  Users,
  Camera,
  DollarSign
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";
import { toast } from "sonner";

// Re-using constants from AddVenue
const venueCategories = [
  { value: "conference_meeting", label: "Conference & Meeting Space" },
  { value: "event_hall_ballroom", label: "Event Hall & Ballroom" },
  { value: "gallery_museum", label: "Gallery & Museum" },
  { value: "rooftop_outdoor", label: "Rooftop & Outdoor Space" },
  { value: "restaurant_bar", label: "Restaurant & Bar" },
  { value: "hotel_banquet", label: "Hotel & Banquet Hall" },
  { value: "theater_auditorium", label: "Theater & Auditorium" },
  { value: "loft_studio_warehouse", label: "Loft, Studio & Warehouse" },
  { value: "university_campus", label: "University & Campus" }
];

const commonAmenities = [
  "WiFi", "Parking", "AV Equipment", "Catering Kitchen", "Bar Service",
  "Dance Floor", "Stage", "Outdoor Space", "Air Conditioning", "Heating",
  "Wheelchair Accessible", "Coat Check", "Security", "Valet Parking",
  "Piano", "Sound System", "Projector", "Microphones", "Lighting System"
];

const commonTags = [
  "wedding", "corporate", "conference", "party", "networking", "gala",
  "fundraiser", "product launch", "training", "seminar", "celebration"
];

export default function EditVenuePage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [venueId, setVenueId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    tags: [],
    address: "",
    city: "",
    state: "",
    country: "US",
    postal_code: "",
    capacity_min: "",
    capacity_max: "",
    amenities: [],
    layouts: [],
    hero_photo_url: "",
    gallery_urls: [],
    base_rate: "",
    hourly_rate: "",
    cleaning_fee: "",
    security_deposit: "",
    website: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setVenueId(id);
    } else {
      toast.error("No venue ID provided.");
      navigate(createPageUrl("VenueListings"));
    }
  }, [location.search, navigate]);

  const fetchVenueData = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    try {
      const venue = await Venue.get(venueId);
      
      // Flatten the data for the form state
      setFormData({
        name: venue.name || "",
        category: venue.category || "",
        description: venue.description || "",
        tags: venue.tags || [],
        address: venue.address || "",
        city: venue.city || "",
        state: venue.state || "",
        country: venue.country || "US",
        postal_code: venue.postal_code || "",
        capacity_min: venue.capacity_min || "",
        capacity_max: venue.capacity_max || "",
        amenities: venue.amenities || [],
        layouts: venue.layouts || [],
        hero_photo_url: venue.hero_photo_url || "",
        gallery_urls: venue.gallery_urls || [],
        base_rate: venue.rate_card_json?.base_rate || "",
        hourly_rate: venue.rate_card_json?.hourly_rate || "",
        cleaning_fee: venue.rate_card_json?.cleaning_fee || "",
        security_deposit: venue.rate_card_json?.security_deposit || "",
        website: venue.website || ""
      });
    } catch (error) {
      console.error("Error fetching venue data:", error);
      toast.error("Failed to load venue data.");
      navigate(createPageUrl("VenueListings"));
    }
    setLoading(false);
  }, [venueId, navigate]);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) 
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleImageUpload = async (e, isHero = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadingImages(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      if (isHero) {
        handleInputChange("hero_photo_url", file_url);
      } else {
        setFormData(prev => ({
          ...prev,
          gallery_urls: [...prev.gallery_urls, file_url]
        }));
      }
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    }
    setUploadingImages(false);
  };
  
  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!venueId) {
        toast.error("Venue ID is missing.");
        return;
    }
    setSaving(true);
    try {
      const venueData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        tags: formData.tags,
        hero_photo_url: formData.hero_photo_url,
        gallery_urls: formData.gallery_urls,
        capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : null,
        capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : null,
        amenities: formData.amenities,
        layouts: formData.layouts,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        website: formData.website,
        rate_card_json: {
          base_rate: formData.base_rate ? parseFloat(formData.base_rate) : null,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          cleaning_fee: formData.cleaning_fee ? parseFloat(formData.cleaning_fee) : null,
          security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null
        }
      };

      await Venue.update(venueId, venueData);
      toast.success("Venue updated successfully!");
      navigate(createPageUrl("VenueListings"));
    } catch (error) {
      console.error("Error saving venue:", error);
      toast.error("Failed to save venue. Please check the form and try again.");
    }
    setSaving(false);
  };
  
  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        </VenuePortalLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="venue_owner">
      <VenuePortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to={createPageUrl("VenueListings")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
              <p className="text-gray-600">Update details for {formData.name}</p>
            </div>
          </div>

          <Card className="border-none shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Venue Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="category">Venue Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{venueCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} />
              </div>
              <div>
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {commonTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox id={`tag-${tag}`} checked={formData.tags.includes(tag)} onCheckedChange={() => handleArrayToggle("tags", tag)} />
                      <Label htmlFor={`tag-${tag}`} className="capitalize cursor-pointer">{tag}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" value={formData.postal_code} onChange={(e) => handleInputChange("postal_code", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Capacity & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity_min">Minimum Capacity *</Label>
                  <Input id="capacity_min" type="number" value={formData.capacity_min} onChange={(e) => handleInputChange("capacity_min", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="capacity_max">Maximum Capacity *</Label>
                  <Input id="capacity_max" type="number" value={formData.capacity_max} onChange={(e) => handleInputChange("capacity_max", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Amenities & Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {commonAmenities.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox id={`amenity-${amenity}`} checked={formData.amenities.includes(amenity)} onCheckedChange={() => handleArrayToggle("amenities", amenity)} />
                      <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <Label>Hero Photo URL</Label>
                  <Input 
                    value={formData.hero_photo_url} 
                    onChange={(e) => handleInputChange("hero_photo_url", e.target.value)}
                    placeholder="https://example.com/main-photo.jpg"
                  />
                  {formData.hero_photo_url && <img src={formData.hero_photo_url} alt="Hero preview" className="w-full h-48 object-cover rounded-lg mt-2" />}
                </div>
                 <div>
                    <Label>Gallery Photos</Label>
                    <p className="text-sm text-gray-500 mb-3">Add or remove photo URLs.</p>
                    <div className="space-y-2">
                        {formData.gallery_urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    value={url} 
                                    onChange={(e) => {
                                        const newUrls = [...formData.gallery_urls];
                                        newUrls[index] = e.target.value;
                                        handleInputChange("gallery_urls", newUrls);
                                    }}
                                />
                                <Button variant="destructive" size="icon" onClick={() => removeGalleryImage(index)}><X className="w-4 h-4" /></Button>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handleInputChange("gallery_urls", [...formData.gallery_urls, ""])}>
                        Add Photo URL
                    </Button>
                </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg mb-6">
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_rate">Base Rate (per event) *</Label>
                    <Input id="base_rate" type="number" value={formData.base_rate} onChange={(e) => handleInputChange("base_rate", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Hourly Rate</Label>
                    <Input id="hourly_rate" type="number" value={formData.hourly_rate} onChange={(e) => handleInputChange("hourly_rate", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cleaning_fee">Cleaning Fee</Label>
                    <Input id="cleaning_fee" type="number" value={formData.cleaning_fee} onChange={(e) => handleInputChange("cleaning_fee", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="security_deposit">Security Deposit</Label>
                    <Input id="security_deposit" type="number" value={formData.security_deposit} onChange={(e) => handleInputChange("security_deposit", e.target.value)} />
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <Link to={createPageUrl("VenueListings")}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}