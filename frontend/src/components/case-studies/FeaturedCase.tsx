import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Award,
  ArrowRight,
  ExternalLink,
  Bot,
  TrendingUp,
  Scale
} from "lucide-react";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";

// --- Case Studies Data ---
const additionalCases = [
  {
    id: "google-ny",
    clientType: "Global Technology Company",
    location: "New York City",
    title: "Google New York",
    subtitle: "Resolving Attendee–Event Mismatch",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/640px-Google_Favicon_2025.svg.png",
    challenge: "Internal teams faced operational chaos due to a mismatch between event intent and room capacity. Established tools focused on availability, not suitability.",
    solution: "Strathwell introduced a prototyping layer to define intent upfront and match formats to the actual target audience.",
    outcome: "Helped surface hidden planning blind spots, reducing internal tension and improving operational clarity without disrupting workflows.",
    metric: "Zero Friction",
    color: "bg-blue-50 text-blue-700 border-blue-100"
  },
  {
    id: "oxford",
    clientType: "Academic Institution",
    location: "United Kingdom",
    title: "University of Oxford",
    subtitle: "Structuring Academic Events",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Oxford-University-Circlet.svg",
    challenge: "Decentralized planning across departments created inconsistent attendee experiences and logistical bottlenecks for community events.",
    solution: "Supported structured planning by standardizing logistics and matching event types to appropriate institutional spaces.",
    outcome: "Enabled organizers to focus purely on academic content and engagement while the platform handled operational complexity.",
    metric: "Standardized Workflows",
    color: "bg-indigo-50 text-indigo-800 border-indigo-100"
  },
  {
    id: "mass-law",
    clientType: "Mid-size Law Firm",
    location: "Massachusetts",
    title: "Massachusetts Law Firm",
    subtitle: "Unlocking New Revenue",
    icon: Scale,
    challenge: "Premium office space sat unused on evenings/weekends, but partners feared compliance risks and administrative overhead involved in renting it out.",
    solution: "Piloted an AI-driven orchestration engine to identify low-risk, compliant event categories (like CLE sessions) without disrupting legal ops.",
    outcome: "Validated a new, low-risk revenue stream while maintaining strict professional and compliance standards.",
    metric: "60% Less Admin Time",
    color: "bg-emerald-50 text-emerald-800 border-emerald-100"
  }
];

