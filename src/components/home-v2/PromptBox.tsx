import React from "react";
import { ChevronDown, Mic, Paperclip, Sparkles } from "lucide-react";
import gsap from "gsap";
import PillButton from "@/components/home-v2/primitives/PillButton";
import useGsapReveal from "@/components/utils/useGsapReveal";
import { motionTokens } from "@/components/utils/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { createPageUrl } from "@/utils";
import { isAuthenticated } from "@/utils/authSession";
import { setPendingPlannerIntent } from "@/utils/pendingIntent";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const promptSuggestions = [
  "Plan a 120-guest product launch in San Francisco for March, budget $25k",
  "Organize a 50-person corporate retreat in Boston for Q2, budget $15k",
  "Design a 200-guest wedding reception in NYC for September, budget $45k"
];

const templatePreviews = [
  {
    title: "Product Launch Blueprint",
    guests: "120 guests",
    budget: "$25k budget",
    type: "Launch"
  },
  {
    title: "Corporate Retreat Blueprint",
    guests: "50 attendees",
    budget: "$15k budget",
    type: "Retreat"
  },
  {
    title: "Wedding Reception Blueprint",
    guests: "200 guests",
    budget: "$45k budget",
    type: "Wedding"
  }
];

const hoverTween = (
  target: HTMLElement,
  prefersReducedMotion: boolean,
  active: boolean
) => {
  if (prefersReducedMotion) {
    return;
  }

  gsap.to(target, {
    y: active ? -4 : 0,
    scale: active ? 1.02 : 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

const PromptBox: React.FC = () => {
  const [promptValue, setPromptValue] = React.useState("");
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chipsRef = React.useRef<HTMLDivElement>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleFeatureAction = (label: string) => {
    toast.success(`${label} updated in your planner context.`);
  };

  useGsapReveal(containerRef);
  useGsapReveal(chipsRef, {
    targets: "[data-chip]",
    stagger: 0.12,
    distance: motionTokens.revealDistance - 12
  });
  useGsapReveal(templatesRef, {
    targets: "[data-template-card]",
    stagger: 0.15,
    distance: motionTokens.revealDistance - 10
  });

  return (
    <div className="flex flex-col gap-8">
      <div
        ref={containerRef}
        className="rounded-[28px] bg-gradient-to-r from-brand-teal/20 via-brand-blue/40 to-brand-coral/25 p-[1px] shadow-card"
      >
        <div className="rounded-[27px] border border-white/70 bg-white/80 p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-dark/60">
            <span className="inline-flex items-center gap-2 font-medium">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/40 text-brand-teal">
                <Sparkles className="h-4 w-4" />
              </span>
              Daily more than 10,000+ event plans generated
            </span>
            <span className="font-medium">Powered by Strathwell AI</span>
          </div>

          <div className="mt-5 rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 shadow-soft">
            <textarea
              value={promptValue}
              onChange={(event) => setPromptValue(event.target.value)}
              placeholder="Describe your event blueprint..."
              rows={3}
              className="w-full resize-none bg-transparent text-base text-brand-dark placeholder:text-brand-dark/40 focus:outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
                <button
                  type="button"
                  onClick={() => handleFeatureAction("Style presets")}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70 transition duration-250 ease-smooth hover:border-brand-dark/20 hover:text-brand-dark"
                >
                  Styles <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFeatureAction("Attachments")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/60 transition duration-250 ease-smooth hover:text-brand-dark"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <div className="inline-flex items-center rounded-full border border-brand-dark/10 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70">
                  1:1
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFeatureAction("Voice input")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/60 transition duration-250 ease-smooth hover:text-brand-dark"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <PillButton
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (promptValue.trim()) {
                      if (!isAuthenticated()) {
                        setPendingPlannerIntent({
                          prompt: promptValue.trim(),
                          returnPath: createPageUrl("AIPlanner"),
                          source: "home"
                        });
                        toast("Create an account to generate your blueprint.");
                        navigate(createPageUrl("AppEntry"));
                        return;
                      }
                      navigate(`${createPageUrl("AIPlanner")}?prompt=${encodeURIComponent(promptValue)}`);
                    } else {
                      handleFeatureAction("Prompt");
                    }
                  }}
                >
                  Generate
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={chipsRef} className="flex flex-wrap gap-3">
        {promptSuggestions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            data-chip
            onClick={() => setPromptValue(prompt)}
            onMouseEnter={(event) =>
              hoverTween(event.currentTarget, prefersReducedMotion, true)
            }
            onMouseLeave={(event) =>
              hoverTween(event.currentTarget, prefersReducedMotion, false)
            }
            className="rounded-full border border-brand-dark/10 bg-white/80 px-4 py-2 text-sm text-brand-dark/70 shadow-soft transition duration-250 ease-smooth hover:border-brand-dark/20 hover:text-brand-dark"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div
        ref={templatesRef}
        className="grid gap-4 md:grid-cols-3"
      >
        {templatePreviews.map((template) => (
          <div
            key={template.title}
            data-template-card
            onMouseEnter={(event) =>
              hoverTween(event.currentTarget, prefersReducedMotion, true)
            }
            onMouseLeave={(event) =>
              hoverTween(event.currentTarget, prefersReducedMotion, false)
            }
            className="rounded-2xl border border-brand-dark/10 bg-white/90 p-5 shadow-soft transition duration-250 ease-smooth"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
              {template.type}
            </div>
            <div className="mt-3 text-lg font-semibold text-brand-dark">
              {template.title}
            </div>
            <div className="mt-2 text-sm text-brand-dark/60">
              {template.guests} · {template.budget}
            </div>
            <button
              type="button"
              onClick={() => navigate(createPageUrl("Templates"))}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition duration-200 ease-smooth hover:text-brand-dark"
            >
              View template <span aria-hidden>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptBox;
