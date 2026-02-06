import React, { useState } from "react";
import { Venue } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  MapPin, 
  Users, 
  CurrencyDollar, 
  Camera,
  CheckCircle,
  ArrowLeft
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const amenityOptions = [
  "WiFi", "Parking", "Kitchen", "AV Equipment", "Air Conditioning", 
  "Natural Light", "Outdoor Space", "Security", "Accessibility", 
  "Storage", "Loading Dock", "Bar Setup", "Stage", "Dance Floor",
  "Photo Studio Setup", "Green Screen", "Dressing Room"
];

export default function ListSpacePage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    base_rate: "",
    description: "",
    amenities: [],
    photos: []
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files) as File[];
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...urls]
      }));
    } catch (error) {
      console.error("Upload error:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city) return;
    
    setSubmitting(true);
    try {
      const user = await User.me();
      
      const venueData = {
        ...formData,
        owner_id: user.id,
        country: "USA",
        capacity: parseInt(formData.capacity),
        base_rate: parseFloat(formData.base_rate),
        verified: false,
        insurance_verified: false,
        rating: 4.5,
        status: "pending"
      };

      await Venue.create(venueData);
      setSuccess(true);
    } catch (error) {
      console.error("Submit error:", error);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Space Listed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your space is now under review. We'll notify you once it's approved and live on the marketplace.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Marketplace")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">List Your Space</h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Tell us about your space</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Space Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Beautiful Rooftop Loft"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Max guests"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rate">Rate</Label>
                <div className="relative">
                  <CurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="rate"
                    type="number"
                    placeholder="Per day"
                    value={formData.base_rate}
                    onChange={(e) => handleInputChange("base_rate", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your space, what makes it special..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>

            {/* Amenities */}
            <div>
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {amenityOptions.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Photos</Label>
              <div className="mt-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload photos of your space</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Choose Photos"}
                      </span>
                    </Button>
                  </Label>
                </div>
                
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.address || submitting}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 text-lg font-semibold"
              >
                {submitting ? "Submitting..." : "List My Space"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}