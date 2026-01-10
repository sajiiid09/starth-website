
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
  Sparkles
} from "lucide-react";

const teamMembers = [
  {
    name: "MOOSA",
    title: "CEO",
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/e47401580_Screenshot2025-07-10at000114.png",
    description: "MZ is a rare blend of engineer, strategist, and innovator whose journey reflects the DNA of Stanford. The only member of his class to enter with a perfect SAT score, he went on to earn three Stanford degrees—B.S. in Electrical Engineering with distinction (recognized as a Terman Scholar, awarded to the top 5% of engineering seniors), M.S. in Computer Science (AI track), and M.D.—building systems that bridged human and machine intelligence, from predictive AI models to breakthroughs in optimization, signal processing, and telemedicine.",
    additionalInfo: "A gifted educator, Moosa taught across Stanford's Medicine, Computer Science, and Engineering departments, covering everything from physiology to convex optimization and probabilistic models—simplifying complexity while inspiring future innovators. He also led multi-stakeholder projects, published in top journals, and advanced global tech-for-good initiatives that combined technical mastery with social purpose. Today, Moosa serves as the strategic architect behind Strathwell's vision to transform events and real estate into orchestrated, AI-powered experiences."
  },
  {
    name: "REEN", 
    title: "COO & Head of Global Innovation",
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/93e8ffa47_IMG_3092.jpg",
    description: "Reen is an AI executive and innovator who forged her own path beyond family privilege in the transportation and mobility sector. Educated by prestigious universities across Asia, the UK, and the US, she brings a global perspective to leadership, strategy, and innovation. She received scholarships from the French, UK, and Spanish governments and institutions, but ultimately chose to go to the United States. There, she used her savings and secured the largest share of support — around $100,000 in funding from the USA, including a Women in Business scholarship valued at $20,000.",
    additionalInfo: "She invented the world's first AI-powered event orchestration system and launched a pioneering monochrome fashion brand, both backed by Ivy League talent and top tech leaders. Her career spans big tech, global consulting, hospitality, real estate, and law. Reen has scaled organizations across the US, UK, and Singapore, advised CEOs, and won hackathons in Singapore, Hong Kong, the UK, and the US. Recognized by major press outlets and supported by leaders from Stanford and Harvard, she is now driving her orchestration platform to redefine the future of global events and real estate, turning vision into transformation on a worldwide scale."
  },
  {
    name: "GEORG",
    title: "Strategic Advisor", 
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/4822df1cf_Screenshot2025-07-02at205916.png",
    description: "Dr. Georg is a faculty member at Harvard Medical School, Brigham and Women's Hospital, and the Harvard T.H. Chan School of Public Health. An expert in AI-driven modeling and large-scale data integration, he holds a Ph.D. from Imperial College London with prior studies at University of Cambridge and Columbia University.",
    additionalInfo: "With 50+ peer-reviewed publications and research experience at Los Alamos and Lawrence Livermore National Labs, he is internationally recognized for contributions to statistical genetics, computational methods, and quantum optimization. At Strathwell, he develops adaptive AI frameworks to integrate multimodal data and orchestrate complex real-world systems."
  },
  {
    name: "HAL",
    title: "Founding Advisor",
    role: "STRATHWELL", 
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/8106bc5a5_IMG_6114.jpg",
    description: "Hal Bennett has over 40 years of technology leadership experience with senior executive roles at IBM, Symantec/Norton, Amazon Web Services, Adobe, Novell, and various start-ups. These roles include field and operational experiences, consistently delivering business growth in sales, marketing, alliances, business development, and channels. Hal has been successful building teams, developing high-performance cultures, expanding into new markets, and providing hardware/software/services solutions through various routes-to-market. He is customer-driven, closing and managing new and existing clients/partnerships in consumer, SMB, and large enterprises with hardware, software, services and SaaS solutions.",
    additionalInfo: "Hal is presently Senior Vice President at BuildZoom, Inc., a leading-edge construction marketplace and data company. He received his BA in Economics/Mathematics from Dartmouth College and originally from the Boston area, Hal and his wife, Patti now live in Napa, California."
  },
  {
    name: "JAY",
    title: "Founding Advisor",
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/f2d8a35aa_Screenshot2025-08-14at101341.png", 
    description: "Jay Ruffin is a global technology executive and operating partner recognized for delivering over $60M in transformation value, preventing $80M in revenue loss, and generating $15–$20M in annual uplifts for Fortune 500 and private equity clients. Specializing in AI, SaaS/cloud enablement, and digital transformation, Jay builds and scales global teams that unlock 40%+ productivity gains and accelerate EBITDA growth.",
    additionalInfo: "A trusted C‑suite advisor, he guides enterprises through complex modernization, M&A, and AI adoption programs—aligning business and technology strategies for measurable results. Fluent in Spanish and a Yale University graduate, Jay combines strategic vision with hands‑on execution to drive sustainable growth in dynamic markets."
  },
  {
    name: "PARNIA",
    title: "Client Success Partner",
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/018d8f060_Screenshot2025-08-27at115633.png",
    description: "Parnia Alipour is an experienced IT professional and product analyst with a strong passion for leveraging technology to drive business growth. With a keen interest in data analytics, generative AI, marketing, and entrepreneurship, she thrives on creating innovative solutions that deliver measurable impact.",
    additionalInfo: "Parnia is motivated by opportunities that challenge her to learn, adapt, and expand her expertise, and she brings a forward-thinking approach to every project she takes on. Her commitment to using technology strategically positions her as a valuable contributor to any team or venture focused on innovation and business success."
  },
  {
    name: "JOY",
    title: "Social Media and Community Growth Intern",
    role: "STRATHWELL",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d4e38c341adad3b24950ed/de1b29780_Chen_Joy_Blue_White_Headshot.jpg",
    description: "Joy is a passionate content creator dedicated to producing impactful and engaging stories across digital platforms. With a creative flair and an eye for detail, she brings fresh perspectives that resonate with diverse audiences.",
    additionalInfo: "Outside of content creation, Joy enjoys exploring her artistic side through ceramics, practicing Brazilian Jiu-Jitsu, and experimenting with food content. She is excited to grow and collaborate with the Strathwell team, combining creativity and strategy to deliver meaningful content that inspires and connects."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-brand-cream/70 via-brand-light to-brand-light">
        <Container>
          <FadeIn className="text-center">
            <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              <Users className="h-4 w-4" />
              About Strathwell
            </Badge>

            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Transforming Events Through
              <br />
              <span className="bg-gradient-to-r from-brand-teal to-brand-dark bg-clip-text text-transparent">
                AI Innovation
              </span>
            </h1>

            <p className="mt-6 text-lg text-brand-dark/70 md:text-2xl">
              At Strathwell, we're pioneering the future of event orchestration with cutting-edge AI technology and world-class expertise.
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <Container>
          <FadeIn className="grid gap-6 md:grid-cols-3" staggerChildren={0.08} childSelector=".mission-card">
            {[
              {
                title: "Our Mission",
                description:
                  "To revolutionize the events industry by making world-class event planning accessible through AI-powered orchestration and curated partnerships.",
                icon: Target
              },
              {
                title: "Our Vision",
                description:
                  "A world where every event, from intimate gatherings to global conferences, is seamlessly orchestrated with precision and creativity.",
                icon: Lightbulb
              },
              {
                title: "Our Values",
                description:
                  "Innovation, excellence, and human connection drive everything we do. We believe technology should amplify human creativity, not replace it.",
                icon: Heart
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="mission-card border border-white/40 bg-white/80 text-center shadow-card">
                  <CardContent className="p-8">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal/10">
                      <Icon className="h-6 w-6 text-brand-teal" />
                    </div>
                    <h3 className="text-xl font-semibold text-brand-dark">{item.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-brand-dark/70">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </FadeIn>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-brand-cream/40">
        <Container>
          <FadeIn className="text-center">
            <Badge className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              <Award className="h-4 w-4" />
              Our Team
            </Badge>
            <h2 className="text-3xl font-semibold md:text-4xl">World-Class Experts</h2>
            <p className="mt-4 text-lg text-brand-dark/70">
              Meet the visionaries behind Strathwell's revolutionary approach to event orchestration.
            </p>
          </FadeIn>

          <FadeIn className="mt-16 space-y-16" staggerChildren={0.08} childSelector=".team-row">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="team-row grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12"
              >
                <div
                  className={`aspect-[4/5] overflow-hidden rounded-2xl border border-white/40 shadow-card md:col-span-4 ${
                    index % 2 === 0 ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className={`md:col-span-8 ${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}>
                  <h3 className="text-3xl font-semibold text-brand-dark">{member.name}</h3>
                  <p className="mt-1 text-lg font-medium text-brand-teal">{member.title}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark/50">
                    {member.role}
                  </p>
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-brand-dark/80">
                    <p>{member.description}</p>
                    {member.additionalInfo && <p>{member.additionalInfo}</p>}
                  </div>
                </div>
              </div>
            ))}
          </FadeIn>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <Container>
          <FadeIn>
            <Card className="border-none bg-gradient-to-r from-brand-dark to-brand-dark/90 text-brand-light shadow-card">
              <CardContent className="p-12 text-center">
                <Sparkles className="mx-auto mb-6 h-12 w-12 text-brand-cream" />
                <h3 className="text-3xl font-semibold">Ready to Transform Your Events?</h3>
                <p className="mt-4 text-lg text-brand-light/80">
                  Join thousands of event organizers who trust Strathwell to orchestrate their most important moments.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link to={createPageUrl("AIPlanner")}>
                    <button className="w-full rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-dark transition hover:bg-brand-cream sm:w-auto">
                      Plan with AI
                    </button>
                  </Link>
                  <Link to={createPageUrl("Contact")}>
                    <button className="w-full rounded-full border border-white/60 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-dark sm:w-auto">
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
  );
}
