import React from "react";
import {
  ChevronDown,
  CircleDot,
  LayoutTemplate,
  Loader2,
  Mic,
  Paperclip,
  Sparkles,
  Store
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { plannerService } from "@/features/planner/services/plannerService";
import { usePlannerSessions } from "@/features/planner/PlannerSessionsContext";
import { ChatMessage, MatchesState, PlannerState } from "@/features/planner/types";

type WorkspaceView = "chat" | "matches";

const quickPrompts = [
  "Plan a 120-guest product launch in SF for March, budget $25k.",
  "Build a premium timeline for a two-day executive summit in Austin.",
  "Find a venue + catering direction for a 90-person networking night.",
  "Create a staffing and vendor checklist for a spring brand activation."
];

const fallbackMatches: MatchesState = {
  activeTab: "templates",
  templates: [
    {
      id: "fallback-template-1",
      type: "template",
      title: "Launch Blueprint Starter",
      description: "Structured outline for premium launch sequencing."
    }
  ],
  marketplace: [
    {
      id: "fallback-market-1",
      type: "marketplace",
      title: "Venue + Vendor Match",
      description: "Shortlist appears here as planning context develops."
    }
  ]
};

let localMessageCounter = 0;
const createMessageId = (prefix: string) => {
  localMessageCounter += 1;
  return `${prefix}-${Date.now()}-${localMessageCounter}`;
};

type ChatPanelProps = {
  messages: ChatMessage[];
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  disableSend: boolean;
  heightClass?: string;
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  draftMessage,
  onDraftChange,
  onSend,
  onQuickPrompt,
  disableSend,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const threadRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`;
  }, [draftMessage]);

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const renderAssistantBubble = (message: ChatMessage) => {
    const isTransient =
      message.status === "thinking" || message.status === "orchestrating";

    return (
      <div key={message.id} className="flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
          <Sparkles className="h-4 w-4 text-brand-teal" />
        </div>
        <div
          className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm text-slate-700 ${
            isTransient
              ? "border-slate-300 bg-slate-100 italic text-slate-600"
              : "border-slate-200 bg-slate-100"
          }`}
        >
          <p className={isTransient ? "animate-pulse" : ""}>{message.text}</p>
        </div>
      </div>
    );
  };

  const renderUserBubble = (message: ChatMessage) => {
    return (
      <div key={message.id} className="flex justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-1">
          <span className="rounded-full border border-brand-teal/20 bg-brand-teal/10 px-2 py-0.5 text-[11px] font-semibold text-brand-teal">
            You
          </span>
          <div className="rounded-2xl bg-brand-teal px-4 py-3 text-sm text-white">
            <p>{message.text}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${heightClass}`}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-teal">
              Strathwell AI
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Ready to plan</span>
            </div>
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

      <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                <Sparkles className="h-4 w-4 text-brand-teal" />
              </div>
              <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Hi! I&apos;m your AI event planner. Share your goals and constraints, and I&apos;ll
                help orchestrate the plan.
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="h-auto justify-start whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                  onClick={() => onQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          [...messages]
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((message) =>
              message.role === "user"
                ? renderUserBubble(message)
                : renderAssistantBubble(message)
            )
        )}
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 px-2">
              Styles
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              placeholder="Describe your event goals, guest count, date, and budget..."
              className="min-h-[44px] max-h-[112px] resize-none border-slate-200 text-sm focus-visible:ring-brand-teal/35"
            />
            <Button
              onClick={onSend}
              disabled={disableSend}
              className="h-10 rounded-xl bg-brand-teal px-4 text-white hover:bg-brand-teal/90 disabled:opacity-50"
            >
              Generate
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
};

type MatchesPanelProps = {
  matches: MatchesState;
  plannerState?: PlannerState;
  onSourceChange: (tab: MatchesState["activeTab"]) => void;
  heightClass?: string;
};

const MatchesPanel: React.FC<MatchesPanelProps> = ({
  matches,
  plannerState,
  onSourceChange,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const items =
    matches.activeTab === "templates" ? matches.templates : matches.marketplace;

  return (
    <aside
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${heightClass}`}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          RELEVANT MATCHES
        </p>
        <Tabs
          value={matches.activeTab}
          onValueChange={(value) => onSourceChange(value as MatchesState["activeTab"])}
        >
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
        {plannerState && (
          <article className="rounded-xl border border-brand-teal/15 bg-brand-teal/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
              Blueprint
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">{plannerState.title}</h3>
            <p className="mt-1 text-xs text-slate-600">{plannerState.summary}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="rounded-lg bg-white px-2 py-1">
                <p className="text-[10px] uppercase text-slate-400">Cost</p>
                <p className="font-semibold text-slate-900">${plannerState.kpis.totalCost}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-1">
                <p className="text-[10px] uppercase text-slate-400">Per Head</p>
                <p className="font-semibold text-slate-900">${plannerState.kpis.costPerAttendee}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-1">
                <p className="text-[10px] uppercase text-slate-400">Confidence</p>
                <p className="font-semibold text-slate-900">{plannerState.kpis.confidencePct}%</p>
              </div>
            </div>
          </article>
        )}

        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
          >
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </aside>
  );
};

