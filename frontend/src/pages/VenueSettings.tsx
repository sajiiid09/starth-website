
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { UploadFile } from "@/api/integrations"; // Added import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gear, Bell, CreditCard, FloppyDisk, SpinnerGap, Camera } from "@phosphor-icons/react"; // Added Camera import
import RoleGuard from "../components/auth/RoleGuard";
import VenuePortalLayout from "../components/venue/VenuePortalLayout";
import { toast } from "sonner"; // Added import

export default function VenueSettingsPage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // Added state
  const [userSettings, setUserSettings] = useState({
    full_name: "",
    phone: "",
    email: "",
    profile_picture_url: "" // Added field
  });
  const [notifications, setNotifications] = useState({
    email_bookings: true,
    email_messages: true,
    email_marketing: false,
    sms_bookings: false,
    sms_reminders: true
  });
  const [payoutSettings, setPayoutSettings] = useState({
    payout_email: "",
    payout_method: "bank_transfer",
    bank_account: "",
    routing_number: "",
    tax_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setUserSettings({
        full_name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        profile_picture_url: currentUser.profile_picture_url || "" // Initialized from user data
      });

      const defaultNotifications = {
        email_bookings: true,
        email_messages: true,
        email_marketing: false,
        sms_bookings: false,
        sms_reminders: true
      };
      setNotifications({ ...defaultNotifications, ...(currentUser.notification_preferences || {}) });

      const orgs = await Organization.filter({ owner_user_id: currentUser.id, type: "venue_owner" });
      if (orgs.length > 0) {
        const org = orgs[0];
        setOrganization(org);
        if (org.payout_settings) {
          setPayoutSettings(prev => ({...prev, ...org.payout_settings}));
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    setLoading(false);
  };

  // Added function for image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setUserSettings(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success("Profile picture uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  const handleUserSettingChange = (field, value) => {
    setUserSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handlePayoutChange = (field, value) => {
    setPayoutSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveUserSettings = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        full_name: userSettings.full_name,
        phone: userSettings.phone,
        profile_picture_url: userSettings.profile_picture_url // Added field to update
      });
      
      // Dispatch event to update layout (e.g., header avatar)
      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: { 
          full_name: userSettings.full_name, 
          profile_picture_url: userSettings.profile_picture_url 
        }
      }));

      toast.success("Profile saved successfully!");
      await fetchData(); // Re-fetch to ensure all state is consistent, especially if user data changes.
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast.error("Failed to save profile.");
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({ notification_preferences: notifications });
      toast.success("Notification preferences saved!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Failed to save notification preferences.");
    }
    setSaving(false);
  };

  const handleSavePayout = async () => {
    setSaving(true);
    try {
      if (organization) {
        await Organization.update(organization.id, { payout_settings: payoutSettings });
        toast.success("Payout settings saved!");
      }
    } catch (error) {
      console.error("Error saving payout settings:", error);
      toast.error("Failed to save payout settings.");
    }
    setSaving(false);
  };

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
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and settings</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="w-5 h-5 text-blue-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6"> {/* Changed space-y-4 to space-y-6 */}
                 {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userSettings.profile_picture_url} />
                    <AvatarFallback className="text-xl">
                      {userSettings.full_name?.[0]?.toUpperCase() || userSettings.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profile_picture" className="cursor-pointer">
                      <Button variant="outline" disabled={uploading} asChild>
                        <span>
                          {uploading ? (
                            <>
                              <SpinnerGap className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              Change Photo
                            </>
                          )}
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={userSettings.full_name}
                      onChange={(e) => handleUserSettingChange("full_name", e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userSettings.phone}
                      onChange={(e) => handleUserSettingChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={userSettings.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveUserSettings} disabled={saving || uploading}> {/* Added uploading to disabled prop */}
                    {saving ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : <FloppyDisk className="w-4 h-4 mr-2" />}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_bookings">Booking Updates</Label>
                        <p className="text-xs text-gray-500">New bookings, cancellations, and changes</p>
                      </div>
                      <Switch
                        id="email_bookings"
                        checked={notifications.email_bookings}
                        onCheckedChange={(value) => handleNotificationChange("email_bookings", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_messages">Messages</Label>
                        <p className="text-xs text-gray-500">New messages from organizers</p>
                      </div>
                      <Switch
                        id="email_messages"
                        checked={notifications.email_messages}
                        onCheckedChange={(value) => handleNotificationChange("email_messages", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_marketing">Marketing Updates</Label>
                        <p className="text-xs text-gray-500">Platform updates and tips</p>
                      </div>
                      <Switch
                        id="email_marketing"
                        checked={notifications.email_marketing}
                        onCheckedChange={(value) => handleNotificationChange("email_marketing", value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">SMS Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms_bookings">Urgent Bookings</Label>
                        <p className="text-xs text-gray-500">Last-minute bookings and cancellations</p>
                      </div>
                      <Switch
                        id="sms_bookings"
                        checked={notifications.sms_bookings}
                        onCheckedChange={(value) => handleNotificationChange("sms_bookings", value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms_reminders">Event Reminders</Label>
                        <p className="text-xs text-gray-500">Reminders for upcoming events</p>
                      </div>
                      <Switch
                        id="sms_reminders"
                        checked={notifications.sms_reminders}
                        onCheckedChange={(value) => handleNotificationChange("sms_reminders", value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : <FloppyDisk className="w-4 h-4 mr-2" />}
                    Save Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payout_email">Payout Email</Label>
                  <Input
                    id="payout_email"
                    type="email"
                    value={payoutSettings.payout_email}
                    onChange={(e) => handlePayoutChange("payout_email", e.target.value)}
                    placeholder="payments@yourvenue.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email for payout notifications</p>
                </div>

                <div>
                  <Label htmlFor="payout_method">Payout Method</Label>
                  <Select value={payoutSettings.payout_method} onValueChange={(value) => handlePayoutChange("payout_method", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer (ACH)</SelectItem>
                      <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                      <SelectItem value="check">Paper Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {payoutSettings.payout_method === "bank_transfer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <Input
                        id="routing_number"
                        value={payoutSettings.routing_number}
                        onChange={(e) => handlePayoutChange("routing_number", e.target.value)}
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_account">Account Number</Label>
                      <Input
                        id="bank_account"
                        type="password"
                        value={payoutSettings.bank_account}
                        onChange={(e) => handlePayoutChange("bank_account", e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="tax_id">Tax ID / EIN</Label>
                  <Input
                    id="tax_id"
                    value={payoutSettings.tax_id}
                    onChange={(e) => handlePayoutChange("tax_id", e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePayout} disabled={saving}>
                    {saving ? <SpinnerGap className="w-4 h-4 mr-2 animate-spin" /> : <FloppyDisk className="w-4 h-4 mr-2" />}
                    Save Payout Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </VenuePortalLayout>
    </RoleGuard>
  );
}
