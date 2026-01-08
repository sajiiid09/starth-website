import React from "react";
import Section from "@/components/home-v2/primitives/Section";
import Container from "@/components/home-v2/primitives/Container";
import Eyebrow from "@/components/home-v2/primitives/Eyebrow";
import DisplayH2 from "@/components/home-v2/primitives/DisplayH2";
import Lead from "@/components/home-v2/primitives/Lead";
import PillButton from "@/components/home-v2/primitives/PillButton";
import { defaultSectionGaps } from "@/components/home-v2/constants";
import FadeIn from "@/components/animations/FadeIn";
import QuizPills from "@/components/home-v2/components/QuizPills";
import { toast } from "sonner";

const FinalCTA: React.FC = () => {
  const theme = "cream" as const;
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");

  const quizOptions = [
    { label: "Wedding", value: "wedding" },
    { label: "Corporate retreat", value: "corporate" },
    { label: "Lecture", value: "lecture" },
    { label: "Memorial", value: "memorial" },
    { label: "Product launch", value: "launch" },
    { label: "Community event", value: "community" }
  ];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Thanks — we’ll reach out.");
    setEmail("");
  };

  return (
    <Section theme={theme} id="home-final" dataSection="final">
      <Container>
        <div
          className="flex flex-col"
          style={{ gap: defaultSectionGaps.blockGap }}
        >
          <FadeIn>
            <div
              className="flex flex-col"
              style={{ gap: defaultSectionGaps.eyebrowToHeadline }}
            >
              <Eyebrow theme={theme}>Ready to plan</Eyebrow>
              <DisplayH2 theme={theme}>
                Ready to plan your next event blueprint?
              </DisplayH2>
            </div>
          </FadeIn>
          <FadeIn>
            <Lead theme={theme}>
              Tell us your first blueprint and we’ll tailor the Strathwell stack
              to match your moment.
            </Lead>
          </FadeIn>
          <FadeIn>
            <div className="flex flex-col gap-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/60">
                Your first blueprint?
              </div>
              <QuizPills
                options={quizOptions}
                value={selectedOption}
                onChange={setSelectedOption}
              />
            </div>
          </FadeIn>
          <FadeIn>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 flex-1 rounded-2xl border border-brand-dark/15 bg-white px-4 text-base text-brand-dark placeholder:text-brand-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
              />
              <PillButton type="submit">Request a demo</PillButton>
            </form>
            <p className="text-sm text-brand-dark/60">
              No spam. Just a curated blueprint consultation.
            </p>
          </FadeIn>
          <FadeIn>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-brand-dark/60">
              <a href="#" className="transition hover:text-brand-dark">
                Product
              </a>
              <a href="#" className="transition hover:text-brand-dark">
                Company
              </a>
              <a href="#" className="transition hover:text-brand-dark">
                Legal
              </a>
            </div>
          </FadeIn>
        </div>
        <div className="mt-16 overflow-hidden">
          <div className="text-[clamp(3rem,16vw,10rem)] font-semibold lowercase leading-none tracking-tight text-brand-dark/80">
            strathwell
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default FinalCTA;
