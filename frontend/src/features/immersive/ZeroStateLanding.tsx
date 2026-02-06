import React, { useEffect, useRef } from "react";
import { Button as ShadButton } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarterTemplate } from "@/features/immersive/data/starterTemplates";
import { Sparkle, MagicWand, ArrowRight, CaretDown, Paperclip } from "@phosphor-icons/react";
import gsap from "gsap";

type ZeroStateLandingProps = {
  onSubmitPrompt: (text: string) => void;
  templates: StarterTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onExploreMore?: () => void;
};

const ZeroStateLanding: React.FC<ZeroStateLandingProps> = ({
  onSubmitPrompt,
  templates,
  onSelectTemplate,
  onExploreMore
}) => {
  const [draft, setDraft] = React.useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Premium Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(promptRef.current, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      gsap.fromTo("[data-template-card]", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = React.useCallback(() => {
    const next = draft.trim();
    if (!next) return;
    onSubmitPrompt(next);
    setDraft("");
  }, [draft, onSubmitPrompt]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div ref={containerRef} className="relative flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center px-4 py-12">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-[15%] h-[400px] w-[400px] rounded-full bg-brand-teal/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-brand-blue/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-3">
          
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Strathwell OS
          </h1>
          <p className="mx-auto max-w-xl text-slate-500">
            Describe your vision in a few words, or start with a pre-configured blueprint below.
          </p>
        </div>

        {/* High-Fidelity Prompt Box */}
        <div ref={promptRef} className="mx-auto w-full max-w-3xl rounded-[28px] bg-gradient-to-r from-brand-teal/20 via-brand-blue/20 to-brand-coral/10 p-[1px] shadow-2xl">
          <div className="rounded-[27px] border border-white/70 bg-white/90 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
               <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
                </span>
                Planner OS
              </span>
            </div>

            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g. Plan a 120-guest product launch in SF for March, budget $25k..."
              className="min-h-[100px] w-full resize-none border-none bg-transparent text-lg shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            />

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex gap-2">
                <ShadButton variant="outline" size="sm" className="h-9 rounded-full border-slate-200 text-xs font-medium">
                  Styles <CaretDown className="ml-1 h-3 w-3" />
                </ShadButton>
                <ShadButton variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400 hover:text-brand-teal">
                  <Paperclip className="h-4 w-4" />
                </ShadButton>
              </div>
              <ShadButton
                onClick={handleSubmit}
                disabled={!draft.trim()}
                className="h-10 rounded-full bg-brand-teal px-6 text-sm font-semibold text-white transition-all hover:bg-brand-dark disabled:opacity-50"
              >
                Generate Blueprint
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShadButton>
            </div>
          </div>
        </div>

        {/* Template Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Starter Blueprints</h2>
            {onExploreMore && (
              <button onClick={onExploreMore} className="text-xs font-semibold text-brand-teal hover:underline">
                View Gallery
              </button>
            )}
          </div>
          
          <div ref={cardsRef} className="grid w-full gap-5 md:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                data-template-card
                onClick={() => onSelectTemplate(template.id)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-teal/30 hover:shadow-xl"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100">
                  {template.imageUrl ? (
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-teal transition-colors">{template.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZeroStateLanding;
