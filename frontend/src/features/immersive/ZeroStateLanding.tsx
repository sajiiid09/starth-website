import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarterTemplate } from "@/features/immersive/data/starterTemplates";

type ZeroStateLandingProps = {
  onSubmitPrompt: (text: string) => void;
  templates: StarterTemplate[];
  onSelectTemplate: (templateId: string) => void;
};

const ZeroStateLanding: React.FC<ZeroStateLandingProps> = ({
  onSubmitPrompt,
  templates,
  onSelectTemplate
}) => {
  const [draft, setDraft] = React.useState("");

  const handleSubmit = React.useCallback(() => {
    const next = draft.trim();
    if (!next) return;
    onSubmitPrompt(next);
    setDraft("");
  }, [draft, onSubmitPrompt]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="E.g. Plan a 120-guest product launch in SF for March, budget $25k..."
            className="min-h-[96px] w-full resize-none border-none bg-transparent text-base shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            aria-label="Start planning prompt"
          />

          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
            <Button
              onClick={handleSubmit}
              disabled={!draft.trim()}
              className="h-10 rounded-xl bg-brand-teal px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Generate Blueprint
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-5 grid w-full max-w-5xl gap-4 md:grid-cols-3">
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="h-32 w-full overflow-hidden bg-slate-100">
                {template.imageUrl ? (
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
                )}
              </div>
              <div className="space-y-1 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">{template.title}</p>
                <p className="line-clamp-2 text-xs text-slate-600">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZeroStateLanding;
