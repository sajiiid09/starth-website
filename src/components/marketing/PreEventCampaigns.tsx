
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Mail, Zap, ArrowLeft, Upload, Copy } from "lucide-react";
import { MarketingCampaign } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const templates = [
  { 
    type: "save_the_date", 
    title: "Save-the-Date", 
    description: "Announce your event and get it on calendars.",
    defaultHeadline: "Save the Date - You're Invited!",
    defaultBody: "We're excited to invite you to our upcoming event. Mark your calendar and stay tuned for more details!\n\n📅 Date: [Event Date]\n📍 Location: [Event Location]\n\nMore information and registration coming soon!",
    defaultCTA: "Learn More"
  },
  { 
    type: "early_bird", 
    title: "Early-Bird Offer", 
    description: "Drive initial ticket sales with a discount.",
    defaultHeadline: "🐦 Early Bird Special - Limited Time!",
    defaultBody: "Be among the first to secure your spot! Take advantage of our exclusive early-bird pricing.\n\n💰 Save 25% when you register before [Date]\n🎟️ Regular Price: $[X] | Early Bird: $[Y]\n\nThis offer won't last long - secure your spot today!",
    defaultCTA: "Register Now"
  },
  { 
    type: "reminder", 
    title: "Registration Reminder", 
    description: "Nudge subscribers who haven't registered yet.",
    defaultHeadline: "Don't Miss Out - Registration Still Open",
    defaultBody: "We noticed you haven't registered yet for our upcoming event. Don't worry - there's still time!\n\n🗓️ Event Date: [Date]\n⏰ Registration Deadline: [Deadline]\n🎯 What You'll Get: [Key Benefits]\n\nSeats are filling up fast. Reserve yours today!",
    defaultCTA: "Register Now"
  },
  { 
    type: "speaker_spotlight", 
    title: "Speaker Spotlight", 
    description: "Highlight a key speaker to build excitement.",
    defaultHeadline: "Meet Our Keynote Speaker: [Speaker Name]",
    defaultBody: "We're thrilled to announce [Speaker Name] as our keynote speaker!\n\n🌟 [Speaker Title] at [Company]\n📚 Author of [Book/Achievement]\n🎤 Speaking on: [Topic]\n\n[Speaker Bio - 2-3 sentences about their expertise and what attendees will learn]\n\nDon't miss this opportunity to learn from industry leaders!",
    defaultCTA: "Secure Your Seat"
  },
  { 
    type: "speaker_outreach", 
    title: "Speaker Outreach", 
    description: "Invite potential speakers to your event.",
    defaultHeadline: "Speaking Opportunity: [Event Name]",
    defaultBody: "Dear [Speaker Name],\n\nI hope this email finds you well. I'm reaching out to invite you to speak at our upcoming [Event Name] on [Date].\n\n🎯 Event Focus: [Event Theme]\n👥 Expected Audience: [Audience Size] [Industry] professionals\n📅 Speaking Slot: [Duration] on [Topic Area]\n💼 What We Offer: [Compensation/Benefits]\n\nYour expertise in [Relevant Field] would be invaluable to our attendees. Would you be interested in discussing this opportunity further?\n\nBest regards,\n[Your Name]",
    defaultCTA: "View Full Details"
  },
  { 
    type: "last_chance", 
    title: "Last-Chance Registration", 
    description: "Create urgency before registration closes.",
    defaultHeadline: "⏰ Last Chance - Registration Closes Tomorrow!",
    defaultBody: "This is your final reminder - registration for [Event Name] closes in less than 24 hours!\n\n🚨 Deadline: Tomorrow at midnight\n🎟️ Remaining Spots: Limited\n💡 What You'll Miss: [Key Benefits]\n\nDon't let this opportunity slip away. The next event won't be until [Next Date].\n\nRegister now before it's too late!",
    defaultCTA: "Register Before It's Too Late"
  },
];

