import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { Plan } from "@/api/entities";
import { User } from "@/api/entities";
import { Venue } from "@/api/entities";
import { Service } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { getGooglePlacePhotos } from "@/api/functions";
import { Sparkles, Loader2, Grid3x3, MessageSquare, Users, Search, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "../components/planner/ChatInterface";
import ResultsPanels from "../components/planner/ResultsPanels";
import VenueGrid from "../components/marketplace/VenueGrid";
import ServiceProviderGrid from "../components/marketplace/ServiceProviderGrid";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
import PlannerPromptBox from "@/components/planner/PlannerPromptBox";
import useGsapReveal from "@/components/utils/useGsapReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function AIPlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "marketplace" ? "marketplace" : "planner";
  const [activeMode, setActiveMode] = useState(initialMode);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI event planner. Tell me about your event and I'll find the perfect venues and vendors for you. You can also speak to me or share images!"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Finding your perfect event matches...");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [venues, setVenues] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    capacity: "",
    priceRange: "",
    category: "",
    eventType: ""
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const headerRef = React.useRef<HTMLDivElement>(null);
  const plannerRef = React.useRef<HTMLDivElement>(null);
  const marketplaceRef = React.useRef<HTMLDivElement>(null);

  const filterMarketplaceData = useCallback(() => {
    let filteredV = venues.filter(venue => {
      const matchesSearch = !searchQuery || 
        (venue.name && venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (venue.city && venue.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesState = !filters.state || venue.state === filters.state;
      const matchesCity = !filters.city || venue.city === filters.city;
      
      const matchesCapacity = !filters.capacity || 
        (filters.capacity === "small" && venue.capacity_max < 50) ||
        (filters.capacity === "medium" && venue.capacity_max >= 50 && venue.capacity_max <= 150) ||
        (filters.capacity === "large" && venue.capacity_max > 150);
      
      const matchesPrice = !filters.priceRange ||
        (filters.priceRange === "budget" && venue.rate_card_json?.base_rate < 3000) ||
        (filters.priceRange === "mid" && venue.rate_card_json?.base_rate >= 3000 && venue.rate_card_json?.base_rate <= 7000) ||
        (filters.priceRange === "premium" && venue.rate_card_json?.base_rate > 7000);

      const matchesEventType = !filters.eventType || (venue.tags && venue.tags.includes(filters.eventType));
      
      return matchesSearch && matchesState && matchesCity && matchesCapacity && matchesPrice && matchesEventType;
    });
    setFilteredVenues(filteredV);

    let filteredS = services.filter(service => {
      const matchesSearch = !searchQuery ||
        (service.name && service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.category && service.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !filters.category || service.category === filters.category;
      
      const stateMatch = !filters.state || service.state === filters.state || 
        (service.coverage_regions && service.coverage_regions.some(r => r.includes(filters.state)));
      
      const cityMatch = !filters.city || service.city === filters.city ||
        (service.coverage_regions && service.coverage_regions.some(r => 
          r.includes(filters.city) || 
          (r.toLowerCase().startsWith("all of") && filters.state && r.includes(filters.state))
        ));
      
      const matchesEventType = !filters.eventType || (service.event_types && service.event_types.includes(filters.eventType));

      return matchesSearch && matchesCategory && stateMatch && cityMatch && matchesEventType;
    });
    setFilteredServices(filteredS);
  }, [venues, services, searchQuery, filters]);

  useEffect(() => {
    checkUser();
    loadMarketplaceData();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setInputValue(prev => prev + finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    if (activeMode === "marketplace") {
      filterMarketplaceData();
    }
  }, [activeMode, filterMarketplaceData]);

  useEffect(() => {
    setSearchParams((params) => {
      params.set("mode", activeMode);
      return params;
    }, { replace: true });
  }, [activeMode, setSearchParams]);

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const target =
      activeMode === "planner" ? plannerRef.current : marketplaceRef.current;

    if (!target) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        target,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }, target);

    return () => context.revert();
  }, [activeMode, prefersReducedMotion]);

  const checkUser = async () => {
    try {
      const cachedUser = sessionStorage.getItem('currentUser');
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        return;
      }

      const currentUser = await User.me();
      setUser(currentUser);
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } catch (error) {
      console.log("User not authenticated:", error);
      setUser(null);
    }
  };

  const loadMarketplaceData = async () => {
    try {
      const [venuesData, servicesData] = await Promise.all([
        Venue.filter({ status: "active" }),
        Service.filter({ status: "active" })
      ]);
      setVenues(venuesData);
      setServices(servicesData);
      setFilteredVenues(venuesData);
      setFilteredServices(servicesData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
    }
  };

  const startRecording = () => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    setInputValue("");

    try {
      recognition.start();
      setIsRecording(true);
      toast.success('Listening... Speak now');
      
      setTimeout(() => {
        if (recognition && isRecording) {
          recognition.stop();
          setIsRecording(false);
          toast.info("Recording auto-stopped after 60 seconds.");
        }
      }, 60000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      toast.success('Recording stopped');
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(`Some files are too large. Maximum size is 5MB per image.`);
      return;
    }

    setUploadingImage(true);
    const successfulUploads = [];
    const failedUploads = [];
    
    for (const file of files) {
      try {
        let uploadSuccess = false;
        let attempts = 0;
        
        while (!uploadSuccess && attempts < 3) {
          try {
            const { file_url } = await UploadFile({ file });
            successfulUploads.push(file_url);
            uploadSuccess = true;
          } catch (uploadError) {
            attempts++;
            console.error(`Upload attempt ${attempts} for ${file.name} failed:`, uploadError);
            
            if (attempts === 3) {
              failedUploads.push(file.name);
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
          }
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        failedUploads.push(file.name);
      }
    }
    
    if (successfulUploads.length > 0) {
      setUploadedImages([...uploadedImages, ...successfulUploads]);
      toast.success(`${successfulUploads.length} image(s) uploaded!`);
    }
    
    if (failedUploads.length > 0) {
      toast.error(`Failed to upload: ${failedUploads.join(', ')}`);
    }
    
    setUploadingImage(false);
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const injectStrathwellPartners = (intent, vendors = []) => {
    const injectedPartners = [];
    const specialNeeds = intent.specialNeeds || [];
    const queryLower = (intent.reasoning || '').toLowerCase();
    
    // CONTENT CREATION & SOCIAL MEDIA
    if (specialNeeds.some(need => ['content-creation', 'social-media', 'tiktok', 'instagram', 'creator-tools'].includes(need.toLowerCase())) ||
        queryLower.includes('creator') || queryLower.includes('tiktok') || queryLower.includes('content')) {
      injectedPartners.push({
        category: "Social Media & Content",
        name: "TikTok for Business",
        service: "Viral content campaigns, influencer partnerships, live event streaming, and post-event highlight reels to maximize your event's reach and engagement",
        price: 350,
        rating: 4.9,
        website: "https://www.tiktok.com/business",
        status: "not_contacted",
        why_matched: "Perfect for creating viral pre-event buzz and capturing authentic event moments for social media",
        is_partner: true
      });
    }
    
    // MARKETING & WEB
    if (specialNeeds.some(need => ['marketing', 'web', 'website', 'landing-page', 'post-campaign'].includes(need.toLowerCase())) ||
        queryLower.includes('marketing') || queryLower.includes('website') || queryLower.includes('bluehost')) {
      injectedPartners.push({
        category: "Marketing & Web Hosting",
        name: "Bluehost",
        service: "Professional event landing pages, registration portals, post-event resource hubs, and email marketing campaigns to engage attendees before and after your event",
        price: 175,
        rating: 4.8,
        website: "https://www.bluehost.com",
        status: "not_contacted",
        why_matched: "Essential for building a professional online presence for your event with easy-to-use website tools",
        is_partner: true
      });
    }
    
    // EVENT TECH & ANALYTICS
    if (specialNeeds.some(need => ['analytics', 'automation', 'tech', 'data'].includes(need.toLowerCase())) ||
        queryLower.includes('analytics') || queryLower.includes('automation')) {
      injectedPartners.push({
        category: "Event Technology & Analytics",
        name: "Pippit AI",
        service: "Real-time event analytics, attendee behavior tracking, automated follow-ups, and AI-powered insights to optimize your event ROI",
        price: 275,
        rating: 4.7,
        website: "https://www.pippit.ai",
        status: "not_contacted",
        why_matched: "Track engagement and automate post-event workflows with AI-powered analytics",
        is_partner: true
      });
    }
    
    // CHECK-IN & REGISTRATION
    if (specialNeeds.some(need => ['check-in', 'registration', 'visitor'].includes(need.toLowerCase())) ||
        queryLower.includes('check-in') || queryLower.includes('registration')) {
      injectedPartners.push({
        category: "Check-in & Visitor Management",
        name: "Envoy",
        service: "Touchless digital check-in, visitor management, badge printing, and real-time attendee tracking for seamless event entry",
        price: 225,
        rating: 4.8,
        website: "https://envoy.com",
        status: "not_contacted",
        why_matched: "Streamline attendee check-in with modern digital solutions",
        is_partner: true
      });
    }
    
    // PARKING & TRANSPORTATION
    if (specialNeeds.some(need => ['parking', 'valet', 'transportation'].includes(need.toLowerCase())) ||
        queryLower.includes('parking') || queryLower.includes('valet')) {
      injectedPartners.push({
        category: "Parking & Transportation",
        name: "Laz Parking",
        service: "Professional valet services, parking management, shuttle coordination, and VIP transportation solutions",
        price: 450,
        rating: 4.6,
        website: "https://www.lazparking.com",
        status: "not_contacted",
        why_matched: "Ensure smooth transportation logistics for your guests",
        is_partner: true
      });
    }
    
    // INSURANCE
    if (specialNeeds.some(need => ['insurance', 'liability', 'protection'].includes(need.toLowerCase())) ||
        queryLower.includes('insurance')) {
      injectedPartners.push({
        category: "Event Insurance",
        name: "NEXT Insurance",
        service: "Comprehensive event liability coverage, vendor insurance, and protection against cancellations and accidents",
        price: 325,
        rating: 4.9,
        website: "https://www.nextinsurance.com",
        status: "not_contacted",
        why_matched: "Protect your event investment with comprehensive insurance coverage",
        is_partner: true
      });
    }
    
    // ACCOMMODATIONS
    if (specialNeeds.some(need => ['hotel', 'accommodation', 'lodging'].includes(need.toLowerCase())) ||
        queryLower.includes('hotel') || queryLower.includes('accommodation')) {
      injectedPartners.push({
        category: "Travel & Accommodations",
        name: "IHG Hotels & Resorts",
        service: "Loyalty rewards program for group bookings, room blocks, and special event rates across premium hotel brands",
        price: 500,
        rating: 4.7,
        website: "https://www.ihg.com",
        status: "not_contacted",
        why_matched: "Earn rewards points on group bookings and access special event rates",
        is_partner: true
      });
      
      injectedPartners.push({
        category: "Travel & Accommodations",
        name: "Marriott Bonvoy",
        service: "Travel rewards program with group rates, meeting spaces, and points on event bookings across Marriott properties",
        price: 600,
        rating: 4.8,
        website: "https://www.marriott.com",
        status: "not_contacted",
        why_matched: "Maximize rewards on hotel bookings and access exclusive group rates",
        is_partner: true
      });
    }
    
    // BEVERAGES
    if (specialNeeds.some(need => ['beverage', 'wine', 'bar', 'drinks'].includes(need.toLowerCase())) ||
        queryLower.includes('wine') || queryLower.includes('beverage')) {
      injectedPartners.push({
        category: "Beverages & Bar Services",
        name: "Wines.com",
        service: "Curated wine selections, bartending services, and custom cocktail packages for your event",
        price: 475,
        rating: 4.8,
        website: "https://www.wines.com",
        status: "not_contacted",
        why_matched: "Elevate your event with premium beverage options",
        is_partner: true
      });
    }
    
    // Insert partners at the beginning of the vendors list
    return [...injectedPartners, ...vendors.filter(v => !v.is_partner)];
  };

  const calculateBudget = (venues, vendors, userQuery) => {
    const budgetMatch = userQuery.match(/budget[:\s]+\$?(\d+)[kK]?/i);
    let userBudget = null;
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      userBudget = budgetMatch[0].toLowerCase().includes('k') ? amount * 1000 : amount;
    }

    const venueCost = venues.length > 0 && venues[0].price 
      ? venues[0].price 
      : 0;

    const vendorsByCategory = {};
    let totalVendorCost = 0;

    vendors.forEach(vendor => {
      const category = vendor.category;
      const cost = vendor.price || 800;
      
      if (!vendorsByCategory[category]) {
        vendorsByCategory[category] = {
          cost: cost,
          vendor: vendor.name,
          reasoning: vendor.why_matched || vendor.service || 'Professional service provider'
        };
        totalVendorCost += cost;
      }
    });

    const totalEstimate = venueCost + totalVendorCost;
    const remaining = userBudget ? Math.max(0, userBudget - totalEstimate) : 0;

    return {
      venue: venueCost,
      vendors: totalVendorCost,
      vendor_breakdown: vendorsByCategory,
      total: totalEstimate,
      user_budget: userBudget,
      remaining: remaining,
      over_budget: userBudget && totalEstimate > userBudget
    };
  };

  const determineUserIntent = async (query) => {
    try {
      const conversationHistory = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const result = await InvokeLLM({
        prompt: `You are Strathwell's AI Event Intelligence Engine. Extract ALL event parameters from this conversation.

CONVERSATION HISTORY:
${conversationHistory}

LATEST USER MESSAGE: "${query}"

MANDATORY EXTRACTION - Return JSON with these fields:

{
  "intentType": string (MUST be one of: "VENUE_REQUEST", "VENDOR_REQUEST", "MARKETING_REQUEST", "BUDGET_REQUEST", "MIXED_REQUEST", "GENERAL_PLANNING"),
  "hasExistingVenue": boolean (TRUE if user says "I have a venue", "venue is secured", "already have a venue"),
  "needsVenuesOrVendors": boolean (true if they want recommendations, false for general questions),
  "eventType": string (birthday, wedding, corporate, launch, conference, networking, social, etc.),
  "eventTone": string (luxury, casual, fun, formal, budget-friendly, premium, creative, tech-forward, etc.),
  "guestCount": number or null,
  "location": string or null (city/region),
  "budgetSensitivity": string (low, mid, high, flexible, not-mentioned),
  "userBudget": number or null (if explicitly mentioned),
  "urgency": string (last-minute, within-month, flexible, advance-planning),
  "specialNeeds": array of strings (parking, A/V, catering, alcohol, kids-friendly, outdoor, branding, creator-tools, social-media, makeup, beauty, hair, glam, etc.),
  "missingCriticalInfo": array of strings (what key info is missing),
  "userPriorities": array of strings (cost, ambiance, location, capacity, brand-image, tech, etc.),
  "reasoning": string (brief explanation of what you understood)
}

INTENT CLASSIFICATION RULES (MANDATORY):
- If user mentions "makeup", "hair", "glam", "beauty" -> intentType = "VENDOR_REQUEST", specialNeeds must include "makeup"
- If user mentions "post campaign", "marketing", "ads", "website", "landing page" -> intentType = "MARKETING_REQUEST"
- If user mentions "creator tools", "content creation", "social media tools", "TikTok", "content creator" -> intentType = "VENDOR_REQUEST", specialNeeds must include "content-creation", "social-media"
- If user says "I have a venue" or "venue secured" OR says "not venue" OR "disregard venue" OR "no venue needed" -> hasExistingVenue = true, intentType = "VENDOR_REQUEST"
- If user asks for ONLY venues -> intentType = "VENUE_REQUEST"
- If user asks for specific vendors (catering, photography, creator tools, etc.) -> intentType = "VENDOR_REQUEST"
- If user asks about budget -> intentType = "BUDGET_REQUEST"
- If user asks for both venues AND vendors -> intentType = "MIXED_REQUEST"

CRITICAL RULES:
- If user requests SPECIFIC services (makeup, marketing, photography, content creation, etc.) -> missingCriticalInfo should be EMPTY (provide recommendations immediately)
- If user says they HAVE a venue -> missingCriticalInfo should be EMPTY (focus on vendors/services)
- If user says "NOT venue" or "no venue" or "disregard venue" -> hasExistingVenue = true, intentType = "VENDOR_REQUEST"
- If user requests "creator tools", "content tools", "social media tools" -> intentType = "VENDOR_REQUEST", specialNeeds: ["content-creation", "social-media"]
- ONLY mark info as missing if it's TRULY blocking recommendations
- When in doubt, proceed with recommendations rather than asking questions

Examples:
"I need makeup for my event" -> specialNeeds: ["beauty", "makeup"], missingCriticalInfo: [] (PROVIDE MAKEUP VENDORS IMMEDIATELY)
"I have a venue, need post campaigns" -> hasExistingVenue: true, specialNeeds: ["marketing", "social-media", "web"], missingCriticalInfo: [] (PROVIDE BLUEHOST + MARKETING VENDORS)
"Creator tools for my event, not venue" -> hasExistingVenue: true, specialNeeds: ["content-creation", "social-media", "marketing"], missingCriticalInfo: [] (PROVIDE TIKTOK + BLUEHOST)
"Find venues in SF for 100 guests" -> location: "san francisco", guestCount: 100, missingCriticalInfo: []`,
        response_json_schema: {
          type: "object",
          properties: {
            intentType: { 
              type: "string",
              enum: ["VENUE_REQUEST", "VENDOR_REQUEST", "MARKETING_REQUEST", "BUDGET_REQUEST", "MIXED_REQUEST", "GENERAL_PLANNING"]
            },
            hasExistingVenue: { type: "boolean" },
            needsVenuesOrVendors: { type: "boolean" },
            eventType: { type: "string" },
            eventTone: { type: "string" },
            guestCount: { type: "number" },
            location: { type: "string" },
            budgetSensitivity: { type: "string" },
            userBudget: { type: "number" },
            urgency: { type: "string" },
            specialNeeds: { type: "array", items: { type: "string" } },
            missingCriticalInfo: { type: "array", items: { type: "string" } },
            userPriorities: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" }
          },
          required: ["intentType", "hasExistingVenue", "needsVenuesOrVendors", "missingCriticalInfo"]
        }
      });
      return result;
    } catch (error) {
      console.error("Intent detection failed:", error);
      return { needsVenuesOrVendors: true, missingCriticalInfo: [] };
    }
  };

  const askClarifyingQuestion = async (intent) => {
    try {
      const result = await InvokeLLM({
        prompt: `You are Strathwell's AI Event Intelligence Engine. The user wants recommendations but is missing critical information.

WHAT WE KNOW:
${JSON.stringify(intent, null, 2)}

MISSING INFORMATION:
${intent.missingCriticalInfo.join(', ')}

Generate ONE smart, conversational clarifying question that will help you make better recommendations. Make it feel natural, not like a form.

Examples:
- "That sounds exciting! To find the perfect fit, what type of event are you planning?"
- "Great! How many guests are you expecting? This will help me narrow down the best venues."
- "I can help with that! What's your rough budget range so I can show you the best value options?"
- "Love it! Where are you thinking of hosting this event?"

Keep it friendly and conversational. Ask for the MOST important missing piece first.`,
      });
      return result;
    } catch (error) {
      console.error("Clarification failed:", error);
      return "To help you better, could you tell me more about your event? Specifically the type of event, guest count, and location?";
    }
  };

  const answerQuestion = async (question, images = []) => {
    try {
      const conversationContext = messages.slice(-4).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const result = await InvokeLLM({
        prompt: `You are an expert event planner assistant. Answer the user's question in a helpful, conversational way.

Previous conversation:
${conversationContext}

User question: "${question}"

Provide practical advice, creative ideas, and actionable tips for event planning. If they mention specific needs like venues or vendors, suggest they could search for those, but focus on answering their question first.

Keep your response natural, friendly, and under 200 words.`,
        add_context_from_internet: question.toLowerCase().includes('trend') || 
                                    question.toLowerCase().includes('ideas') ||
                                    question.toLowerCase().includes('popular') ||
                                    question.toLowerCase().includes('best'),
        file_urls: images.length > 0 ? images : undefined
      });
      return result;
    } catch (error) {
      console.error("Question answering failed:", error);
      return "I'm having trouble processing that right now. Could you rephrase your question?";
    }
  };

  const performDatabaseSearch = async (query, intent = null) => {
    try {
      console.log("Performing database search for:", query);
      
      const allVenues = await Venue.filter({ status: "active" });
      const allServices = await Service.filter({ status: "active" });
      
      if (allVenues.length === 0 && allServices.length === 0) {
        return null;
      }
      
      const queryLower = query.toLowerCase();
      
      const locationMappings = {
        'sfo': 'san francisco',
        'sf': 'san francisco', 
        'bay area': 'san francisco',
        'silicon valley': 'san francisco',
        'nyc': 'new york',
        'ny': 'new york',
        'manhattan': 'new york',
        'brooklyn': 'new york',
        'boston': 'boston',
        'bos': 'boston',
        'cambridge': 'boston',
        'san francisco': 'san francisco',
        'new york': 'new york',
        'los angeles': 'los angeles',
        'la': 'los angeles',
        'chicago': 'chicago',
        'miami': 'miami',
        'seattle': 'seattle',
        'austin': 'austin',
        'denver': 'denver'
      };
      
      let targetLocation = null;
      for (const [key, value] of Object.entries(locationMappings)) {
        if (queryLower.includes(key)) {
          targetLocation = value;
          break;
        }
      }

      let venuesToSearch = allVenues;
      let servicesToSearch = allServices;

      if (targetLocation) {
        venuesToSearch = allVenues.filter(v => 
          v.city && (
            v.city.toLowerCase().includes(targetLocation) || 
            v.state?.toLowerCase().includes(targetLocation) ||
            targetLocation.includes(v.city.toLowerCase())
          )
        );
        servicesToSearch = allServices.filter(s =>
          (s.city && ( 
            s.city.toLowerCase().includes(targetLocation) || 
            targetLocation.includes(s.city.toLowerCase())
          )) ||
          (s.state && ( 
            s.state.toLowerCase().includes(targetLocation) ||
            targetLocation.includes(s.state.toLowerCase())
          )) ||
          (s.coverage_regions && s.coverage_regions.some(region => 
            region.toLowerCase().includes(targetLocation) || 
            targetLocation.includes(region.toLowerCase())
          ))
        );
      }
      
      const eventTypes = ['wedding', 'corporate', 'conference', 'social', 'gala', 'party'];
      let detectedEventType = null;
      for (const type of eventTypes) {
        if (queryLower.includes(type)) {
          detectedEventType = type;
          break;
        }
      }

      const guestMatch = queryLower.match(/(\d+)[\s-]*(guest|person|people|attendee)/i);
      const guestCount = guestMatch ? parseInt(guestMatch[1]) : null;

      if (guestCount) {
        venuesToSearch = venuesToSearch.filter(v => 
          v.capacity_min <= guestCount && v.capacity_max >= guestCount
        );
      }

      if (detectedEventType) {
        venuesToSearch = venuesToSearch.filter(v => 
          v.tags && v.tags.includes(detectedEventType)
        );
        servicesToSearch = servicesToSearch.filter(s =>
          s.event_types && s.event_types.includes(detectedEventType)
        );
      }

      let filteredVenues = venuesToSearch
        .sort((a, b) => Number(b.featured || false) - Number(a.featured || false))
        .slice(0, 8)
        .map(v => ({
          ...v,
          location: `${v.address || 'Address not specified'}, ${v.city || 'City not specified'}, ${v.state || 'State not specified'}`,
          capacity: v.capacity_max,
          price: v.rate_card_json?.base_rate || 5000,
          rating: v.google_rating || v.rating || 4.5,
          image_url: v.hero_photo_url || v.gallery_urls?.[0] || null,
          status: "not_contacted"
        }));

      // Fetch Google Photos for each venue
      for (let venue of filteredVenues) {
        try {
          const response = await getGooglePlacePhotos({
            place_id: venue.google_place_id,
            name: venue.name,
            location: venue.location
          });
          if (response.data?.photos?.length > 0) {
            venue.image_url = response.data.photos[0];
            venue.photos = response.data.photos;
          }
        } catch (error) {
          console.error(`Failed to fetch photos for ${venue.name}:`, error);
        }
      }

      const essentialCategories = detectedEventType === 'wedding' 
        ? ['Catering', 'Photography & Videography', 'Florist & Fresh Flowers']
        : detectedEventType === 'corporate'
        ? ['Catering', 'Event Technology (AV/Stage)', 'Audio & DJ Services']
        : ['Catering', 'Entertainment & Media', 'Photography & Videography'];

      const filteredServices = [];
      const usedCategories = new Set();

      for (const category of essentialCategories) {
        const categoryServices = servicesToSearch
          .filter(s => s.category === category && !usedCategories.has(s.category))
          .sort((a, b) => Number(b.featured || false) - Number(a.featured || false));

        if (categoryServices.length > 0) {
          const servicesForCategory = categoryServices.slice(0, 2);
          for (const service of servicesForCategory) {
            const serviceObj = {
              ...service,
              service: service.description || `Professional ${service.category} services`,
              price: service.rate_card_json?.base_rate || 3000,
              rating: service.google_rating || service.rating || 4.6,
              image_url: service.photo_url || null,
              status: "not_contacted"
            };

            // Fetch Google Photos for each service
            try {
              const response = await getGooglePlacePhotos({
                place_id: service.google_place_id,
                name: service.name,
                location: `${service.city}, ${service.state}`
              });
              if (response.data?.photos?.length > 0) {
                serviceObj.image_url = response.data.photos[0];
                serviceObj.photos = response.data.photos;
              }
            } catch (error) {
              console.error(`Failed to fetch photos for ${service.name}:`, error);
            }

            filteredServices.push(serviceObj);
          }
          usedCategories.add(category);
        }
      }

      if (filteredVenues.length > 0 || filteredServices.length > 0) {
        const locationName = targetLocation ? 
          targetLocation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 
          'your area';

        const budget = calculateBudget(filteredVenues, filteredServices, query);
        
        const suggestedCategories = detectedEventType === 'wedding'
          ? ['Decor', 'Makeup & Styling', 'Transportation', 'Entertainment & Media']
          : detectedEventType === 'corporate'
          ? ['Event Management', 'Security & Bouncers', 'Transportation', 'Printing']
          : ['Decor', 'Entertainment & Media', 'Event Management'];

        return {
          message: `I found ${filteredVenues.length} venues and ${filteredServices.length} vendors in ${locationName}${guestCount ? ` for ${guestCount} guests` : ''}!`,
          event_type: detectedEventType || 'event',
          location: locationName,
          estimated_guests: guestCount,
          estimated_budget: budget.total,
          suggested_categories: suggestedCategories,
          venues: filteredVenues,
          vendors: filteredServices,
          budget: budget,
          timeline: [
            guestCount && guestCount > 200 ? "Start planning 8-12 months before event" : "Start planning 4-6 months before event",
            "Book venue 6-8 weeks before event", 
            "Confirm vendors 4-6 weeks before event", 
            "Final headcount 2 weeks before event",
            "Final walkthrough 1 week before event"
          ]
        };
      }

      return null;

    } catch (error) {
      console.error("Database search failed:", error);
      return null;
    }
  };
  
  const performIntelligentWebSearch = async (query, intent) => {
    console.log("Performing intelligent web search with intent:", intent);
    setLoadingMessage("Finding perfect matches and computing dynamic budgets...");

    const jsonSchema = {
      type: "object",
      properties: {
        message: { type: "string" },
        event_type: { type: "string" },
        location: { type: "string" },
        estimated_guests: { type: "integer" },
        estimated_budget: { type: "number" },
        suggested_categories: { type: "array", items: { type: "string" } },
        reasoning: {
          type: "object",
          properties: {
            why_these_venues: { type: "string" },
            why_these_vendors: { type: "string" },
            why_this_budget: { type: "string" },
            trade_offs: { type: "string" }
          }
        },
        optimization_question: { type: "string" },
        creative_concepts: {
          type: "object",
          properties: {
            venue_layouts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            },
            decor_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme_name: { type: "string" },
                  description: { type: "string" },
                  color_palette: { type: "array", items: { type: "string" } },
                  key_elements: { type: "array", items: { type: "string" } }
                }
              }
            },
            entertainment_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idea: { type: "string" },
                  description: { type: "string" },
                  estimated_cost: { type: "string" }
                }
              }
            }
          }
        },
        venues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              location: { type: "string" },
              capacity: { type: "integer" },
              price: { type: "number" },
              rating: { type: "number" },
              image_url: { type: "string" },
              website: { type: "string" },
              description: { type: "string" },
              why_matched: { type: "string" }
            },
            required: ["name", "location", "why_matched"]
          }
        },
        vendors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              name: { type: "string" },
              service: { type: "string" },
              price: { type: "number" },
              rating: { type: "number" },
              image_url: { type: "string" },
              website: { type: "string" },
              why_matched: { type: "string" }
            },
            required: ["category", "name", "why_matched"]
          }
        },
        budget: {
          type: "object",
          properties: {
            venue: { type: "number" },
            vendors: { type: "number" },
            vendor_breakdown: { 
              type: "object",
              description: "Each category mapped to {cost: number, vendor: string, reasoning: string}"
            },
            total: { type: "number" },
            user_budget: { type: "number" },
            remaining: { type: "number" },
            over_budget: { type: "boolean" },
            calculation_details: {
              type: "object",
              properties: {
                base_costs: { type: "string" },
                location_multiplier: { type: "number" },
                event_type_multiplier: { type: "number" },
                tone_multiplier: { type: "number" },
                urgency_multiplier: { type: "number" },
                applied_formula: { type: "string" }
              }
            },
            cost_optimization: {
              type: "object",
              properties: {
                save_money_by: { type: "array", items: { type: "string" } },
                upgrade_options: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        timeline: { type: "array", items: { type: "string" } }
      },
      required: ["message", "reasoning", "optimization_question"]
    };

    try {
      const result = await InvokeLLM({
        prompt: `You are Strathwell's AI Event Intelligence Engine. You analyze context and compute optimal recommendations.

USER REQUEST: "${query}"

EXTRACTED INTELLIGENCE:
- Event Type: ${intent.eventType || 'not specified'}
- Event Tone: ${intent.eventTone || 'not specified'}
- Guest Count: ${intent.guestCount || 'not specified'}
- Location: ${intent.location || 'not specified'}
- Budget Sensitivity: ${intent.budgetSensitivity || 'not mentioned'}
- User Budget: ${intent.userBudget ? '$' + intent.userBudget : 'not mentioned'}
- Special Needs: ${intent.specialNeeds?.join(', ') || 'none'}
- User Priorities: ${intent.userPriorities?.join(', ') || 'unknown'}

MANDATORY INTELLIGENCE PROCESS:

STEP 1 — DYNAMIC BUDGET INTELLIGENCE (MANDATORY):

Calculate realistic, adaptive budget ranges using THIS EXACT methodology:

A) BASE COST DETERMINATION:
- Small events (<50 guests): Venue $200-800, Per-guest $40-80
- Medium events (50-150): Venue $800-2000, Per-guest $60-120
- Large events (>150): Venue $2000-5000, Per-guest $80-180

B) LOCATION MULTIPLIER (Apply to base costs):
- NYC/San Francisco: 1.6x (high cost of living, premium market)
- Los Angeles/Seattle/Boston: 1.4x (major metro areas)
- Chicago/Austin/Denver: 1.2x (mid-tier cities)
- Other cities: 1.0x (baseline)

C) EVENT TYPE MULTIPLIER:
- Wedding: 1.5x (higher expectations, formality)
- Corporate/Launch: 1.3x (brand standards, professional requirements)
- Birthday/Social: 1.0x (baseline)
- Conference/Networking: 1.1x (A/V, tech needs)

D) TONE/QUALITY MULTIPLIER:
- Budget-friendly: 0.6x (value-focused, minimal frills)
- Standard: 1.0x (professional, clean execution)
- Premium: 1.6x (elevated experience, quality vendors)
- Luxury: 2.8x (high-end everything, concierge service)

E) URGENCY PENALTY:
- Last-minute (<2 weeks): 1.4x (limited availability)
- Short notice (<1 month): 1.2x (rush fees)
- Advance (>2 months): 0.95x (early bird discounts)

F) VENDOR CATEGORY BASE COSTS (Before multipliers):
- Catering: $25-50 per guest
- Photography: $500-2000 (time-based)
- Videography: $800-2500
- Entertainment/DJ: $400-1500
- Decor/Florals: $300-1500
- Beauty (makeup/hair): $150-400 per person
- Marketing/Web (Bluehost, etc.): $100-500
- Transportation: $300-800
- Insurance: $150-600

BUDGET CALCULATION FORMULA:
Total = (Venue Base + (Guest Count × Per-Guest Cost) + Sum of Vendor Costs) × Location Multiplier × Event Type Multiplier × Tone Multiplier × Urgency Multiplier

BUDGET EXPLANATION (MANDATORY OUTPUT):
You MUST include in "why_this_budget":
- Starting calculation: "Base venue $X + ($Y per guest × Z guests) = $A"
- Applied multipliers: "Location (City): 1.Xx, Event Type: 1.Xx, Tone: 1.Xx = $B"
- Vendor breakdown: "Catering $X + Photo $Y + ... = $C"
- Final total: "$B + $C = $TOTAL"
- If user has a budget: "Your budget of $X allows for [premium/standard/budget] tier vendors"
- Budget flexibility: "You can save $X by [specific trade-off] or spend $Y more for [upgrade]"

TRADE-OFFS ANALYSIS (MANDATORY OUTPUT):
You MUST include in "trade_offs":
- Cost-saving options: "Reduce decor budget by $X to stay under budget"
- Premium upgrades: "Add $X for professional videography"
- Venue vs. Vendors: "A $X cheaper venue leaves $Y more for catering/entertainment"
- Location vs. Quality: "Moving from downtown saves $X but reduces accessibility"
- DIY opportunities: "Self-coordinated setup saves $X but requires more time"

CRITICAL: NO STATIC PRICING. Every budget must be computed fresh using this formula.

STEP 2 — STRATHWELL PARTNER PRIORITY MATCHING:
IMMEDIATELY include Strathwell Partners when user needs match:

BEAUTY & PERSONAL STYLING:
- If user mentions "makeup", "beauty", "styling", "glam" -> Include Makeup Artist Vendors (category: "Beauty & Glam")

WEB & POST-CAMPAIGN MARKETING:
- If user mentions "post campaigns", "website", "landing page", "promotion", "email marketing", "ads" -> Include Bluehost FIRST
- Bluehost: Post-event websites, landing pages, email campaigns, registration pages ($100-250)

INSURANCE & PROTECTION:
- If user mentions "insurance", "liability", "protection" -> Include NEXT Insurance
- NEXT Insurance: Event liability coverage, vendor insurance, comprehensive protection ($150-500)

SOCIAL MEDIA & CONTENT CREATION:
- If user mentions "social media", "content creation", "creator tools", "viral", "TikTok", "Instagram", "content tools" -> Include:
  - TikTok: Viral campaigns, influencer promotion, pre/post-event content, live streaming ($200-500)
  - Bluehost: Landing pages, content hubs, creator portfolios ($100-250)
  - Content Creator Vendors (category: "Content & Social Media")

EVENT TECH & AUTOMATION:
- If user mentions "analytics", "automation", "check-in", "registration" -> Include:
  - Pippit AI: Event analytics, automation, data insights ($150-400)
  - Envoy: Digital check-in, visitor management, badge printing ($150-300)

TRANSPORTATION & PARKING:
- If user mentions "parking", "valet", "transportation", "shuttle" -> Include:
  - Laz Parking: Valet services, parking management, shuttle coordination ($300-600)

TRAVEL & ACCOMMODATIONS:
- If user mentions "hotels", "accommodations", "lodging", "rooms" -> Include:
  - IHG Hotels & Resorts: Loyalty rewards program, group rates ($400-600 setup/coordination)
  - Marriott Bonvoy: Travel rewards program, group bookings ($500-700 setup/coordination)
  - Luxury Escapes: Group travel packages, destination events ($200-600)

BEVERAGES & BAR:
- If user mentions "beverages", "bar", "wine", "drinks" -> Include:
  - Wines.com: Curated wine packages, bar services ($250-700)

CRITICAL EXECUTION RULES:
- ALWAYS prioritize Strathwell Partners FIRST when they match
- For each partner, explain SPECIFICALLY how they solve the user's need
- If user says "I have a venue" -> DO NOT recommend venues, focus 100% on vendors/services
- If user requests specific services -> IMMEDIATELY provide those vendors without asking questions

STEP 3 — CONDITIONAL VENUE MATCHING (CRITICAL ENFORCEMENT):

INTENT-BASED EXECUTION:
- IF intentType = "VENDOR_REQUEST" OR hasExistingVenue = true:
  → SET venues array to EMPTY []
  → DO NOT search for venues
  → DO NOT mention venues in response
  → FOCUS 100% on vendors only

- IF intentType = "VENUE_REQUEST":
  → Find 6-8 venues ONLY
  → Limit vendors to essential services
  
- IF intentType = "MARKETING_REQUEST":
  → SET venues array to EMPTY []
  → ONLY return marketing vendors (Bluehost, social media, content creators)

- IF intentType = "MIXED_REQUEST":
  → Find both venues and vendors IF hasExistingVenue = false
  → If hasExistingVenue = true, only vendors

OTHERWISE (intentType = "MIXED_REQUEST" and no existing venue), find 6-8 venues that match:
- Guest capacity (with 20% buffer)
- Event tone and style
- Location accessibility
- Special needs (A/V, parking, alcohol, outdoor, etc.)
- Budget tier

For EACH venue include "why_matched": Explain why THIS venue fits THEIR specific event.

STEP 4 — VENDOR MATCHING WITH REASONING:

KEYWORD ACTIVATION (HARD RULES - MANDATORY):
- IF specialNeeds contains "makeup", "beauty", "hair", or "glam":
  → MUST include 2-3 vendors in "Beauty & Glam" category
  → Each vendor must have "why_matched" explaining makeup/beauty needs

- IF specialNeeds contains "marketing", "post-campaign", "website", "landing-page", "ads":
  → MUST include Bluehost FIRST (category: "Marketing & Web")
  → MUST include 2-3 Social Media Marketing vendors
  → MUST include Content Creator vendors
  → Each with specific "why_matched" for their marketing needs

- IF specialNeeds contains "content-creation", "content", "social-media", "tiktok", "instagram", "creator-tools":
  → MUST include TikTok FIRST in "Social Media & Content" category
  → MUST include Bluehost for landing pages/content hubs
  → MUST include 2-3 Content Creator vendors
  → Each with specific "why_matched" explaining how they help create viral content, manage social campaigns, or build creator tools

- IF specialNeeds contains "insurance":
  → MUST include NEXT Insurance

- IF specialNeeds contains "photography", "photo", "video":
  → MUST include Photography/Videography vendors

- IF specialNeeds contains "catering", "food", "drinks":
  → MUST include Catering vendors

Find 8-12 vendors total across categories that match:
- User's SPECIFIC service requests (detected from keywords)
- Event style and tone
- Budget tier
- Guest count capacity (if known)
- Timing feasibility

For EACH vendor include "why_matched": Explain SPECIFICALLY how they solve the user's stated need.

STEP 5 — REASONING OUTPUT (MANDATORY):
Provide detailed, specific reasoning:

why_these_venues:
"I selected these venues because [specific capacity match], [location accessibility], [style alignment with ${intent.eventTone} tone], and [price point fits ${intent.budgetSensitivity} budget]."

why_these_vendors:
"These vendors were chosen for [style compatibility], [proven track record with ${intent.eventType} events], [budget tier alignment], and [availability for your timeline]."

why_this_budget (CRITICAL - MUST BE DETAILED):
"Starting with a base venue cost of $X for ${intent.guestCount} guests ($Y per guest), I applied:
- ${intent.location} location multiplier (Ax)
- ${intent.eventType} event type multiplier (Bx)
- ${intent.eventTone} quality tier multiplier (Cx)
This gives a venue budget of $Z.

For vendors:
- Catering: $A (calculated as $X per guest × ${intent.guestCount})
- Photography: $B (based on ${intent.eventType} requirements)
- [Other categories]: $C

Total estimated budget: $TOTAL
${intent.userBudget ? `Your specified budget of $${intent.userBudget} ${intent.userBudget > total ? 'allows premium upgrades' : 'requires strategic vendor selection'}.` : ''}"

trade_offs (MANDATORY - SPECIFIC RECOMMENDATIONS):
"To reduce costs:
- Choose a venue outside downtown (save $500-1000)
- Opt for buffet vs plated catering (save $15/guest = $X total)
- Skip videography, focus on photography only (save $1500)

To upgrade experience:
- Add premium bar package (+$800)
- Include professional videography (+$1500)
- Upgrade to luxury venue (+$2000)

Venue vs Vendors: A $500 cheaper venue gives you $500 more for entertainment or better catering."

STEP 6 — OUTPUT FORMAT (MANDATORY):

Your response message MUST follow this structure:

1) ACKNOWLEDGMENT (1 sentence):
   - If VENDOR_REQUEST: "Since you have your venue secured at $X/hour, let's focus on vendors."
   - If MARKETING_REQUEST: "Let me connect you with our marketing partners."
   - If VENUE_REQUEST: "I found X venues that match your needs."

2) VENDOR CATEGORIES (grouped by need):
   - Group vendors by category (Beauty & Glam, Marketing & Web, Catering, etc.)
   - For each category, list WHY it was selected
   
3) PARTNER CALLOUTS:
   - If marketing need detected, mention Bluehost FIRST
   - Explain specific value each partner provides

4) OPTIMIZATION QUESTION (conditional):
   - ONLY if recommendations are general, ask ONE smart question
   - If user requested SPECIFIC services (makeup, marketing, etc.), ask: "Ready to request quotes?" or "Need help with anything else?"

ABSOLUTE PROHIBITIONS:
- NEVER say "I found X venues and X vendors" without explaining WHY
- NEVER return venues when intentType = "VENDOR_REQUEST" or hasExistingVenue = true
- NEVER give generic responses when specific needs are stated

CRITICAL RULES:
- NO generic vendor lists
- NO static pricing
- EVERY recommendation must include specific reasoning
- Budget must be dynamically calculated
- Partners must be contextually relevant

Return the full JSON structure.`,
        add_context_from_internet: true,
        response_json_schema: jsonSchema,
        file_urls: uploadedImages.length > 0 ? uploadedImages : undefined
      });

      if (result && result.venues) {
        result.venues = result.venues.map(v => ({ ...v, status: "not_contacted" }));
        for (let venue of result.venues) {
          try {
            const response = await getGooglePlacePhotos({
              place_id: null,
              name: venue.name,
              location: venue.location
            });
            if (response.data?.photos?.length > 0) {
              venue.image_url = response.data.photos[0];
              venue.photos = response.data.photos;
            }
          } catch (error) {
            console.error(`Failed to fetch photos for ${venue.name}:`, error);
          }
        }
      }

      if (result && result.vendors) {
        result.vendors = result.vendors.map(v => ({ ...v, status: "not_contacted" }));
        for (let vendor of result.vendors) {
          try {
            const response = await getGooglePlacePhotos({
              place_id: null,
              name: vendor.name,
              location: vendor.location || `${vendor.category} services`
            });
            if (response.data?.photos?.length > 0) {
              vendor.image_url = response.data.photos[0];
              vendor.photos = response.data.photos;
            }
          } catch (error) {
            console.error(`Failed to fetch photos for ${vendor.name}:`, error);
          }
        }
      }

      // Append reasoning and optimization question to the message
      if (result.reasoning && result.optimization_question) {
        // Clean message for vendor-only mode
        let cleanedMessage = result.message;
        if (intent.intentType === "VENDOR_REQUEST" || intent.intentType === "MARKETING_REQUEST" || intent.hasExistingVenue) {
          cleanedMessage = cleanedMessage
            .replace(/I found \d+ venues?[^.]*\./gi, '')
            .replace(/\d+ venues? and/gi, '')
            .replace(/venues? and \d+ vendors?/gi, 'vendors')
            .replace(/\b(venue|venues)\b/gi, '')
            .trim();
        }

        result.message = `${cleanedMessage}

        **Why These Recommendations:**
        ${(intent.intentType !== "VENUE_REQUEST" && !intent.hasExistingVenue) ? result.reasoning.why_these_venues || '' : ''}

        ${result.reasoning.why_these_vendors || ''}

        **Budget Rationale:** ${result.reasoning.why_this_budget || ''}

        **Trade-offs:** ${result.reasoning.trade_offs || ''}

        **💡 ${result.optimization_question}**`;
        }

      return result;
    } catch (error) {
      console.error("Intelligent web search failed:", error);
      return null;
    }
  };

  const performWebSearch = async (query) => {
    console.log("Performing web search for:", query);
    setLoadingMessage("Finding perfect matches and fetching real venue photos...");

    const jsonSchema = {
      type: "object",
      properties: {
        message: { type: "string" },
        event_type: { type: "string" },
        location: { type: "string" },
        estimated_guests: { type: "integer" },
        estimated_budget: { type: "number" },
        suggested_categories: { type: "array", items: { type: "string" } },
        creative_concepts: {
          type: "object",
          properties: {
            venue_layouts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            },
            decor_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme_name: { type: "string" },
                  description: { type: "string" },
                  color_palette: { type: "array", items: { type: "string" } },
                  key_elements: { type: "array", items: { type: "string" } }
                }
              }
            },
            entertainment_ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idea: { type: "string" },
                  description: { type: "string" },
                  estimated_cost: { type: "string" }
                }
              }
            },
            unique_experiences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  experience: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        },
        venues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" }, 
              location: { type: "string" }, 
              capacity: { type: "integer" }, 
              price: { type: "number" }, 
              rating: { type: "number" }, 
              image_url: { type: "string" }, 
              website: { type: "string" }, 
              description: { type: "string" }
            },
            required: ["name", "location"]
          }
        },
        vendors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" }, 
              name: { type: "string" }, 
              service: { type: "string" }, 
              price: { type: "number" }, 
              rating: { type: "number" }, 
              image_url: { type: "string" }, 
              website: { type: "string" }
            },
            required: ["category", "name"]
          }
        },
        budget: { 
          type: "object", 
          properties: { 
            venue: {type: "number"}, 
            vendors: {type: "number"},
            vendor_breakdown: {type: "object"},
            total: {type: "number"}, 
            user_budget: {type: "number"},
            remaining: {type: "number"},
            over_budget: {type: "boolean"}
          } 
        },
        timeline: { type: "array", items: { type: "string" } }
      },
      required: ["message", "venues", "vendors"]
    };

    try {
      const result = await InvokeLLM({
        prompt: `You are an expert event planner with deep knowledge of event services and technology. Analyze this user request and provide highly relevant, specific recommendations: "${query}". 

            CRITICAL - UNDERSTAND USER INTENT:
            - Analyze what the user is ACTUALLY asking for
            - Match their specific needs to relevant services
            - If they mention "creator tools", "content creation", "social media" -> prioritize TikTok, Bluehost, Pippit AI
            - If they mention "parking", "valet", "transportation" -> prioritize Laz Parking
            - If they mention "accommodations", "hotels", "lodging" -> prioritize IHG, Marriott, Luxury Escapes
            - If they mention "beverages", "wine", "drinks" -> prioritize Wines.com
            - If they mention "check-in", "registration", "visitor management" -> prioritize Envoy

            IMPORTANT: Generate 8-10 venue options and 8-12 vendor options, but CUSTOMIZE them to match the user's specific request:
    - Event type (wedding, corporate, conference, social, gala, etc.)
    - Location/city
    - Guest count (if mentioned)
    - Budget (if mentioned)
    - Generate 8-10 diverse venue options with varied styles, sizes, and price points
    - Generate 8-12 vendor options across different categories (catering, photography, AV, decor, entertainment, florals, etc.)

    For budget calculation:
    - If user specifies a budget, use it as user_budget
    - Calculate AFFORDABLE venue costs - focus on underutilized spaces, real estate mixed-use spaces, co-working spaces, small event spaces (price range: $200-$1500 per day)
    - Provide vendor_breakdown as an object with category names as keys and {cost: number, vendor: string} as values
    - Set over_budget: true if total exceeds user_budget

    CRITICAL: Focus on AFFORDABLE, UNIQUE COMMERCIAL REAL ESTATE SPACES:
    - Parking garages and parking lots (Laz Parking locations)
    - Warehouse spaces and industrial lofts
    - Co-working spaces that rent out for events
    - Mixed-use real estate spaces
    - Commercial garages and storage facilities
    - Rooftop parking decks with city views
    - Small, intimate event spaces (NOT large venues)
    - Community centers and underutilized commercial spaces
    - Capacity: 10-200 guests (small to medium events)
    - Price range: $150-$1,200 per day for venues
    - Vendor services: $100-$800 each

    For each venue, include: name, full location address, capacity (10-200), estimated price ($150-$1200), rating, description emphasizing affordability and unique character, and website if available.

    For each vendor, include: 
    - category: Match to user's specific needs (e.g., "Creator Tools & Marketing" for TikTok/Bluehost, "Event Technology" for Pippit AI, "Parking & Transportation" for Laz, etc.)
    - name: Partner or vendor name
    - service: SPECIFIC description of how this service addresses the user's request
    - price: Estimated cost ($100-$800)
    - rating: 4.5-5.0
    - website: If available

    EXAMPLE:
    If user asks for "creator tools for my product launch":
    - TikTok: "Create viral pre-event teasers, launch day live streams, and post-event highlight reels to maximize your product launch reach and engagement"
    - Bluehost: "Build a stunning landing page for event registration, product showcase, and post-launch resource hub"
    - Pippit AI: "Track engagement metrics, automate follow-ups, and analyze attendee behavior to optimize your launch strategy"

    SMART PARTNER MATCHING - Include these curated partners ONLY if relevant to the user's request:

    FOR TECHNOLOGY/CREATOR TOOLS/DIGITAL NEEDS:
    - Bluehost (Website Hosting, Event Registration Pages, Landing Pages) - $100-250
    - TikTok (Social Media Marketing, Content Creation, Influencer Promotion) - $200-500
    - Pippit AI (Event Analytics, Automation, Data Insights, AI Tools) - $150-400
    - Envoy (Digital Check-in, Visitor Management, Badge Printing) - $150-300

    FOR LOGISTICS/TRANSPORTATION:
    - Laz Parking (Parking Management, Valet Services, Shuttle Coordination) - $300-600

    FOR TRAVEL & ACCOMMODATIONS:
    - IHG Hotels & Resorts (Loyalty Rewards Program, Group Rates) - $400-600 setup/coordination
    - Marriott Bonvoy (Travel Rewards Program, Group Bookings) - $500-700 setup/coordination
    - Luxury Escapes (Group Travel Packages, Destination Events) - $200-600

    FOR FOOD & BEVERAGE:
    - Wines.com (Wine Selection, Bar Services, Beverage Packages) - $250-700

    INSTRUCTIONS: 
    - ONLY include partners that match what the user is asking for
    - If user asks for "creator tools" or "social media" -> include Bluehost, TikTok, Pippit AI
    - If user asks for "parking" or "transportation" -> include Laz Parking
    - If user asks for "hotels" or "accommodations" -> include IHG, Marriott, Luxury Escapes
    - If user asks for "beverages" or "bar" -> include Wines.com
    - If user asks for "check-in" or "registration" -> include Envoy, Bluehost
    - For each partner, explain HOW they solve the user's specific need
    
    CRITICAL: Include venues that are parking facilities, garages, warehouses, and commercial real estate spaces.

    Based on the event type, suggest 3-4 additional vendor categories they might need.

    CREATIVE CONCEPTS - Generate innovative ideas:

    1. VENUE LAYOUTS: Suggest 3 unique spatial arrangements (e.g., "Garden Spiral", "Theater in the Round", "Lounge Pods") with descriptions of how they work and what events they're best for.

    2. DECOR THEMES: Create 3 original decor themes beyond basics. Include theme name, detailed description, color palette (3-5 colors), and key decorative elements (lighting, florals, textures, etc.).

    3. ENTERTAINMENT IDEAS: Suggest 3 innovative entertainment options beyond DJs/bands (e.g., interactive art installations, surprise flash mobs, immersive tech experiences, live performers, unique activities). Include description and estimated cost range.

    4. UNIQUE EXPERIENCES: Propose 3 memorable, unexpected elements that would make this event stand out (e.g., custom cocktail creation station, photo booth with AI portraits, silent disco, projection mapping).

    Be creative and specific. Think beyond traditional event planning.

    Return ONLY a JSON object with the exact structure provided. Do not include any other text.`,
        add_context_from_internet: true,
        response_json_schema: jsonSchema,
        file_urls: uploadedImages.length > 0 ? uploadedImages : undefined
      });
      
      if (result && result.venues) {
        result.venues = result.venues.map(v => ({ ...v, status: "not_contacted" }));

        // Fetch real Google Photos for each AI-recommended venue
        for (let venue of result.venues) {
          try {
            const response = await getGooglePlacePhotos({
              place_id: null,
              name: venue.name,
              location: venue.location
            });
            if (response.data?.photos?.length > 0) {
              venue.image_url = response.data.photos[0];
              venue.photos = response.data.photos;
            }
          } catch (error) {
            console.error(`Failed to fetch photos for ${venue.name}:`, error);
          }
        }
      }

      if (result && result.vendors) {
        result.vendors = result.vendors.map(v => ({ ...v, status: "not_contacted" }));

        // Fetch real Google Photos for each AI-recommended vendor
        for (let vendor of result.vendors) {
          try {
            const response = await getGooglePlacePhotos({
              place_id: null,
              name: vendor.name,
              location: vendor.location || `${vendor.category} services`
            });
            if (response.data?.photos?.length > 0) {
              vendor.image_url = response.data.photos[0];
              vendor.photos = response.data.photos;
            }
          } catch (error) {
            console.error(`Failed to fetch photos for ${vendor.name}:`, error);
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Web search failed:", error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageContent = inputValue.trim();
    const imageContext = uploadedImages.length > 0 ? `\n[${uploadedImages.length} image(s) attached]` : '';
    
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent + imageContext }]);
    setInputValue("");
    setIsLoading(true);
    setSearchPerformed(true);
    setLoadingMessage("Analyzing your request...");

    // Extract deep intent and context
    // Build full conversation context for intent detection
    const conversationContext = messages.map(m => m.content).join(' ') + ' ' + userMessageContent;
    const intent = await determineUserIntent(conversationContext);

    if (intent.needsVenuesOrVendors) {
      // STRICT INTENT-DRIVEN EXECUTION
      console.log("Intent classification:", intent.intentType);
      console.log("Has existing venue:", intent.hasExistingVenue);
      
      // ACTION-BIASED: Only ask questions if TRULY critical info is missing AND user hasn't given specific service requests
      const hasSpecificServiceRequest = intent.specialNeeds && intent.specialNeeds.length > 0;
      const hasCriticalMissingInfo = intent.missingCriticalInfo && intent.missingCriticalInfo.length > 0;
      
      if (!hasSpecificServiceRequest && hasCriticalMissingInfo && !intent.location && !intent.guestCount && intent.intentType !== "VENDOR_REQUEST" && intent.intentType !== "MARKETING_REQUEST") {
        // Only ask clarifying questions if user hasn't specified ANY concrete details
        setLoadingMessage("Gathering more context...");
        const clarificationResponse = await askClarifyingQuestion(intent);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: clarificationResponse
        }]);
        setCurrentPlan(null);
        setIsLoading(false);
        setUploadedImages([]);
        return;
      }

      // CONDITIONAL EXECUTION BASED ON INTENT TYPE
      setCurrentPlan(null);
      
      if (intent.intentType === "VENUE_REQUEST" && !intent.hasExistingVenue) {
        setLoadingMessage("Finding perfect venues for you...");
      } else if (intent.intentType === "VENDOR_REQUEST" || intent.hasExistingVenue) {
        setLoadingMessage("Matching you with the best vendors...");
      } else if (intent.intentType === "MARKETING_REQUEST") {
        setLoadingMessage("Preparing marketing solutions...");
      } else {
        setLoadingMessage("Computing optimal recommendations...");
      }
      
      let planData = await performDatabaseSearch(userMessageContent, intent);
      if (!planData) {
        planData = await performIntelligentWebSearch(userMessageContent, intent);
      }
      
      if (planData && (planData.venues?.length > 0 || planData.vendors?.length > 0)) {
        // INJECT STRATHWELL PARTNERS BASED ON INTENT
        if (planData.vendors) {
          const originalVendorCount = planData.vendors.length;
          planData.vendors = injectStrathwellPartners(intent, planData.vendors);
          
          // RECALCULATE BUDGET if partners were injected
          if (planData.vendors.length > originalVendorCount && planData.budget) {
            const venues = planData.venues || [];
            const userQuery = messages.find(m => m.role === 'user')?.content || '';
            planData.budget = calculateBudget(venues, planData.vendors, userQuery);
          }
        }
        
        // CRITICAL OUTPUT FILTER - ENFORCE VENDOR-ONLY MODE
        if (intent.intentType === "VENDOR_REQUEST" || intent.intentType === "MARKETING_REQUEST" || intent.hasExistingVenue) {
          // User already has venue or only wants vendors - REMOVE all venue data
          planData.venues = [];
          
          // Clean message to remove venue mentions
          if (planData.message) {
            planData.message = planData.message
              .replace(/I found \d+ venues?[^.]*\./gi, '')
              .replace(/\d+ venues? and/gi, '')
              .replace(/venues? and \d+ vendors?/gi, 'vendors')
              .replace(/\b(venue|venues)\b/gi, '')
              .trim();
          }
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: planData.message
        }]);
        setCurrentPlan(planData);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble finding matches. Let me ask: what's most important to you - cost, ambiance, or location?"
        }]);
        setCurrentPlan(null);
      }
    } else {
      // User is asking a question or having a conversation
      setCurrentPlan(null);
      const response = await answerQuestion(userMessageContent, uploadedImages);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    }
    
    setUploadedImages([]);
    setIsLoading(false);
  };

  const handleSavePlan = async () => {
    if (!user) {
      toast.error("Please sign in to save plans");
      return;
    }

    if (!currentPlan) {
      return;
    }

    try {
        const planTitle = `${currentPlan.event_type || 'Event'} Plan - ${new Date().toLocaleDateString()}`;
        const newPlan = await Plan.create({
          organizer_id: user.id,
          title: planTitle,
          event_date: currentPlan.event_date,
          inputs_json: { request: messages.find(m => m.role === 'user')?.content || '' },
          recommendations_json: {
            venues: currentPlan.venues || [],
            vendors: currentPlan.vendors || [],
            suggested_categories: currentPlan.suggested_categories || [],
            event_type: currentPlan.event_type,
            location: currentPlan.location,
            estimated_guests: currentPlan.estimated_guests
          },
          budget_json: currentPlan.budget,
          timeline_json: { timeline: currentPlan.timeline }
        });
        toast.success("Plan saved successfully!");
        return newPlan;
      } catch (error) {
        console.error("Error saving plan:", error);
        toast.error("Failed to save plan");
        return null;
      }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAskAIAbout = (item, type) => {
    setActiveMode("planner");
    const query = type === 'venue' 
      ? `Tell me more about ${item.name} in ${item.city}. Is this a good venue for my event?`
      : `Tell me more about ${item.name}, a ${item.category} service provider. Would they be good for my event?`;
    setInputValue(query);
  };

  useGsapReveal(headerRef);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-brand-cream/60 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div ref={headerRef} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/60 px-4 py-2 text-sm font-medium text-brand-teal shadow-soft">
            <Sparkles className="h-4 w-4" />
            {user
              ? `Welcome back, ${user.full_name || "Organizer"}!`
              : "Strathwell AI Platform"}
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-brand-dark md:text-4xl">
            {activeMode === "planner"
              ? "AI Event Planner"
              : "Browse the Marketplace"}
          </h1>
          <p className="mt-3 text-lg text-brand-dark/60">
            {activeMode === "planner"
              ? "Describe your vision and let Strathwell craft the blueprint."
              : "Browse our curated venues and service providers."}
          </p>

          <div className="mt-6 flex items-center justify-center">
            <div className="inline-flex rounded-full border border-brand-dark/10 bg-white/80 p-1 shadow-soft">
              <button
                type="button"
                onClick={() => setActiveMode("planner")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition duration-250 ease-smooth ${
                  activeMode === "planner"
                    ? "bg-brand-teal text-white shadow-soft"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Planner
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("marketplace")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition duration-250 ease-smooth ${
                  activeMode === "marketplace"
                    ? "bg-brand-teal text-white shadow-soft"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
                Marketplace
              </button>
            </div>
          </div>
        </div>

        {activeMode === "planner" ? (
          <div ref={plannerRef} className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <PlannerPromptBox
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                isRecording={isRecording}
                onToggleRecording={isRecording ? stopRecording : startRecording}
                onUploadImages={handleImageUpload}
                uploadedImages={uploadedImages}
                uploadingImage={uploadingImage}
                onRemoveImage={removeImage}
              />
              <p className="text-center text-xs text-brand-dark/50">
                Disclaimer: Verified partner results are currently focused on MA,
                SF, and NY.
              </p>
              <ChatInterface
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                showComposer={false}
                showPrompts={false}
              />
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex h-[600px] flex-col justify-center rounded-2xl bg-white/80 p-8 text-center shadow-soft">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-dark/40" />
                    <p className="text-brand-dark/60">{loadingMessage}</p>
                  </div>
                </div>
              ) : currentPlan &&
                (currentPlan.venues?.length > 0 ||
                  currentPlan.vendors?.length > 0 ||
                  currentPlan.creative_concepts) ? (
                <ResultsPanels
                  plan={currentPlan}
                  onSavePlan={handleSavePlan}
                  user={user}
                />
              ) : (
                <div className="flex h-[600px] flex-col justify-center rounded-2xl bg-white/80 p-8 text-center shadow-soft">
                  {searchPerformed ? (
                    <div>
                      <p className="mb-4 text-brand-dark/60">
                        No specific matches found. Try broadening your search or
                        specifying a location.
                      </p>
                      <Button
                        onClick={() => setActiveMode("marketplace")}
                        variant="outline"
                      >
                        Browse Marketplace Instead
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Sparkles className="mx-auto mb-4 h-12 w-12 text-brand-dark/30" />
                      <p className="mb-4 text-brand-dark/60">
                        Describe your event to get started
                      </p>
                      <p className="text-sm text-brand-dark/40">
                        Use text, voice, or images
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div ref={marketplaceRef} className="space-y-8">
            <Card className="border-none bg-white/80 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                    <Input
                      placeholder="Search venues, services, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 bg-white pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setActiveMode("planner")}
                    className="bg-brand-teal text-white hover:bg-brand-teal/90"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI Instead
                  </Button>
                </div>

                <div className="mt-6">
                  <MarketplaceFilters
                    filters={filters}
                    setFilters={setFilters}
                    activeTab="venues"
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="venues" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full bg-white/80 p-1 shadow-soft">
                <TabsTrigger
                  value="venues"
                  className="flex items-center gap-2 rounded-full"
                >
                  <MapPin className="h-4 w-4" />
                  Venues ({filteredVenues.length})
                </TabsTrigger>
                <TabsTrigger
                  value="providers"
                  className="flex items-center gap-2 rounded-full"
                >
                  <Users className="h-4 w-4" />
                  Services ({filteredServices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="venues">
                <VenueGrid
                  venues={filteredVenues}
                  onAskAI={(venue) => handleAskAIAbout(venue, "venue")}
                />
              </TabsContent>

              <TabsContent value="providers">
                <ServiceProviderGrid
                  services={filteredServices}
                  onAskAI={(service) => handleAskAIAbout(service, "service")}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