const OrganizerAIWorkspace: React.FC = () => {
  const [tabletView, setTabletView] = React.useState<WorkspaceView>("chat");
  const [draftMessage, setDraftMessage] = React.useState("");
  const { isReady, activeSessionId, activeSession, createNewSession, updateSession } =
    usePlannerSessions();
  const timeoutRefs = React.useRef<number[]>([]);

  const messages = activeSession?.messages ?? [];
  const matches = activeSession?.matches ?? fallbackMatches;

  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timer) => window.clearTimeout(timer));
      timeoutRefs.current = [];
    };
  }, []);

  const handleMatchTabChange = React.useCallback(
    (tab: MatchesState["activeTab"]) => {
      if (!activeSessionId) return;
      updateSession(activeSessionId, (session) => ({
        ...session,
        matches: {
          ...session.matches,
          activeTab: tab
        }
      }));
    },
    [activeSessionId, updateSession]
  );

  const sendMessage = React.useCallback(
    async (incomingText?: string) => {
      const messageText = (incomingText ?? draftMessage).trim();
      if (!messageText) return;

      setDraftMessage("");
      const sessionSnapshot = activeSession ?? createNewSession();
      const targetSessionId = sessionSnapshot.id;
      const now = Date.now();

      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        text: messageText,
        status: "final",
        createdAt: now
      };
      const thinkingMessageId = createMessageId("assistant-thinking");
      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        role: "assistant",
        text: "Strath AI is thinking ...",
        status: "thinking",
        createdAt: now + 1
      };

      const shouldRetitle = sessionSnapshot.messages.filter((msg) => msg.role === "user").length === 0;
      const retitled = shouldRetitle
        ? plannerService.retitleSessionFromFirstMessage(sessionSnapshot, messageText)
        : sessionSnapshot;

      updateSession(targetSessionId, (session) => ({
        ...session,
        title: retitled.title,
        messages: [...session.messages, userMessage, thinkingMessage]
      }));

      const orchestratingTimer = window.setTimeout(() => {
        updateSession(targetSessionId, (session) => ({
          ...session,
          messages: session.messages.map((message) =>
            message.id === thinkingMessageId
              ? {
                  ...message,
                  text: "Strath AI is orchestrating ...",
                  status: "orchestrating"
                }
              : message
          )
        }));
      }, 300);
      timeoutRefs.current.push(orchestratingTimer);

      try {
        const response = await plannerService.sendMessage(
          {
            ...retitled,
            messages: [...retitled.messages, userMessage]
          },
          messageText
        );

        updateSession(targetSessionId, (session) => {
          const replaced = session.messages.map((message) =>
            message.id === thinkingMessageId ? response.assistantMessage : message
          );
          const hasReplaced = replaced.some((message) => message.id === response.assistantMessage.id);

          return {
            ...session,
            messages: hasReplaced ? replaced : [...replaced, response.assistantMessage],
            plannerState: response.updatedPlannerState ?? session.plannerState,
            matches: response.updatedMatches ?? session.matches
          };
        });
      } catch (error) {
        console.error("plannerService.sendMessage failed:", error);
        updateSession(targetSessionId, (session) => ({
          ...session,
          messages: session.messages.map((message) =>
            message.id === thinkingMessageId
              ? {
                  ...message,
                  text: "I hit a temporary issue. Please try again in a moment.",
                  status: "final"
                }
              : message
          )
        }));
      }
    },
    [activeSession, createNewSession, draftMessage, updateSession]
  );

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-dark/50" />
      </div>
    );
  }

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
          Session-backed planner architecture is active with typed blueprint and matches state.
        </p>
      </section>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ChatPanel
          messages={messages}
          draftMessage={draftMessage}
          onDraftChange={setDraftMessage}
          onSend={() => void sendMessage()}
          onQuickPrompt={(prompt) => void sendMessage(prompt)}
          disableSend={!draftMessage.trim()}
        />
        <MatchesPanel
          matches={matches}
          plannerState={activeSession?.plannerState}
          onSourceChange={handleMatchTabChange}
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
            <ChatPanel
              messages={messages}
              draftMessage={draftMessage}
              onDraftChange={setDraftMessage}
              onSend={() => void sendMessage()}
              onQuickPrompt={(prompt) => void sendMessage(prompt)}
              disableSend={!draftMessage.trim()}
            />
          </TabsContent>
          <TabsContent value="matches" className="mt-0">
            <MatchesPanel
              matches={matches}
              plannerState={activeSession?.plannerState}
              onSourceChange={handleMatchTabChange}
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
          <ChatPanel
            messages={messages}
            draftMessage={draftMessage}
            onDraftChange={setDraftMessage}
            onSend={() => void sendMessage()}
            onQuickPrompt={(prompt) => void sendMessage(prompt)}
            disableSend={!draftMessage.trim()}
            heightClass="h-[70vh] min-h-[460px]"
          />
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <SheetHeader className="border-b border-slate-200 px-5 py-4">
              <SheetTitle>Matches</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <MatchesPanel
                matches={matches}
                plannerState={activeSession?.plannerState}
                onSourceChange={handleMatchTabChange}
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