const CampaignEditor = ({ eventId, template, onSave, onCancel }) => {
  const [campaign, setCampaign] = useState({
    event_id: eventId,
    campaign_type: "pre_event",
    template_type: template.type,
    name: `${template.title} Campaign`,
    headline: template.defaultHeadline,
    body: template.defaultBody,
    cta_text: template.defaultCTA,
    cta_url: "",
    status: "draft",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

  const handleGenerateCaptions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const captions = {
        instagram: generateInstagramCaption(template.type),
        linkedin: generateLinkedInCaption(template.type)
      };
      setCampaign(prev => ({
        ...prev,
        social_captions_json: captions
      }));
      setShowCaptions(true);
      setIsGenerating(false);
    }, 1500);
  };

  const generateInstagramCaption = (templateType) => {
    const captions = {
      save_the_date: "📅 SAVE THE DATE! Something amazing is coming your way... ✨ Mark your calendars and stay tuned for all the details! 🎉 #SaveTheDate #Event #ComingSoon #Excited",
      early_bird: "🐦 EARLY BIRD ALERT! 🚨 Get your tickets now and save big! Limited time offer - don't miss out on this incredible opportunity! 💫 #EarlyBird #EventTickets #LimitedTime #SaveMoney",
      reminder: "⏰ REMINDER: Don't miss out! Registration is still open but not for long... Secure your spot today! 🎯 #DontMissOut #RegisterNow #LastChance #EventReminder",
      speaker_spotlight: "🌟 SPEAKER SPOTLIGHT! We're incredibly excited to announce our keynote speaker! Get ready to be inspired! 🎤✨ #Speaker #Keynote #Inspiration #EventSpeaker",
      speaker_outreach: "🎤 Calling all industry experts! Would you like to share your knowledge with our amazing community? Let's connect! 💼 #SpeakingOpportunity #Industry #Expertise #CallForSpeakers",
      last_chance: "🚨 LAST CHANCE! ⏰ Registration closes TOMORROW! Don't miss this incredible opportunity - secure your spot NOW! 🎟️ #LastChance #DeadlineTomorrow #RegisterNow #DontMissOut"
    };
    return captions[templateType] || captions.save_the_date;
  };

  const generateLinkedInCaption = (templateType) => {
    const captions = {
      save_the_date: "Exciting news! Our upcoming event is designed to bring together industry leaders and innovators. Save the date and be part of something transformative. Details coming soon. #Professional #Networking #Industry",
      early_bird: "Take advantage of our early bird pricing and join industry professionals for an exceptional learning experience. Limited time offer - secure your investment in professional development today. #ProfessionalDevelopment #EarlyBird #Industry",
      reminder: "Don't miss this opportunity to advance your career and expand your network. Registration is still open, but spaces are limited. Join us for insights that will shape your professional journey. #CareerDevelopment #Networking #Professional",
      speaker_spotlight: "We're honored to feature an industry thought leader who will share invaluable insights and strategies. This keynote presentation will provide actionable takeaways for your professional growth. #ThoughtLeadership #Professional #Industry",
      speaker_outreach: "We're seeking dynamic speakers to share their expertise with our professional community. If you're passionate about [industry] and have insights to share, we'd love to hear from you. #Speaking #Professional #Industry",
      last_chance: "Final opportunity to join industry leaders for insights, networking, and professional development. Registration closes tomorrow. Don't miss this investment in your career growth. #FinalNotice #Professional #CareerGrowth"
    };
    return captions[templateType] || captions.save_the_date;
  };

  const insertCaption = (platform, field) => {
    const caption = campaign.social_captions_json?.[platform];
    if (caption) {
      if (field === 'headline') {
        setCampaign(prev => ({ ...prev, headline: caption }));
      } else if (field === 'body') {
        setCampaign(prev => ({ ...prev, body: prev.body + '\n\n' + caption }));
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, you would upload to your storage service
      // For now, we'll just show a placeholder
      console.log('File uploaded:', file.name);
      // You could integrate with UploadFile integration here
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to templates
      </Button>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Campaign Name</label>
          <Input
            placeholder="Campaign Name"
            value={campaign.name}
            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">Email Headline</label>
          <Input
            placeholder="Email Headline"
            value={campaign.headline}
            onChange={(e) => setCampaign({ ...campaign, headline: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Email Body</label>
          <Textarea
            placeholder="Email Body"
            value={campaign.body}
            onChange={(e) => setCampaign({ ...campaign, body: e.target.value })}
            rows={8}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">CTA Text</label>
            <Input
              placeholder="e.g. Register Now"
              value={campaign.cta_text}
              onChange={(e) => setCampaign({ ...campaign, cta_text: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">CTA URL</label>
            <Input
              placeholder="https://..."
              value={campaign.cta_url}
              onChange={(e) => setCampaign({ ...campaign, cta_url: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg bg-gray-50 p-4 border">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Social Media Captions</label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateCaptions} 
            disabled={isGenerating}
          >
            <Zap className="w-4 h-4 mr-2"/> 
            {isGenerating ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
        
        {showCaptions && campaign.social_captions_json && (
          <div className="space-y-4 pt-4 border-t">
            <div className="p-3 bg-white rounded-md border">
              <div className="flex justify-between items-start mb-2">
                <strong className="text-sm font-semibold">Instagram:</strong>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigator.clipboard.writeText(campaign.social_captions_json.instagram)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-sm text-gray-700">{campaign.social_captions_json.instagram}</p>
            </div>
            
            <div className="p-3 bg-white rounded-md border">
              <div className="flex justify-between items-start mb-2">
                <strong className="text-sm font-semibold">LinkedIn:</strong>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigator.clipboard.writeText(campaign.social_captions_json.linkedin)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-sm text-gray-700">{campaign.social_captions_json.linkedin}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => insertCaption('instagram', 'body')}>
                <Copy className="w-3 h-3 mr-1" /> Use IG Caption
              </Button>
              <Button variant="outline" size="sm" onClick={() => insertCaption('linkedin', 'body')}>
                <Copy className="w-3 h-3 mr-1" /> Use LinkedIn
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Upload Image</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">Click to upload image</span>
            <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t">
        <div className="text-center">
          <span className="text-sm font-medium text-gray-600">Connect & Publish</span>
        </div>
        <div className="flex gap-2 justify-center p-3 bg-gray-50 rounded-lg border">
          <a href="https://login.mailchimp.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Connect to Mailchimp</Button>
          </a>
          <a href="https://www.eventbrite.com/signup/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Eventbrite Registration</Button>
          </a>
          <a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Create Google Form</Button>
          </a>
        </div>
        <Button onClick={() => onSave(campaign)} className="bg-blue-600 hover:bg-blue-700 w-full py-3 text-base">
          Save Campaign
        </Button>
      </div>
    </div>
  );
};

export default function PreEventCampaigns({ eventId, campaigns, onUpdate }) {
  const [view, setView] = useState("list");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSave = async (campaignData) => {
    await MarketingCampaign.create(campaignData);
    onUpdate();
    setSelectedTemplate(null);
    setView("list");
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setView("editor");
  };

  const renderContent = () => {
    if (view === "templates") {
      return (
        <div>
          <Button variant="ghost" onClick={() => setView("list")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to list
          </Button>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {templates.map(template => (
              <div
                key={template.type}
                className="cursor-pointer hover:border-blue-500 transition-colors border border-gray-200 rounded-lg p-4 space-y-2 bg-white hover:bg-gray-50"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                  <h3 className="text-md font-semibold text-gray-900">
                    {template.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (view === "editor" && selectedTemplate) {
      return (
        <CampaignEditor 
          eventId={eventId} 
          template={selectedTemplate} 
          onSave={handleSave} 
          onCancel={() => setView("templates")} 
        />
      );
    }

    return (
       <>
        {campaigns.length > 0 ? (
          <ul className="space-y-2">
            {campaigns.map(campaign => (
              <li key={campaign.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <span className="font-medium">{campaign.name}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 capitalize">{campaign.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">No pre-event campaigns created yet.</p>
        )}
       </>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pre-Event Campaigns</CardTitle>
          <CardDescription>Engage your audience before the event.</CardDescription>
        </div>
        {view === 'list' && (
          <Button variant="outline" onClick={() => setView("templates")}>
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
