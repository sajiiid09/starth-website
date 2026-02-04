import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarterTemplate } from "@/features/immersive/data/starterTemplates";

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
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center px-4 py-6 transition-opacity duration-200 ease-out">
      <div className="w-full max-w-5xl">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Start planning prompt"
              placeholder="Describe your event goals, guest count, date, and budget..."
              className="min-h-[48px] max-h-[120px] resize-none border-slate-200 text-sm focus-visible:ring-brand-teal/35"
            />
            <Button
              onClick={handleSubmit}
              disabled={!draft.trim()}
              className="h-10 min-w-[112px] rounded-xl bg-brand-teal px-4 text-white hover:bg-brand-teal/90 disabled:bg-slate-200 disabled:text-slate-400"
            >
              Generate
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="h-32 w-full overflow-hidden bg-slate-100">
                {template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                )}
              </div>
              <div className="space-y-1 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                <p className="text-xs text-slate-600">{template.description}</p>
              </div>
            </button>
          ))}
        </div>

        {onExploreMore && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              className="rounded-lg border-slate-200 text-slate-700"
              onClick={onExploreMore}
            >
              Explore more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZeroStateLanding;
