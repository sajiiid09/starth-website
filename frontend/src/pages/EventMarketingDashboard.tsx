
import React, { useState, useEffect, useCallback } from "react";
import { Event } from "@/api/entities";
import { MarketingCampaign } from "@/api/entities";
import { Sponsor } from "@/api/entities";
import { GeneratedCaption } from "@/api/entities";
import { EventCollaborator } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Upload, 
  Calendar as CalendarIcon, 
  Users, 
  Mail,
  Video,
  FileText,
  Download,
  Plus,
  Settings,
  Megaphone,
  DollarSign,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

import PreEventCampaigns from "../components/marketing/PreEventCampaigns";
import PostEventCampaigns from "../components/marketing/PostEventCampaigns";
import Sponsorships from "../components/marketing/Sponsorships";
import CaptionMaker from "../components/marketing/CaptionMaker";
import MarketingAssets from "../components/marketing/MarketingAssets";
import TeamCoordination from "../components/marketing/TeamCoordination";

export default function EventMarketingDashboard({ eventId }) {
  const [event, setEvent] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assets");

  const loadEventData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        eventResult, 
        campaignsResult, 
        sponsorsResult, 
        captionsResult, 
        collabResult
      ] = await Promise.allSettled([
        Event.get(eventId),
        MarketingCampaign.filter({ event_id: eventId }),
        Sponsor.filter({ event_id: eventId }),
        GeneratedCaption.filter({ event_id: eventId }),
        EventCollaborator.filter({ event_id: eventId })
      ]);

      if (eventResult.status === 'fulfilled') {
        setEvent(eventResult.value);
      } else {
        console.error("Failed to load event:", eventResult.reason);
      }

      if (campaignsResult.status === 'fulfilled') {
        setCampaigns(campaignsResult.value);
      } else {
        console.error("Failed to load marketing campaigns:", campaignsResult.reason);
      }
      
      if (sponsorsResult.status === 'fulfilled') {
        setSponsors(sponsorsResult.value);
      } else {
        console.error("Failed to load sponsors:", sponsorsResult.reason);
      }

      if (captionsResult.status === 'fulfilled') {
        setCaptions(captionsResult.value);
      } else {
        console.error("Failed to load captions:", captionsResult.reason);
      }

      if (collabResult.status === 'fulfilled') {
        setCollaborators(collabResult.value);
      } else {
        console.error("Failed to load collaborators:", collabResult.reason);
      }

    } catch (error) {
      console.error("An unexpected error occurred while loading marketing data:", error);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId, loadEventData]);

  if (!eventId) {
    return (
      <div className="text-center py-12">
        <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Event</h3>
        <p className="text-gray-600">Choose an event to manage its marketing campaigns and assets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{event?.title}</CardTitle>
              <p className="text-gray-600 mt-1">
                {event?.date_start && new Date(event.date_start).toLocaleDateString()} • {event?.city}
              </p>
            </div>
            <Badge className="text-sm px-3 py-1 capitalize bg-blue-100 text-blue-800">
              {event?.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Marketing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="captions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Sponsors
          </TabsTrigger>
          <TabsTrigger value="coordination" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <MarketingAssets eventId={eventId} event={event} onRefresh={loadEventData} />
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="grid gap-6">
            <PreEventCampaigns 
              campaigns={campaigns.filter(c => c.campaign_type === 'pre_event')} 
              eventId={eventId}
              onRefresh={loadEventData}
            />
            <PostEventCampaigns 
              campaigns={campaigns.filter(c => c.campaign_type === 'post_event')} 
              eventId={eventId}
              onRefresh={loadEventData}
            />
          </div>
        </TabsContent>

        <TabsContent value="captions">
          <CaptionMaker eventId={eventId} captions={captions} onRefresh={loadEventData} />
        </TabsContent>

        <TabsContent value="sponsors">
          <Sponsorships sponsors={sponsors} eventId={eventId} onRefresh={loadEventData} />
        </TabsContent>

        <TabsContent value="coordination">
          <TeamCoordination 
            eventId={eventId} 
            event={event}
            collaborators={collaborators}
            onRefresh={loadEventData}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Event Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Integration</h3>
                <p className="text-gray-600 mb-6">
                  View your events in calendar format and integrate with Google Calendar
                </p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export to Google
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
