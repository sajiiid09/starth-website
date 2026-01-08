
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User as UserIcon, 
  Camera, 
  Save, 
  Bell, 
  Shield,
  Loader2,
  Upload
} from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization_name: "",
    city: "",
    country: "",
    profile_picture_url: ""
  });
  const [notifications, setNotifications] = useState({
    email_events: true,
    email_marketing: false,
    email_reminders: true,
    sms_events: false,
    sms_reminders: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setProfile({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        organization_name: currentUser.organization_name || "",
        city: currentUser.city || "",
        country: currentUser.country || "",
        profile_picture_url: currentUser.profile_picture_url || ""
      });

      // Set notification preferences from user data
      const defaultNotifications = {
        email_events: true,
        email_marketing: false,
        email_reminders: true,
        sms_events: false,
        sms_reminders: true
      };
      setNotifications({ ...defaultNotifications, ...(currentUser.notification_preferences || {}) });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
    }
    setLoading(false);
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setProfile(prev => ({ ...prev, profile_picture_url: file_url }));
      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        full_name: profile.full_name,
        phone: profile.phone,
        organization_name: profile.organization_name,
        city: profile.city,
        country: profile.country,
        profile_picture_url: profile.profile_picture_url,
        notification_preferences: notifications
      });
      toast.success("Profile updated successfully!");
      
      // Emit custom event to notify layout of user data changes
      window.dispatchEvent(new CustomEvent('userProfileUpdated', {
        detail: { 
          full_name: profile.full_name, 
          profile_picture_url: profile.profile_picture_url 
        }
      }));
      
      await fetchData(); // Refresh user data in this component
      
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback className="text-xl">
                    {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile_picture" className="cursor-pointer">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => handleProfileChange("full_name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="organization_name">Organization</Label>
                  <Input
                    id="organization_name"
                    value={profile.organization_name}
                    onChange={(e) => handleProfileChange("organization_name", e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => handleProfileChange("city", e.target.value)}
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={profile.country} onValueChange={(value) => handleProfileChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
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
                      <Label htmlFor="email_events">Event Updates</Label>
                      <p className="text-xs text-gray-500">Notifications about your events</p>
                    </div>
                    <Switch
                      id="email_events"
                      checked={notifications.email_events}
                      onCheckedChange={(value) => handleNotificationChange("email_events", value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_reminders">Reminders</Label>
                      <p className="text-xs text-gray-500">Event and task reminders</p>
                    </div>
                    <Switch
                      id="email_reminders"
                      checked={notifications.email_reminders}
                      onCheckedChange={(value) => handleNotificationChange("email_reminders", value)}
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
                      <Label htmlFor="sms_events">Urgent Event Updates</Label>
                      <p className="text-xs text-gray-500">Last-minute event changes</p>
                    </div>
                    <Switch
                      id="sms_events"
                      checked={notifications.sms_events}
                      onCheckedChange={(value) => handleNotificationChange("sms_events", value)}
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
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving || uploading} className="bg-blue-600 hover:bg-blue-700">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
