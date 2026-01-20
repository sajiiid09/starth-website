import React from "react";
import {
  ChevronDown,
  Mic,
  MicOff,
  Paperclip,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import PillButton from "@/components/home-v2/primitives/PillButton";
import useGsapReveal from "@/components/utils/useGsapReveal";
import { motionTokens } from "@/components/utils/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const promptSuggestions = [
  "Plan a 120-guest product launch in San Francisco for March, budget $25k",
  "Organize a 50-person corporate retreat in Boston for Q2, budget $15k",
  "Design a 200-guest wedding reception in NYC for September, budget $45k"
];

const templatePreviews = [
  {
    title: "Product Launch Blueprint",
    meta: "120 guests · $25k budget",
    type: "Launch"
  },
  {
    title: "Corporate Retreat Blueprint",
    meta: "50 attendees · $15k budget",
    type: "Retreat"
  },
  {
    title: "Wedding Reception Blueprint",
    meta: "200 guests · $45k budget",
    type: "Wedding"
  }
];

type PlannerPromptBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  onUploadImages: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedImages: string[];
  uploadingImage: boolean;
  onRemoveImage: (index: number) => void;
  showTemplatePreviews?: boolean;
};

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

const PlannerPromptBox: React.FC<PlannerPromptBoxProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  isLoading,
  isRecording,
  onToggleRecording,
  onUploadImages,
  uploadedImages,
  uploadingImage,
  onRemoveImage,
  showTemplatePreviews = true
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chipsRef = React.useRef<HTMLDivElement>(null);
  const templatesRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    <div className="space-y-8">
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
              Strathwell Planner Studio
            </span>
            <span className="font-medium">Powered by Strathwell AI</span>
          </div>

          <div className="mt-5 rounded-2xl border border-brand-dark/10 bg-white px-4 py-3 shadow-soft">
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Describe your event blueprint..."
              rows={3}
              onKeyDown={onKeyPress}
              disabled={isLoading}
              className="w-full resize-none bg-transparent text-base text-brand-dark placeholder:text-brand-dark/40 focus:outline-none"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-brand-dark/60">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-3 py-1 text-xs font-medium text-brand-dark/70 transition duration-250 ease-smooth hover:border-brand-dark/20 hover:text-brand-dark"
                >
                  Styles <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || uploadingImage}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/60 transition duration-250 ease-smooth hover:text-brand-dark disabled:opacity-60"
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
                  onClick={onToggleRecording}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/10 bg-white text-brand-dark/60 transition duration-250 ease-smooth hover:text-brand-dark"
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <PillButton
                  variant="primary"
                  size="sm"
                  disabled={!value.trim() || isLoading}
                  onClick={onSubmit}
                >
                  {isLoading ? "Generating..." : "Generate"}
                </PillButton>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onUploadImages}
              className="hidden"
              disabled={isLoading || uploadingImage}
            />
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {uploadedImages.map((url, index) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-brand-dark text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={chipsRef} className="flex flex-wrap gap-3">
        {promptSuggestions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            data-chip
            onClick={() => onChange(prompt)}
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

      {showTemplatePreviews && (
        <div ref={templatesRef} className="grid gap-4 md:grid-cols-3">
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
                {template.meta}
              </div>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition duration-200 ease-smooth hover:text-brand-dark"
              >
                View template <span aria-hidden>→</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlannerPromptBox;
