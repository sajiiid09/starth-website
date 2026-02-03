import React from "react";
import { CircleDot, LayoutTemplate, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WorkspaceView = "chat" | "matches";
type MatchSource = "templates" | "marketplace";

const templateMatches = [
  {
    title: "Elegant Rooftop Reception",
    detail: "Template blueprint with timeline and staffing model."
  },
  {
    title: "Executive Offsite Framework",
    detail: "Agenda, room flow, and vendor shortlist recommendations."
  },
  {
    title: "Brand Launch Evening",
    detail: "Premium multi-zone layout with production checkpoints."
  }
];

const marketplaceMatches = [
  {
    title: "Harbor View Event Loft",
    detail: "Venue match for 120 guests with full-service support."
  },
  {
    title: "Northline Catering Studio",
    detail: "Curated service partner aligned to your event profile."
  },
  {
    title: "Summit AV Collective",
    detail: "Production partner with staging and live-stream packages."
  }
];

type ChatPanelProps = {
  heightClass?: string;
};

const ChatPanel: React.FC<ChatPanelProps> = ({ heightClass = "h-[72vh] min-h-[520px]" }) => {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${heightClass}`}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-teal">
              Strathwell AI
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Conversation Workspace</h2>
          </div>
          <Badge
            variant="secondary"
            className="border border-emerald-200 bg-emerald-50 text-emerald-700"
          >
            <CircleDot className="mr-1 h-3 w-3" />
            Ready
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 text-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Phase 3 target
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">Chat thread (Phase 3)</h3>
            <p className="max-w-xl text-sm text-slate-600">
              Interactive planning chat, memory, and action tools will be connected in the next
              phase.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white/95 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Composer
        </p>
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Message composer placeholder (Phase 3)
        </div>
        {/* TODO: Implement live chat input, send actions, and response streaming in Phase 3. */}
      </footer>
    </section>
  );
};

type MatchesPanelProps = {
  activeSource: MatchSource;
  onSourceChange: (source: MatchSource) => void;
  heightClass?: string;
};

const MatchesPanel: React.FC<MatchesPanelProps> = ({
  activeSource,
  onSourceChange,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const items = activeSource === "templates" ? templateMatches : marketplaceMatches;

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${heightClass}`}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          RELEVANT MATCHES
        </p>
        <Tabs value={activeSource} onValueChange={(value) => onSourceChange(value as MatchSource)}>
          <TabsList className="mt-3 grid h-auto w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <TabsTrigger value="templates" className="rounded-lg">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-lg">
              <Store className="mr-2 h-4 w-4" />
              Marketplace
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </article>
        ))}
      </div>
    </aside>
  );
};

const OrganizerAIWorkspace: React.FC = () => {
  const [tabletView, setTabletView] = React.useState<WorkspaceView>("chat");
  const [activeMatchSource, setActiveMatchSource] = React.useState<MatchSource>("templates");

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-light px-6 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Strathwell AI
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Ready to plan</h1>
          <Badge variant="secondary" className="border border-slate-200 bg-white text-slate-700">
            <Sparkles className="mr-1 h-3.5 w-3.5 text-brand-teal" />
            Workspace shell active
          </Badge>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          3-panel planning layout is now in place: chat in the center, insights on the right, and
          responsive behavior for tablet and mobile.
        </p>
      </section>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ChatPanel />
        <MatchesPanel
          activeSource={activeMatchSource}
          onSourceChange={setActiveMatchSource}
        />
      </div>

      <div className="hidden md:block xl:hidden">
        <Tabs
          value={tabletView}
          onValueChange={(value) => setTabletView(value as WorkspaceView)}
          className="space-y-3"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
              <TabsTrigger value="chat" className="rounded-md">
                Chat
              </TabsTrigger>
              <TabsTrigger value="matches" className="rounded-md">
                Matches
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="mt-0">
            <ChatPanel />
          </TabsContent>
          <TabsContent value="matches" className="mt-0">
            <MatchesPanel
              activeSource={activeMatchSource}
              onSourceChange={setActiveMatchSource}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-3 md:hidden">
        <Sheet>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Mobile view
              </p>
              <p className="text-sm font-medium text-slate-900">Chat is active</p>
            </div>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                Open Matches
              </Button>
            </SheetTrigger>
          </div>
          <ChatPanel heightClass="h-[70vh] min-h-[460px]" />
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <SheetHeader className="border-b border-slate-200 px-5 py-4">
              <SheetTitle>Matches</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <MatchesPanel
                activeSource={activeMatchSource}
                onSourceChange={setActiveMatchSource}
                heightClass="h-[calc(100vh-7.5rem)] min-h-0 rounded-xl"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default OrganizerAIWorkspace;
