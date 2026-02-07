
import React, { useState, useEffect } from "react";
import { Venue } from "@/api/entities";
import { Organization } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  MapPin, 
  Users, 
  MagnifyingGlass,
  Pencil,
  Eye,
  WarningCircle,
  CheckCircle,
  Clock,
  SpinnerGap
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";
import { toast } from "sonner";
import { SendEmail } from "@/api/integrations";

export default function VenueListingsPage() {
  const [venues, setVenues] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      if (orgs.length > 0) {
        setOrganization(orgs[0]);
        const venueList = await Venue.filter({ org_id: orgs[0].id }, "-updated_date");
        setVenues(venueList);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (venue, isLive) => {
    const newStatus = isLive ? "active" : "hidden";
    
    // Optimistic update
    const originalVenues = [...venues];
    const updatedVenues = venues.map(v => 
      v.id === venue.id ? { ...v, status: newStatus } : v
    );
    setVenues(updatedVenues);

    try {
      await Venue.update(venue.id, { status: newStatus });
      toast.success(`Venue is now ${newStatus === 'active' ? 'live' : 'hidden'}.`);
    } catch (error) {
      // Revert on error
      setVenues(originalVenues);
      toast.error("Failed to update status. Please try again.");
      console.error("Status update failed:", error);
    }
  };

  const handleSubmitForReview = async (venue) => {
    console.log("=== STARTING VENUE SUBMISSION ===");
    console.log("Venue to submit:", venue.name, "ID:", venue.id);
    
    try {
      // Update venue status to submitted
      await Venue.update(venue.id, { status: "submitted" });
      console.log("✓ Venue status updated to 'submitted'");
      
      // Optimistically update UI
      const updatedVenues = venues.map(v => 
        v.id === venue.id ? { ...v, status: "submitted" } : v
      );
      setVenues(updatedVenues);
      
      // Send email notification - with explicit error handling
      console.log("=== ATTEMPTING EMAIL SEND ===");
      console.log("Recipient: info@renzairegroup.com");
      console.log("Subject: Venue Submission for Review:", venue.name);
      console.log("User info:", { name: user?.full_name, email: user?.email });
      
      let emailSent = false;
      let emailError = null;
      
      try {
        console.log("Calling SendEmail integration...");
        const emailResult = await SendEmail({
          to: "info@renzairegroup.com",
          from_name: "Strathwell Platform",
          subject: `Venue Submission for Review: ${venue.name}`,
          body: `
            <div style="font-family: sans-serif; line-height: 1.6;">
              <h2>Venue Submitted for Review</h2>
              <p>A venue has been submitted for approval on the Strathwell marketplace.</p>
              <hr>
              <h3>Venue Details:</h3>
              <ul>
                <li><strong>Venue ID:</strong> ${venue.id}</li>
                <li><strong>Name:</strong> ${venue.name}</li>
                <li><strong>Location:</strong> ${venue.city}, ${venue.state}</li>
                <li><strong>Category:</strong> ${venue.category}</li>
                <li><strong>Capacity:</strong> ${venue.capacity_min}-${venue.capacity_max} guests</li>
                <li><strong>Submitted By:</strong> ${user?.full_name || 'N/A'} (${user?.email || 'N/A'})</li>
              </ul>
              <p>Please review and approve this venue listing in your admin dashboard.</p>
              <br>
              <p>Best regards,<br>Strathwell Platform</p>
            </div>
          `
        });
        
        console.log("✓✓✓ EMAIL SENT SUCCESSFULLY! ✓✓✓");
        console.log("Email result:", JSON.stringify(emailResult, null, 2));
        emailSent = true;
        
      } catch (err) {
        emailError = err;
        console.error("✗✗✗ EMAIL SENDING FAILED! ✗✗✗");
        console.error("Error type:", err.constructor.name);
        console.error("Error message:", err.message);
        console.error("Full error:", err);
        if (err.response) {
          console.error("Error response:", err.response);
        }
        if (err.stack) {
          console.error("Stack trace:", err.stack);
        }
      }
      
      // Show appropriate message to user
      if (emailSent) {
        toast.success("Venue submitted for review! Email notification sent.");
      } else {
        toast.warning(`Venue submitted but email failed: ${emailError?.message || 'Unknown error'}. Please notify admin manually.`);
      }
      
      // Refresh the venue list
      await fetchData();
      console.log("=== SUBMISSION COMPLETE ===");
      
    } catch (error) {
      console.error("✗ SUBMISSION FAILED:", error);
      toast.error("Failed to submit venue for review. Please try again.");
      
      // Revert status on failure
      const revertedVenues = venues.map(v => 
        v.id === venue.id ? { ...v, status: "draft" } : v
      );
      setVenues(revertedVenues);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      hidden: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <Pencil className="w-4 h-4" />,
      submitted: <Clock className="w-4 h-4" />,
      active: <CheckCircle className="w-4 h-4" />,
      hidden: <WarningCircle className="w-4 h-4" />
    };
    return icons[status] || icons.draft;
  };

  const filteredVenues = venues.filter(venue =>
    venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Venues</h1>
              <p className="text-gray-600">Manage your venue listings and track their status</p>
            </div>
            <Link to={createPageUrl("AddVenue")}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Add New Venue
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredVenues.length > 0 ? (
            <div className="grid gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Venue Image */}
                      <div className="lg:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={venue.hero_photo_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"}
                          alt={venue.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Venue Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{venue.city}, {venue.state}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{venue.capacity_min}-{venue.capacity_max} guests</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge className={`${getStatusColor(venue.status)} flex items-center gap-1`}>
                              {getStatusIcon(venue.status)}
                              {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Updated {new Date(venue.updated_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {venue.description || "No description provided"}
                        </p>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-2">
                            {venue.status === 'active' || venue.status === 'submitted' ? (
                              <>
                                <Switch 
                                  id={`live-switch-${venue.id}`}
                                  checked={venue.status === 'active'}
                                  onCheckedChange={(checked) => handleStatusChange(venue, checked)}
                                  disabled={venue.status === 'draft' || venue.status === 'submitted'}
                                />
                                <label htmlFor={`live-switch-${venue.id}`} className="text-sm font-medium text-gray-700">
                                  {venue.status === 'active' ? 'Live on Marketplace' : 
                                   venue.status === 'submitted' ? 'Pending Review' : 
                                   'Hidden from Marketplace'}
                                </label>
                              </>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Draft - Not yet submitted for review
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {venue.status === 'draft' && (
                              <Button 
                                onClick={() => handleSubmitForReview(venue)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Submit for Review
                              </Button>
                            )}
                            
                            <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link to={createPageUrl(`EditVenue?id=${venue.id}`)}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg">
              <CardContent className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  {searchQuery ? "No venues found" : "No venues yet"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first venue to the platform"
                  }
                </p>
                <Link to={createPageUrl("AddVenue")}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}
