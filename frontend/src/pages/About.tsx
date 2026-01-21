import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Container from "@/components/home-v2/primitives/Container";
import FadeIn from "@/components/animations/FadeIn";
import { 
  Users, 
  Target, 
  Award,
  Lightbulb,
  Heart,
  Sparkles,
  Megaphone,
  Cpu,
  BarChart3
} from "lucide-react";

// --- Background SVG Pattern ---
// A subtle architectural contour map style to match "Blueprints" theme
const BackgroundPattern = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" aria-hidden="true">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#027F83" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      {/* Abstract Flow Lines */}
      <path d="M0 100 Q 250 250 500 100 T 1000 100" fill="none" stroke="#027F83" strokeWidth="20" strokeOpacity="0.5" />
      <path d="M0 300 Q 400 550 800 300 T 1600 300" fill="none" stroke="#027F83" strokeWidth="20" strokeOpacity="0.5" transform="translate(0, 200)" />
    </svg>
  </div>
);

// --- Categorized Team Data ---
const teamGroups = [
  {
    category: "EXEC TEAM",
    icon: Award,
    description: "Vision & Strategy",
    members: [
      {
        name: "REEN",
        title: "COO & Head of Global Innovation",
        role: "STRATHWELL",
        image: " /public/team/reen.png",
        description: " Reen is an AI executive and innovator who forged her own path beyond family privilege in the transportation and mobility sector. Educated by prestigious universities across Asia, the UK, and the US, she brings a global perspective to leadership, strategy, and innovation. She received scholarships from the French, UK, and Spanish governments and institutions, but ultimately chose to go to the United States. There, she used her savings and secured the largest share of support — around $100,000 in funding from the USA, including a Women in Business scholarship valued at $20,000.",
        additionalInfo: "She invented the world's first AI-powered event orchestration system and launched a pioneering monochrome fashion brand. Her career spans big tech, global consulting, hospitality, real estate, and law."
      },
      {
        name: "MOOSA",
        title: "CEO",
        role: "STRATHWELL",
        image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/e47401580_Screenshot2025-07-10at000114.png",
        description: " MZ is a rare blend of engineer, strategist, and innovator whose journey reflects the DNA of Stanford. The only member of his class to enter with a perfect SAT score, he went on to earn three Stanford degrees—B.S. in Electrical Engineering with distinction (recognized as a Terman Scholar, awarded to the top 5% of engineering seniors), M.S. in Computer Science (AI track), and M.D.—building systems that bridged human and machine intelligence, from predictive AI models to breakthroughs in optimization, signal processing, and telemedicine.",
        additionalInfo: "A gifted educator, Moosa taught across Stanford’s Medicine, Computer Science, and Engineering departments, covering everything from physiology to convex optimization and probabilistic models—simplifying complexity while inspiring future innovators. He also led multi-stakeholder projects, published in top journals, and advanced global tech-for-good initiatives that combined technical mastery with social purpose."
      }
    ]
  },
  {
    category: "ADVISORS",
    icon: Lightbulb,
    description: "Industry Leadership",
    members: [
      {
        name: "HAL",
        title: "Founding Advisor",
        role: "STRATHWELL",
        image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/8106bc5a5_IMG_6114.jpg",
        description: "Hal Bennett has over 40 years of technology leadership experience with senior executive roles at IBM, Symantec/Norton, Amazon Web Services, Adobe, Novell, and various start-ups. These roles include field and operational experiences, consistently delivering business growth in sales, marketing, alliances, business development, and channels. Hal has been successful building teams, developing high-performance cultures, expanding into new markets, and providing hardware/software/services solutions through various routes-to-market. He is customer-driven, closing and managing new and existing clients/partnerships in consumer, SMB, and large enterprises with hardware, software, services and SaaS solutions. ",
        additionalInfo: "Hal is presently Senior Vice President at BuildZoom, Inc., a leading-edge construction marketplace and data company. He received his BA in Economics/Mathematics from Dartmouth College and originally from the Boston area, Hal and his wife, Patti now live in Napa, California."
      },
      {
        name: "JAY",
        title: "Founding Advisor",
        role: "STRATHWELL",
        image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/f2d8a35aa_Screenshot2025-08-14at101341.png",
        description: "JJay Ruffin is a global technology executive and operating partner recognized for delivering over $60M in transformation value, preventing $80M in revenue loss, and generating $15–$20M in annual uplifts for Fortune 500 and private equity clients. Specializing in AI, SaaS/cloud enablement, and digital transformation, Jay builds and scales global teams that unlock 40%+ productivity gains and accelerate EBITDA growth.",    
        additionalInfo: "A trusted C‑suite advisor, he guides enterprises through complex modernization, M&A, and AI adoption programs—aligning business and technology strategies for measurable results. "
      },
      {
        name: "GEORG",
        title: "Strategic Advisor",
        role: "STRATHWELL",
        image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/4822df1cf_Screenshot2025-07-02at205916.png",
        description: "Dr. Georg is a faculty member at Harvard Medical School, Brigham and Women’s Hospital, and the Harvard T.H. Chan School of Public Health. An expert in AI-driven modeling and large-scale data integration, he holds a Ph.D. from Imperial College London with prior studies at University of Cambridge and Columbia University.",
        additionalInfo: "With 50+ peer-reviewed publications and research experience at Los Alamos and Lawrence Livermore National Labs, he is internationally recognized for contributions to statistical genetics, computational methods, and quantum optimization. At Strathwell, he develops adaptive AI frameworks to integrate multimodal data and orchestrate complex real-world systems."
      }
    ]
  },
  {
    category: "ANALYTICS TEAM",
    icon: BarChart3,
    description: "Data & Insights",
    members: [
      {
        name: "Krupa",
        title: "Analytics Specialist", 
        role: "STRATHWELL",
        // Using Parnia's image/data for Pheni as requested via context
        image: "/public/team/krupa.png",
        description: "Krupa Pheni has focuses on analytics automation, Google Analytics implementation, and data-driven reporting. His work spans building automated insight pipelines, optimizing data collection systems, and translating complex datasets into clear, actionable business recommendations.",
        additionalInfo: "With a keen interest in data analytics, generative AI, marketing, and entrepreneurship, she thrives on creating innovative solutions."
      },
      {
        name: "ATHUL",
        title: "Analytics Specialist",
        role: "STRATHWELL",
        image: " /public/team/athul.png", // Placeholder
        description: " Athul focuses on marketing analytics, growth strategy, and business consulting.",
        additionalInfo: " With dual master’s degrees in Business Analytics and International Marketing and prior experience in business analysis and product strategy at Amazon, Athul brings a unique blend of analytical rigor and creative problem-solving to our team."
      }
    ]
  },
  {
    category: "MARKETING TEAM",
    icon: Megaphone,
    description: "Brand & Community",
    members: [
      {
        name: "OLIVIA",
        title: "Marketing Lead", 
        role: "STRATHWELL",
        image: " /public/team/olivia.png", // Placeholder
        description: "Olivia Worrell is a Boston-based Marketing Specialist, where she blends psychology, design thinking, and storytelling to help community-driven brands grow with intention. ",
        additionalInfo: " She focuses on audience engagement, brand awareness, and bringing digital ideas to life, approaching every project with empathy, creativity, and a people-first mindset."
      }
    ]
  },
  {
    category: "IT TEAM",
    icon: Cpu,
    description: "Systems & Infrastructure",
    members: [
      {
        name: "MEHMET",
        title: "Strategic Systems & Innovation Engineering Intern", 
        role: "STRATHWELL",
        image: " /public/team/mehmet.png", // Placeholder
        description: "Mehmet Topal is a senior at Brown University pursuing a double major in Computer Engineering and Economics. Mehmet brings a unique perspective shaped by his multilingual background and hands-on engineering experience across research, product development, and competitive design.",
        additionalInfo: " ead for Brown Formula Racing (helping the team climb from 81st to 18th nationally), and worked on 3D vision systems at the Interactive 3D Vision & Learning Lab. "
      }
    ]
  }
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white text-brand-dark">
      {/* Background Pattern Layer */}
      <BackgroundPattern />

      {/* Content Layer (z-10 to sit above background) */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-b from-brand-cream/80 via-transparent to-transparent backdrop-blur-sm md:pt-24 md:pb-20">
          <Container>
            <FadeIn className="text-center">
              <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-white/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal shadow-sm">
                <Users className="h-4 w-4" />
                About Strathwell
              </Badge>

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
                Transforming Events Through
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-dark">
                  AI Innovation
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-dark/70 sm:text-lg md:mt-8 md:text-xl">
                At Strathwell, we're pioneering the future of event orchestration with cutting-edge AI technology and world-class expertise.
              </p>
            </FadeIn>
          </Container>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 md:py-20">
          <Container>
            <FadeIn className="grid gap-8 md:grid-cols-3" staggerChildren={0.1}>
              {[
                {
                  title: "Our Mission",
                  description: "To revolutionize the events industry by making world-class event planning accessible through AI-powered orchestration.",
                  icon: Target
                },
                {
                  title: "Our Vision",
                  description: "A world where every event, from intimate gatherings to global conferences, is seamlessly orchestrated with precision.",
                  icon: Lightbulb
                },
                {
                  title: "Our Values",
                  description: "Innovation, excellence, and human connection drive everything we do. We believe technology should amplify human creativity.",
                  icon: Heart
                }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="group border border-brand-dark/5 bg-white/80 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-teal/20">
                    <CardContent className="p-6 sm:p-8 md:p-10">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal/5 text-brand-teal transition-colors group-hover:bg-brand-teal group-hover:text-white">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-brand-dark">{item.title}</h3>
                      <p className="mt-4 text-base leading-relaxed text-brand-dark/60">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </FadeIn>
          </Container>
        </section>

        {/* Categorized Team Section */}
        <section className="py-16 md:py-24">
          <Container>
            <FadeIn className="text-center mb-12 md:mb-24">
              <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark">
                <Award className="h-4 w-4" />
                Our Team
              </Badge>
              <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">World-Class Experts</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-brand-dark/60 sm:text-lg md:mt-6">
                Meet the visionaries behind Strathwell's revolutionary approach to event orchestration.
              </p>
            </FadeIn>

            <div className="space-y-20 md:space-y-32">
              {teamGroups.map((group) => (
                <div key={group.category} className="space-y-10 md:space-y-12">
                  
                  {/* Category Header */}
                  <FadeIn>
                    <div className="flex flex-col items-start gap-2 border-b border-brand-dark/10 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal text-white shadow-md">
                          <group.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-brand-dark sm:text-2xl">
                          {group.category}
                        </h3>
                      </div>
                      <p className="text-sm font-medium uppercase tracking-widest text-brand-teal pl-[52px]">
                        {group.description}
                      </p>
                    </div>
                  </FadeIn>

                  {/* Members Grid */}
                  <div className="grid gap-12">
                    {group.members.map((member, index) => (
                      <FadeIn key={member.name} delay={index * 0.1}>
                        <div className="group relative grid grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-brand-dark/5 bg-white p-6 shadow-xl transition-all duration-300 sm:p-8 md:grid-cols-12 md:gap-12 md:p-0">
                          
                          {/* Image Column */}
                          <div className={`relative w-full overflow-hidden aspect-[3/4] sm:aspect-[4/5] md:col-span-5 md:aspect-auto md:h-auto ${
                            index % 2 === 0 ? "md:order-1" : "md:order-2"
                          }`}>
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-brand-cream/30 text-brand-dark/20">
                                <Users className="h-24 w-24 mb-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Image Coming Soon</span>
                              </div>
                            )}
                            {/* Overlay Gradient for Text Contrast if needed, mostly for style */}
                            <div className="absolute inset-0 bg-brand-dark/5 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                          </div>

                          {/* Content Column */}
                          <div className={`flex flex-col justify-center py-6 md:col-span-7 md:px-12 md:py-16 ${
                            index % 2 === 0 ? "md:order-2" : "md:order-1"
                          }`}>
                            <div>
                              <h3 className="font-display text-3xl font-bold text-brand-dark sm:text-4xl md:text-5xl">
                                {member.name}
                              </h3>
                              <p className="mt-2 text-lg font-medium text-brand-teal">
                                {member.title}
                              </p>
                              <Badge variant="outline" className="mt-4 border-brand-dark/20 text-[10px] tracking-[0.2em] text-brand-dark/60">
                                {member.role}
                              </Badge>
                            </div>
                            
                            <div className="mt-6 space-y-4 text-sm leading-relaxed text-brand-dark/80 sm:text-base md:mt-8">
                              <p>{member.description || "Bio coming soon..."}</p>
                              {member.additionalInfo && (
                                <p className="text-brand-dark/60 italic">{member.additionalInfo}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24">
          <Container>
            <FadeIn>
              <Card className="relative overflow-hidden border-none bg-brand-dark text-white shadow-2xl">
                {/* Decorative BG Circles */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-brand-teal/20 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-brand-cream/10 blur-3xl" />
                
                <CardContent className="relative z-10 p-8 text-center sm:p-12 md:p-16">
                  <Sparkles className="mx-auto mb-8 h-12 w-12 text-brand-teal" />
                  <h3 className="text-3xl font-bold sm:text-4xl md:text-5xl">Ready to Transform Your Events?</h3>
                  <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg md:mt-6 md:text-xl">
                    Join thousands of event organizers who trust Strathwell to orchestrate their most important moments.
                  </p>
                  <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">
                    <Link to={createPageUrl("AIPlanner")}>
                      <button className="w-full min-w-[160px] rounded-full bg-white px-8 py-4 text-base font-bold text-brand-dark shadow-lg transition-all hover:bg-brand-cream hover:scale-105 sm:w-auto">
                        Plan with AI
                      </button>
                    </Link>
                    <Link to={createPageUrl("Contact")}>
                      <button className="w-full min-w-[160px] rounded-full border border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/10 sm:w-auto">
                        Contact Us
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </Container>
        </section>
      </div>
    </div>
  );
}
