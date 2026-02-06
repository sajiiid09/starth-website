
import React, { useState, useEffect, useCallback } from "react";
import { Venue } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { SendEmail } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Buildings, 
  MapPin, 
  Users, 
  Camera, 
  CurrencyDollar,
  FloppyDisk,
  CheckCircle,
  Upload,
  SpinnerGap,
  X
} from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";
import { toast } from "sonner";

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

export default function AddVenuePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    category: "",
    description: "",
    tags: [],
    
    // Location
    address: "",
    city: "",
    state: "",
    country: "US",
    postal_code: "",
    
    // Capacity & Features
    capacity_min: "",
    capacity_max: "",
    amenities: [],
    layouts: [],
    
    // Images
    hero_photo_url: "",
    gallery_urls: [],
    
    // Pricing
    base_rate: "",
    hourly_rate: "",
    cleaning_fee: "",
    security_deposit: "",
    
    // Contact
    website: ""
  });

  const fetchData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      if (orgs.length > 0) {
        setOrganization(orgs[0]);
      } else {
        toast.error("Please complete your organization profile first.");
        navigate(createPageUrl("VenueOrganization"));
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading data. Please try again.");
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const venueData = {
        org_id: organization.id,
        owner_id: user.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        tags: formData.tags,
        hero_photo_url: formData.hero_photo_url,
        gallery_urls: formData.gallery_urls,
        capacity_min: formData.capacity_min ? parseInt(formData.capacity_min) : 1,
        capacity_max: formData.capacity_max ? parseInt(formData.capacity_max) : 100,
        amenities: formData.amenities,
        layouts: formData.layouts,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        website: formData.website,
        rate_card_json: {
          base_rate: formData.base_rate ? parseFloat(formData.base_rate) : 0,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : 0,
          cleaning_fee: formData.cleaning_fee ? parseFloat(formData.cleaning_fee) : 0,
          security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : 0
        },
        status: publish ? "submitted" : "draft"
      };

      const newVenue = await Venue.create(venueData);
      
      if (publish) {
        console.log("Attempting to send submission email...");
        try {
          const emailResult = await SendEmail({
            to: "info@renzairegroup.com",
            from_name: "Strathwell Platform",
            subject: `New Venue Submission for Review: ${venueData.name}`,
            body: `
              <div style="font-family: sans-serif; line-height: 1.6;">
                <h2>New Venue Submission on Strathwell</h2>
                <p>A new venue, <strong>${venueData.name}</strong>, has been submitted for review.</p>
                <hr>
                <h3>Details:</h3>
                <ul>
                  <li><strong>Venue ID:</strong> ${newVenue.id}</li>
                  <li><strong>Venue Name:</strong> ${venueData.name}</li>
                  <li><strong>Organization:</strong> ${organization.name}</li>
                  <li><strong>Location:</strong> ${venueData.city}, ${venueData.state}</li>
                  <li><strong>Submitted By:</strong> ${user.full_name} (${user.email})</li>
                </ul>
                <p>Please log in to your admin dashboard to review, verify, and publish this listing.</p>
                <br>
                <p>Thank you,</p>
                <p>The Strathwell Team</p>
              </div>
            `
          });
          console.log("Email send result:", emailResult);
          toast.success("Venue submitted! A notification has been sent for review.");
        } catch (emailError) {
          console.error("Failed to send review email:", emailError);
          toast.warning("Venue submitted, but the review notification failed to send. Please check manually.");
        }
      } else {
        toast.success("Venue saved as draft!");
      }
      
      navigate(createPageUrl("VenueListings"));
    } catch (error) {
      console.error("Error saving venue:", error);
      toast.error("Failed to save venue. Please try again.");
    }
    setSaving(false);
  };

  const validateStep = (stepNumber) => {
    switch(stepNumber) {
      case 1:
        return formData.name && formData.category && formData.description;
      case 2:
        return formData.address && formData.city && formData.state;
      case 3:
        return formData.capacity_min && formData.capacity_max;
      case 4:
        return true; // Images are optional
      case 5:
        return formData.base_rate; // At least base rate required
      default:
        return true;
    }
  };

  const progress = (step / 5) * 100;

  if (loading) {
    return (
      <RoleGuard requiredRole="venue_owner">
        <VenuePortalLayout>
          <div className="flex items-center justify-center h-64">
            <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Venue</h1>
              <p className="text-gray-600">Step {step} of 5</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <Buildings className="w-5 h-5 text-blue-600" />}
                {step === 2 && <MapPin className="w-5 h-5 text-green-600" />}
                {step === 3 && <Users className="w-5 h-5 text-orange-600" />}
                {step === 4 && <Camera className="w-5 h-5 text-purple-600" />}
                {step === 5 && <CurrencyDollar className="w-5 h-5 text-red-600" />}
                
                {step === 1 && "Basic Information"}
                {step === 2 && "Location Details"}
                {step === 3 && "Capacity & Features"}
                {step === 4 && "Photos"}
                {step === 5 && "Pricing"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="name">Venue Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your venue name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Venue Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select venue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {venueCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your venue, its unique features, and what makes it special..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Event Types (Select all that apply)</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {commonTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={formData.tags.includes(tag)}
                            onCheckedChange={() => handleArrayToggle("tags", tag)}
                          />
                          <Label htmlFor={`tag-${tag}`} className="capitalize cursor-pointer">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourvenuewebsite.com"
                    />
                  </div>
                </>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange("postal_code", e.target.value)}
                        placeholder="94105"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Capacity & Features */}
              {step === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity_min">Minimum Capacity *</Label>
                      <Input
                        id="capacity_min"
                        type="number"
                        value={formData.capacity_min}
                        onChange={(e) => handleInputChange("capacity_min", e.target.value)}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity_max">Maximum Capacity *</Label>
                      <Input
                        id="capacity_max"
                        type="number"
                        value={formData.capacity_max}
                        onChange={(e) => handleInputChange("capacity_max", e.target.value)}
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Amenities & Features</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {commonAmenities.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() => handleArrayToggle("amenities", amenity)}
                          />
                          <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer text-sm">
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Photos */}
              {step === 4 && (
                <>
                  <div>
                    <Label>Hero Photo</Label>
                    <p className="text-sm text-gray-500 mb-3">Main photo that will represent your venue</p>
                    
                    {formData.hero_photo_url ? (
                      <div className="relative">
                        <img 
                          src={formData.hero_photo_url} 
                          alt="Hero" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleInputChange("hero_photo_url", "")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                          id="hero-upload"
                          disabled={uploadingImages}
                        />
                        <label htmlFor="hero-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Click to upload hero photo</p>
                          <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Gallery Photos (Optional)</Label>
                    <p className="text-sm text-gray-500 mb-3">Additional photos of your venue</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {formData.gallery_urls.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {formData.gallery_urls.length < 10 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                          id="gallery-upload"
                          disabled={uploadingImages}
                        />
                        <label htmlFor="gallery-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Add gallery photo</p>
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 5: Pricing */}
              {step === 5 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="base_rate">Base Rate (per event) *</Label>
                      <Input
                        id="base_rate"
                        type="number"
                        value={formData.base_rate}
                        onChange={(e) => handleInputChange("base_rate", e.target.value)}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate (Optional)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
                        placeholder="250"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cleaning_fee">Cleaning Fee (Optional)</Label>
                      <Input
                        id="cleaning_fee"
                        type="number"
                        value={formData.cleaning_fee}
                        onChange={(e) => handleInputChange("cleaning_fee", e.target.value)}
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="security_deposit">Security Deposit (Optional)</Label>
                      <Input
                        id="security_deposit"
                        type="number"
                        value={formData.security_deposit}
                        onChange={(e) => handleInputChange("security_deposit", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Pricing Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Research similar venues in your area for competitive pricing</li>
                      <li>• Consider offering package deals for longer events</li>
                      <li>• Security deposits typically range from $500-$2000</li>
                      <li>• You can always adjust pricing later in your dashboard</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {step < 5 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={!validateStep(step)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleSave(false)}
                        disabled={saving || !validateStep(step)}
                      >
                        {saving ? <SpinnerGap className="w-4 h-4 animate-spin mr-2" /> : <FloppyDisk className="w-4 h-4 mr-2" />}
                        Save Draft
                      </Button>
                      <Button
                        onClick={() => handleSave(true)}
                        disabled={saving || !validateStep(step)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? <SpinnerGap className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Submit for Review
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}
