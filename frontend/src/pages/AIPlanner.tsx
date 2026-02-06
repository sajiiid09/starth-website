import React, { useState, useEffect, useCallback, useLayoutEffect, useMemo } from "react";
import { Plan, Venue, Service, User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { request } from "@/api/httpClient";
import {
  Sparkle,
  SpinnerGap,
  GridNine,
  ChatCircle,
  Users,
  MagnifyingGlass,
  MapPin,
  ArrowUpRight
} from "@phosphor-icons/react";
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
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import PlannerPromptBox from "@/components/planner/PlannerPromptBox";
import TemplateShowcase from "@/components/planner/TemplateShowcase";
import PlannerTutorial from "@/components/planner/PlannerTutorial";
import useGsapReveal from "@/components/utils/useGsapReveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { dummyTemplates, type DummyTemplate } from "@/data/dummyTemplates";
import { fetchAllTemplates } from "@/api/templates";
import { createPageUrl } from "@/utils";
import { isAuthenticated } from "@/utils/authSession";
import {
  clearPendingPlannerIntent,
  getPendingPlannerIntent,
  setPendingPlannerIntent
} from "@/utils/pendingIntent";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type PlanData = {
  message: string;
  event_type?: string;
  event_date?: string;
  location?: string;
  estimated_guests?: number;
  estimated_budget?: number;
  suggested_categories?: string[];
  venues?: Record<string, unknown>[];
  vendors?: Record<string, unknown>[];
  budget?: Record<string, unknown>;
  timeline?: string[];
  creative_concepts?: Record<string, unknown>;
  reasoning?: Record<string, unknown>;
  optimization_question?: string;
};

type PlannerMessageResponse = {
  reply: string;
  plan?: PlanData | null;
};

// ---------------------------------------------------------------------------
// API — all AI/RAG logic is delegated to the backend
// ---------------------------------------------------------------------------

async function sendPlannerMessage(
  userMessage: string,
  conversationHistory: ChatMessage[],
  imageUrls: string[]
): Promise<PlannerMessageResponse> {
  return request<PlannerMessageResponse>("POST", "/api/planner/message", {
    body: { message: userMessage, history: conversationHistory, images: imageUrls },
    auth: true,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIPlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get("mode") === "marketplace" ? "marketplace" : "planner";
  const [activeMode, setActiveMode] = useState(initialMode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI event planner. Tell me about your event and I'll find the perfect venues and vendors for you. You can also speak to me or share images!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Finding your perfect event matches...");
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [allTemplates, setAllTemplates] = useState<DummyTemplate[]>(dummyTemplates);

  const [venues, setVenues] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Record<string, unknown>[]>([]);
  const [filteredServices, setFilteredServices] = useState<Record<string, unknown>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    capacity: "",
    priceRange: "",
    category: "",
    eventType: "",
  });

  const prefersReducedMotion = usePrefersReducedMotion();
  const headerRef = React.useRef<HTMLDivElement>(null);
  const plannerRef = React.useRef<HTMLDivElement>(null);
  const marketplaceRef = React.useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Marketplace filtering (pure frontend)
  // -------------------------------------------------------------------------

  const filterMarketplaceData = useCallback(() => {
    const filteredV = venues.filter((venue: Record<string, unknown>) => {
      const matchesSearch =
        !searchQuery ||
        (typeof venue.name === "string" && venue.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (typeof venue.city === "string" && venue.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = !filters.state || venue.state === filters.state;
      const matchesCity = !filters.city || venue.city === filters.city;

      const cap = venue.capacity_max as number | undefined;
      const matchesCapacity =
        !filters.capacity ||
        (filters.capacity === "small" && cap != null && cap < 50) ||
        (filters.capacity === "medium" && cap != null && cap >= 50 && cap <= 150) ||
        (filters.capacity === "large" && cap != null && cap > 150);

      const rate = (venue.rate_card_json as Record<string, unknown> | undefined)?.base_rate as number | undefined;
      const matchesPrice =
        !filters.priceRange ||
        (filters.priceRange === "budget" && rate != null && rate < 3000) ||
        (filters.priceRange === "mid" && rate != null && rate >= 3000 && rate <= 7000) ||
        (filters.priceRange === "premium" && rate != null && rate > 7000);

      const tags = venue.tags as string[] | undefined;
      const matchesEventType = !filters.eventType || (tags != null && tags.includes(filters.eventType));

      return matchesSearch && matchesState && matchesCity && matchesCapacity && matchesPrice && matchesEventType;
    });
    setFilteredVenues(filteredV);

    const filteredS = services.filter((service: Record<string, unknown>) => {
      const matchesSearch =
        !searchQuery ||
        (typeof service.name === "string" && service.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (typeof service.category === "string" && service.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = !filters.category || service.category === filters.category;

      const regions = service.coverage_regions as string[] | undefined;
      const stateMatch =
        !filters.state ||
        service.state === filters.state ||
        (regions != null && regions.some((r) => r.includes(filters.state)));

      const cityMatch =
        !filters.city ||
        service.city === filters.city ||
        (regions != null &&
          regions.some(
            (r) =>
              r.includes(filters.city) ||
              (r.toLowerCase().startsWith("all of") && filters.state && r.includes(filters.state))
          ));

      const eventTypes = service.event_types as string[] | undefined;
      const matchesEventType = !filters.eventType || (eventTypes != null && eventTypes.includes(filters.eventType));

      return matchesSearch && matchesCategory && stateMatch && cityMatch && matchesEventType;
    });
    setFilteredServices(filteredS);
  }, [venues, services, searchQuery, filters]);

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  useEffect(() => {
    checkUser();
    loadMarketplaceData();
    fetchAllTemplates().then((items) => {
      if (items.length > 0) setAllTemplates(items);
    });
  }, []);

  useEffect(() => {
    const pendingIntent = getPendingPlannerIntent();
    if (pendingIntent?.prompt) {
      setInputValue(pendingIntent.prompt);
      clearPendingPlannerIntent();
      return;
    }

    const promptParam = searchParams.get("prompt");
    if (promptParam && !inputValue.trim()) {
      setInputValue(promptParam);
    }
  }, [inputValue, searchParams]);

  useEffect(() => {
    if (activeMode === "marketplace") {
      filterMarketplaceData();
    }
  }, [activeMode, filterMarketplaceData]);

  useEffect(() => {
    setSearchParams(
      (params) => {
        params.set("mode", activeMode);
        return params;
      },
      { replace: true }
    );
  }, [activeMode, setSearchParams]);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    const target = activeMode === "planner" ? plannerRef.current : marketplaceRef.current;
    if (!target) return;

    const context = gsap.context(() => {
      gsap.fromTo(target, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    }, target);

    return () => context.revert();
  }, [activeMode, prefersReducedMotion]);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  async function checkUser(): Promise<void> {
    try {
      const cachedUser = sessionStorage.getItem("currentUser");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        return;
      }
      const currentUser = (await User.me()) as Record<string, unknown> | null;
      setUser(currentUser);
      if (currentUser) {
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.log("User not authenticated:", error);
      setUser(null);
    }
  }

  async function loadMarketplaceData(): Promise<void> {
    try {
      const [venuesData, servicesData] = await Promise.all([
        Venue.filter({ status: "active" }),
        Service.filter({ status: "active" }),
      ]);
      setVenues(venuesData);
      setServices(servicesData);
      setFilteredVenues(venuesData);
      setFilteredServices(servicesData);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
    }
  }

  // -------------------------------------------------------------------------
  // Image upload (calls backend upload endpoint)
  // -------------------------------------------------------------------------

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((f) => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some files are too large. Maximum size is 5MB per image.");
      return;
    }

    setUploadingImage(true);
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];

    for (const file of files) {
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
          if (attempts < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          } else {
            failedUploads.push(file.name);
          }
        }
      }
    }

    if (successfulUploads.length > 0) {
      setUploadedImages((prev) => [...prev, ...successfulUploads]);
      toast.success(`${successfulUploads.length} image(s) uploaded!`);
    }
    if (failedUploads.length > 0) {
      toast.error(`Failed to upload: ${failedUploads.join(", ")}`);
    }
    setUploadingImage(false);
  }

  function removeImage(index: number): void {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }

  // -------------------------------------------------------------------------
  // Core planner flow — delegates entirely to backend
  // -------------------------------------------------------------------------

  async function handleSendMessage(): Promise<void> {
    if (!inputValue.trim() || isLoading) return;

    const userMessageContent = inputValue.trim();
    const imageContext = uploadedImages.length > 0 ? `\n[${uploadedImages.length} image(s) attached]` : "";

    const userMessage: ChatMessage = { role: "user", content: userMessageContent + imageContext };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setSearchPerformed(true);
    setLoadingMessage("Analyzing your request...");

    try {
      const response = await sendPlannerMessage(userMessageContent, messages, uploadedImages);

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);

      if (response.plan && (response.plan.venues?.length || response.plan.vendors?.length || response.plan.creative_concepts)) {
        setCurrentPlan(response.plan);
      } else {
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error("Planner message failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble processing that right now. Could you try again?",
        },
      ]);
      setCurrentPlan(null);
    }

    setUploadedImages([]);
    setIsLoading(false);
  }

  async function handleSavePlan(): Promise<Record<string, unknown> | null> {
    if (!user) {
      toast.error("Please sign in to save plans");
      return null;
    }
    if (!currentPlan) return null;

    try {
      const planTitle = `${currentPlan.event_type || "Event"} Plan - ${new Date().toLocaleDateString()}`;
      const newPlan = await Plan.create({
        organizer_id: user.id as string,
        title: planTitle,
        event_date: currentPlan.event_date,
        inputs_json: { request: messages.find((m) => m.role === "user")?.content || "" },
        recommendations_json: {
          venues: currentPlan.venues || [],
          vendors: currentPlan.vendors || [],
          suggested_categories: currentPlan.suggested_categories || [],
          event_type: currentPlan.event_type,
          location: currentPlan.location,
          estimated_guests: currentPlan.estimated_guests,
        },
        budget_json: currentPlan.budget,
        timeline_json: { timeline: currentPlan.timeline },
      });
      toast.success("Plan saved successfully!");
      return newPlan;
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan");
      return null;
    }
  }

  function handlePlannerGenerate(): void {
    if (!inputValue.trim() || isLoading) return;

    if (!isAuthenticated()) {
      setPendingPlannerIntent({
        prompt: inputValue.trim(),
        returnPath: createPageUrl("AIPlanner"),
        source: "ai-planner",
      });
      toast("Create an account to generate your blueprint.");
      navigate(createPageUrl("AppEntry"));
      return;
    }

    handleSendMessage();
  }

  function handleKeyPress(e: React.KeyboardEvent): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePlannerGenerate();
    }
  }

  function handleAskAIAbout(item: Record<string, unknown>, type: string): void {
    setActiveMode("planner");
    const query =
      type === "venue"
        ? `Tell me more about ${item.name} in ${item.city}. Is this a good venue for my event?`
        : `Tell me more about ${item.name}, a ${item.category} service provider. Would they be good for my event?`;
    setInputValue(query);
  }

  // -------------------------------------------------------------------------
  // Template & marketplace relevance scoring (pure frontend)
  // -------------------------------------------------------------------------

  const lastUserMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "user")?.content ?? "",
    [messages]
  );

  const queryText = useMemo(
    () => (inputValue.trim() ? inputValue.trim() : lastUserMessage),
    [inputValue, lastUserMessage]
  );

  const queryTokens = useMemo(
    () =>
      queryText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 2),
    [queryText]
  );

  const scoreText = useCallback(
    (text = "") => queryTokens.reduce((score, token) => (text.includes(token) ? score + 1 : score), 0),
    [queryTokens]
  );

  const { relevantTemplates, hasTemplateMatches } = useMemo(() => {
    const ranked = allTemplates
      .map((template) => {
        const matchText = `${template.title} ${template.description}`.toLowerCase();
        return { template, score: scoreText(matchText) };
      })
      .sort((a, b) => b.score - a.score);

    const matched = ranked.filter((item) => item.score > 0).map((item) => item.template);
    return {
      relevantTemplates: (queryTokens.length > 0 && matched.length > 0 ? matched : allTemplates).slice(0, 6),
      hasTemplateMatches: matched.length > 0,
    };
  }, [allTemplates, queryTokens, scoreText]);

  const { relevantMarketplace, hasMarketplaceMatches } = useMemo(() => {
    const venueItems = venues.map((venue) => {
      const matchText = [venue.name, venue.city, venue.state, venue.description, ...((venue.tags as string[]) || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return {
        id: `venue-${venue.id}`,
        title: venue.name as string,
        description: venue.city ? `${venue.city}, ${venue.state || ""}`.trim() : "Venue listing",
        image: (venue.image_url as string) || (venue.photos as string[])?.[0] || "/images/marketplace/venue-hall.webp",
        href: `/marketplace/${venue.id}`,
        meta: venue.capacity_max ? `${venue.capacity_max} guests` : "Venue",
        kind: "venue",
        score: scoreText(matchText),
      };
    });

    const serviceItems = services.map((service) => {
      const matchText = [service.name, service.category, service.city, service.state, ...((service.event_types as string[]) || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return {
        id: `service-${service.id}`,
        title: service.name as string,
        description: (service.category as string) || "Service provider",
        image: (service.image_url as string) || (service.photos as string[])?.[0] || "/images/marketplace/vendor-av.webp",
        href: `/marketplace/${service.id}`,
        meta: (service.category as string) || "Service",
        kind: "service",
        score: scoreText(matchText),
      };
    });

    const ranked = [...venueItems, ...serviceItems].sort((a, b) => b.score - a.score);
    const matched = ranked.filter((item) => item.score > 0);
    const featured = ranked.slice(0, 6);

    return {
      relevantMarketplace: (queryTokens.length > 0 && matched.length > 0 ? matched : featured).slice(0, 6),
      hasMarketplaceMatches: matched.length > 0,
    };
  }, [venues, services, queryTokens, scoreText]);

  useGsapReveal(headerRef);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-brand-cream/60 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div ref={headerRef} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/60 px-4 py-2 text-sm font-medium text-brand-teal shadow-soft">
            <Sparkle className="h-4 w-4" />
            {user ? `Welcome back, ${(user.full_name as string) || "Organizer"}!` : "Strathwell AI Platform"}
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-brand-dark md:text-4xl">
            {activeMode === "planner" ? "AI Event Planner" : "Browse the Marketplace"}
          </h1>
          <p className="mt-3 text-base text-brand-dark/60 md:text-lg">
            {activeMode === "planner"
              ? "Describe your vision and let Strathwell craft the blueprint."
              : "Browse our curated venues and service providers."}
          </p>

          <div className="mt-6 flex items-center justify-center">
            <div className="inline-flex flex-wrap justify-center gap-2 rounded-full border border-brand-dark/10 bg-white/80 p-1 shadow-soft">
              <button
                type="button"
                onClick={() => setActiveMode("planner")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-250 ease-smooth sm:px-5 ${
                  activeMode === "planner"
                    ? "bg-brand-teal text-white shadow-soft"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <ChatCircle className="h-4 w-4" />
                Planner
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("marketplace")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-250 ease-smooth sm:px-5 ${
                  activeMode === "marketplace"
                    ? "bg-brand-teal text-white shadow-soft"
                    : "text-brand-dark/60 hover:text-brand-dark"
                }`}
              >
                <GridNine className="h-4 w-4" />
                Marketplace
              </button>
            </div>
          </div>
        </div>

        {activeMode === "planner" ? (
          <>
            <div ref={plannerRef} className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <PlannerPromptBox
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handlePlannerGenerate}
                  onKeyPress={handleKeyPress}
                  isLoading={isLoading}
                  onUploadImages={handleImageUpload}
                  uploadedImages={uploadedImages}
                  uploadingImage={uploadingImage}
                  onRemoveImage={removeImage}
                  showTemplatePreviews={false}
                />
                <ChatInterface
                  messages={messages}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  isLoading={isLoading}
                  onSendMessage={handlePlannerGenerate}
                  onKeyPress={handleKeyPress}
                  showComposer={false}
                  showPrompts={false}
                  heightClassName="h-[420px] md:h-[520px]"
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/50 bg-white/85 p-6 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                        Relevant matches
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-brand-dark">
                        Curated templates and marketplace options.
                      </h2>
                      <p className="mt-2 text-sm text-brand-dark/60">
                        Based on your prompt, we surface the closest-fit blueprints and partners.
                      </p>
                    </div>
                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-brand-dark/60">
                        <SpinnerGap className="h-4 w-4 animate-spin" />
                        {loadingMessage}
                      </div>
                    )}
                  </div>

                  <Tabs defaultValue="templates" className="mt-6 space-y-4">
                    <TabsList className="grid w-full grid-cols-2 rounded-full bg-brand-cream/60 p-1">
                      <TabsTrigger value="templates" className="rounded-full">
                        Templates
                      </TabsTrigger>
                      <TabsTrigger value="marketplace" className="rounded-full">
                        Marketplace
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-4">
                      <div className="space-y-3">
                        {relevantTemplates.map((template) => (
                          <Link
                            key={template.id}
                            to={`/templates/${template.id}`}
                            className="group flex items-center gap-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-soft transition hover:-translate-y-0.5"
                          >
                            <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-cream/60">
                              <img
                                src={template.image}
                                alt={template.title}
                                className="h-full w-full object-contain p-2"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-brand-dark">{template.title}</p>
                              <p className="mt-1 text-xs text-brand-dark/60">{template.description}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-brand-dark/40 transition group-hover:text-brand-dark" />
                          </Link>
                        ))}
                      </div>
                      {!hasTemplateMatches && queryTokens.length > 0 && (
                        <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/40 p-4 text-xs text-brand-dark/60">
                          Try adding a location, date, or budget to refine template matches.
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="marketplace" className="space-y-4">
                      <div className="space-y-3">
                        {relevantMarketplace.map((item) => (
                          <Link
                            key={item.id}
                            to={item.href}
                            className="group flex items-center gap-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-soft transition hover:-translate-y-0.5"
                          >
                            <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-cream/60">
                              <img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-brand-dark">{item.title}</p>
                              <p className="mt-1 text-xs text-brand-dark/60">{item.description}</p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-brand-dark/40">{item.meta}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-brand-dark/40 transition group-hover:text-brand-dark" />
                          </Link>
                        ))}
                      </div>
                      {!hasMarketplaceMatches && queryTokens.length > 0 && (
                        <div className="rounded-2xl border border-brand-dark/10 bg-brand-cream/40 p-4 text-xs text-brand-dark/60">
                          Try adding a location, guest count, or vendor category to refine matches.
                        </div>
                      )}
                      <Link to={createPageUrl("Marketplace")}>
                        <Button variant="outline" className="w-full rounded-full">
                          Browse all Marketplace
                        </Button>
                      </Link>
                    </TabsContent>
                  </Tabs>
                </div>

                {currentPlan &&
                (currentPlan.venues?.length ||
                  currentPlan.vendors?.length ||
                  currentPlan.creative_concepts) ? (
                  <details className="rounded-3xl border border-white/50 bg-white/85 p-4 shadow-card">
                    <summary className="cursor-pointer text-sm font-semibold text-brand-dark">
                      View detailed AI plan
                    </summary>
                    <div className="mt-4">
                      <ResultsPanels plan={currentPlan} onSavePlan={handleSavePlan} user={user} />
                    </div>
                  </details>
                ) : (
                  searchPerformed && (
                    <div className="rounded-3xl border border-white/50 bg-white/80 p-6 text-sm text-brand-dark/60 shadow-soft">
                      No specific plan results yet. Try adding more detail like location or budget.
                    </div>
                  )
                )}

                <p className="text-center text-xs text-brand-dark/50">
                  Disclaimer: Verified partner results are currently focused on MA, SF, and NY.
                </p>
              </div>
            </div>
            <TemplateShowcase />
            <PlannerTutorial />
          </>
        ) : (
          <div ref={marketplaceRef} className="space-y-8">
            <Card className="border-none bg-white/80 shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <MagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-dark/40" />
                    <Input
                      placeholder="Search venues, services, or locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 bg-white pl-10"
                    />
                  </div>
                  <Button onClick={() => setActiveMode("planner")} className="bg-brand-teal text-white hover:bg-brand-teal/90">
                    <Sparkle className="mr-2 h-4 w-4" />
                    Ask AI Instead
                  </Button>
                </div>

                <div className="mt-6">
                  <MarketplaceFilters filters={filters} setFilters={setFilters} activeTab="venues" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="venues" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full bg-white/80 p-1 shadow-soft">
                <TabsTrigger value="venues" className="flex items-center gap-2 rounded-full">
                  <MapPin className="h-4 w-4" />
                  Venues ({filteredVenues.length})
                </TabsTrigger>
                <TabsTrigger value="providers" className="flex items-center gap-2 rounded-full">
                  <Users className="h-4 w-4" />
                  Services ({filteredServices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="venues">
                <VenueGrid venues={filteredVenues} onAskAI={(venue) => handleAskAIAbout(venue, "venue")} />
              </TabsContent>

              <TabsContent value="providers">
                <ServiceProviderGrid services={filteredServices} onAskAI={(service) => handleAskAIAbout(service, "service")} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