export default function FeaturedCase() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-brand-cream/20 md:py-24">
      <Container>
        
        {/* --- Section Header --- */}
        <FadeIn className="text-center mb-10 md:mb-16">
          <Badge variant="outline" className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
            <Award className="h-4 w-4" />
            Case Studies
          </Badge>
          <h2 className="text-3xl font-bold text-brand-dark sm:text-4xl md:text-5xl leading-tight">
            Real-World Impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-brand-dark/60 sm:text-lg md:mt-6 md:text-xl">
            See how Strathwell's orchestration platform transforms chaos into clarity for global leaders.
          </p>
        </FadeIn>

        {/* --- Hero: Featured Partnership (Existing) --- */}
        <FadeIn>
          <div className="mb-16 md:mb-20">
            <Card className="group overflow-hidden border border-brand-dark/5 bg-white shadow-2xl transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
              <div className="md:flex md:min-h-[500px]">
                {/* Image Side */}
                <div className="relative md:w-1/2 overflow-hidden">
                  <div className="absolute inset-0 bg-brand-dark/10 transition-opacity group-hover:opacity-0 z-10" />
                  <img
                    src="/images/case-studies/tech-summit.webp"
                    alt="Limitless Women in Tech Summit 2025"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <Badge variant="outline" className="absolute left-6 top-6 z-20 rounded-full bg-white/90 text-xs font-bold tracking-widest text-brand-dark backdrop-blur-md">
                    FEATURED PARTNERSHIP
                  </Badge>
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-between p-6 md:w-1/2 md:p-12 lg:p-16">
                  <div>
                    <div className="mb-8 flex items-start justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-brand-dark mb-2">
                          Limitless Women in Tech
                        </h3>
                        <p className="text-brand-teal font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Google HQ, Mountain View
                        </p>
                      </div>
                      <Link to={createPageUrl("AIPlanner")}>
                        <Button size="sm" variant="outline" className="hidden sm:flex border-brand-teal/30 text-brand-teal hover:bg-brand-teal/5">
                          <Bot className="mr-2 h-4 w-4" />
                          Try AI Planner
                        </Button>
                      </Link>
                    </div>

                    <p className="text-base leading-relaxed text-brand-dark/70 mb-6 sm:text-lg md:mb-8">
                      Strathwell's AI orchestration platform powered seamless coordination for 194 attendees, managing complex vendor logistics and venue constraints with zero friction.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-brand-dark/5 pt-8">
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                          <Users className="h-4 w-4" /> Attendees
                        </div>
                        <p className="text-xl font-semibold text-brand-dark">194 Registered</p>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                          <Calendar className="h-4 w-4" /> Date
                        </div>
                        <p className="text-xl font-semibold text-brand-dark">Sept 18, 2025</p>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                          <Award className="h-4 w-4" /> Impact
                        </div>
                        <p className="text-xl font-semibold text-brand-dark">Flagship Success</p>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark/40">
                          <Bot className="h-4 w-4" /> Tech
                        </div>
                        <p className="text-xl font-semibold text-brand-dark">AI Orchestrated</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="https://www.eventbrite.com/e/limitless-women-in-tech-summit-2025-tickets-1505287598729"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full rounded-full bg-brand-teal py-6 text-base hover:bg-brand-teal/90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                        View Official Event
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </FadeIn>

        {/* --- Secondary Grid: New Case Studies --- */}
        <div className="grid gap-8 lg:grid-cols-3">
          {additionalCases.map((study, index) => (
            <FadeIn key={study.id} delay={index * 0.1}>
              <Card className="group relative flex h-full flex-col overflow-hidden border border-brand-dark/5 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/20 hover:shadow-xl">
                
                {/* Logo / Brand Header */}
                <div className="flex items-center justify-between p-8 pb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark/5 p-3 transition-colors group-hover:bg-brand-dark/10">
                    {study.logo ? (
                      <img src={study.logo} alt={study.title} className="h-full w-full object-contain" />
                    ) : (
                      <study.icon className="h-8 w-8 text-brand-dark/60" />
                    )}
                  </div>
                  <Badge variant="outline" className={`border-0 ${study.color} px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
                    {study.clientType}
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col px-8 pb-8">
                  {/* Title & Location */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-brand-dark leading-tight">
                      {study.title}
                    </h3>
                    <p className="text-sm font-medium text-brand-dark/60 mt-1">
                      {study.subtitle}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand-dark/40 uppercase tracking-wider">
                      <MapPin className="h-3 w-3" /> {study.location}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-brand-dark/5 mb-6" />

                  {/* Content Blocks */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-dark/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Challenge
                      </h4>
                      <p className="text-sm leading-relaxed text-brand-dark/70">
                        {study.challenge}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-dark/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> Strathwell Solution
                      </h4>
                      <p className="text-sm leading-relaxed text-brand-dark/70">
                        {study.solution}
                      </p>
                    </div>
                  </div>

                  {/* Outcome Box */}
                  <div className="mt-8 rounded-xl bg-brand-dark/5 p-5 border border-brand-dark/5 group-hover:border-brand-teal/10 group-hover:bg-brand-teal/5 transition-colors">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-dark/50 group-hover:text-brand-teal">
                      Business Outcome
                    </h4>
                    <p className="text-sm font-medium text-brand-dark leading-relaxed">
                      {study.outcome}
                    </p>
                    
                    {/* Metric Tag */}
                    <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-sm">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-teal" />
                      <span className="text-xs font-bold text-brand-dark">{study.metric}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* --- Global CTA --- */}
        {/* <FadeIn className="mt-20 text-center">
          <Link to={createPageUrl("Contact")}>
            <Button variant="ghost" className="text-brand-dark/60 hover:text-brand-teal hover:bg-transparent">
              Read more success stories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </FadeIn> */}

      </Container>
    </section>
  );
}
