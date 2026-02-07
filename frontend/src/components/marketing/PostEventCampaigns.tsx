import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Envelope, Lightning, ArrowLeft, Upload, Copy } from "@phosphor-icons/react";
import { MarketingCampaign } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const postEventTemplates = [
  { 
    type: "thank_you", 
    title: "Thank-You Email", 
    description: "Thank attendees for coming.",
    defaultHeadline: "Thank You for Making Our Event Amazing!",
    defaultBody: "Dear [Attendee Name],\n\nThank you so much for attending [Event Name]! Your participation made the event truly special.\n\n✨ Event Highlights:\n• [Key Takeaway 1]\n• [Key Takeaway 2]\n• [Key Takeaway 3]\n\n📸 Photos and resources will be shared soon. Stay connected for upcoming events!\n\nWith gratitude,\n[Your Name]",
    defaultCTA: "View Event Photos"
  },
  { 
    type: "event_recap", 
    title: "Event Recap Email", 
    description: "Share highlights and photos.",
    defaultHeadline: "🎉 [Event Name] Recap - What an Event!",
    defaultBody: "What an incredible event we had! Here are the highlights from [Event Name]:\n\n📊 Event Stats:\n• [X] attendees joined us\n• [Y] sessions delivered\n• [Z]% satisfaction rate\n\n🎯 Key Takeaways:\n[List 3-4 major insights or announcements]\n\n📸 Event photos and presentation slides are now available in the link below.\n\nThank you for being part of this amazing community!",
    defaultCTA: "Access Resources"
  },
  { 
    type: "sponsor_appreciation", 
    title: "Sponsor Appreciation Email", 
    description: "Publicly thank your sponsors.",
    defaultHeadline: "A Special Thank You to Our Amazing Sponsors",
    defaultBody: "We couldn't have made [Event Name] such a success without our incredible sponsors!\n\n🌟 A heartfelt thank you to:\n• [Sponsor 1] - [Sponsor Level]\n• [Sponsor 2] - [Sponsor Level]\n• [Sponsor 3] - [Sponsor Level]\n\nYour support made it possible for us to [specific impact/outcome]. We're grateful for your partnership and look forward to future collaborations.\n\n📈 Sponsor ROI reports will be shared separately.",
    defaultCTA: "Partner With Us"
  },
  { 
    type: "feedback_survey", 
    title: "Feedback Survey", 
    description: "Collect attendee feedback via Google Forms.",
    defaultHeadline: "Help Us Improve - Share Your Feedback",
    defaultBody: "Your experience matters to us! Please take 3 minutes to share your feedback about [Event Name].\n\n📝 Survey Topics:\n• Overall event experience\n• Session quality and relevance\n• Venue and logistics\n• Networking opportunities\n• Suggestions for future events\n\nYour insights help us create even better events. As a thank you, survey respondents will receive early access to our next event registration.\n\nThank you for helping us grow!",
    defaultCTA: "Take Survey"
  }
];

const CampaignEditor = ({ eventId, template, onSave, onCancel }) => {
  const [campaign, setCampaign] = useState({
    event_id: eventId,
    campaign_type: "post_event",
    template_type: template.type,
    name: `${template.title} Campaign`,
    headline: template.defaultHeadline,
    body: template.defaultBody,
    cta_text: template.defaultCTA,
    cta_url: "",
    status: "draft",
    social_captions_json: null as any,
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
      thank_you: "Thank you to everyone who joined us! What an amazing event 🙌 Already planning the next one! #EventSuccess #ThankYou #Community",
      event_recap: "🎉 EVENT RECAP: What an incredible day! Swipe to see highlights and key moments. Thank you to all attendees and speakers! #EventRecap #Success",
      sponsor_appreciation: "🙏 HUGE thanks to our amazing sponsors who made this event possible! Your support means everything to our community 💙 #Sponsors #Gratitude #Partnership",
      feedback_survey: "Your voice matters! 📝 Help us make our next event even better by sharing your feedback. Link in bio! #Feedback #EventPlanning #Community"
    };
    return captions[templateType] || captions.thank_you;
  };

  const generateLinkedInCaption = (templateType) => {
    const captions = {
      thank_you: "Thank you to all the professionals who attended our event. Your engagement and insights made it a tremendous success. Looking forward to continuing these valuable connections and conversations.",
      event_recap: "Event recap: We brought together industry leaders for meaningful discussions and networking. Key insights shared, connections made, and partnerships formed. Thank you to our speakers and attendees for making this event impactful.",
      sponsor_appreciation: "We extend our sincere gratitude to the corporate partners who supported our event. Your investment in our community enables us to create valuable professional development opportunities and foster industry connections.",
      feedback_survey: "Your professional insights are invaluable to us. We'd appreciate 3 minutes of your time to share feedback about our recent event. Your input directly influences how we design future professional development opportunities."
    };
    return captions[templateType] || captions.thank_you;
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
      console.log('File uploaded:', file.name);
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
              placeholder="e.g. Take Survey"
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
            <Lightning className="w-4 h-4 mr-2"/> 
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
        <label className="text-sm font-medium block mb-2">Upload Event Photos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 font-medium">Click to upload event photos</span>
            <span className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB each</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          <a href="https://forms.google.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Create Google Form</Button>
          </a>
          <a href="https://login.mailchimp.com/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Connect to Mailchimp</Button>
          </a>
        </div>
        <Button onClick={() => onSave(campaign)} className="bg-blue-600 hover:bg-blue-700">
          Save Campaign
        </Button>
      </div>
    </div>
  );
};

export default function PostEventCampaigns({ eventId, campaigns, onUpdate }) {
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
            {postEventTemplates.map(template => (
              <div
                key={template.type}
                className="cursor-pointer hover:border-blue-500 transition-colors border border-gray-200 rounded-lg p-4 space-y-2 bg-white hover:bg-gray-50"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start gap-2">
                  <Envelope className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
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
          <p className="text-sm text-center text-gray-500 py-4">No post-event campaigns created yet.</p>
        )}
       </>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Post-Event Campaigns</CardTitle>
          <CardDescription>Follow up with attendees and sponsors.</CardDescription>
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