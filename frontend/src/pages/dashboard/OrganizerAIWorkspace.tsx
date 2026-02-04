import React from "react";
import {
  Coins,
  ChevronDown,
  CircleDot,
  Loader2,
  Mic,
  Paperclip,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import BlueprintDetailPanel from "@/features/planner/components/BlueprintDetailPanel";
import RelevantMatchesPanel from "@/features/planner/components/RelevantMatchesPanel";
import { useCredits } from "@/features/planner/credits/useCredits";
import { getCreditsConfig } from "@/features/planner/credits/storage";
import { plannerService } from "@/features/planner/services/plannerService";
import { usePlannerSessions } from "@/features/planner/PlannerSessionsContext";
import { ChatMessage, MatchItem, MatchesState, PlannerState } from "@/features/planner/types";

type WorkspaceView = "chat" | "matches";
type RightPanelView = "matches" | "blueprint";
type BlueprintHighlights = {
  header: boolean;
  kpis: boolean;
  inventory: boolean;
  timeline: boolean;
  budget: boolean;
};

const defaultBlueprintHighlights: BlueprintHighlights = {
  header: false,
  kpis: false,
  inventory: false,
  timeline: false,
  budget: false
};

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
      description: "Structured outline for premium launch sequencing.",
      imageUrl:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600"
    }
  ],
  marketplace: [
    {
      id: "fallback-market-1",
      type: "marketplace",
      title: "Venue + Vendor Match",
      description: "Shortlist appears here as planning context develops.",
      imageUrl:
        "https://images.unsplash.com/photo-1519671482502-9759101d4561?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

const loadingMatches: MatchesState = {
  activeTab: "templates",
  templates: [],
  marketplace: []
};

let localMessageCounter = 0;
const createMessageId = (prefix: string) => {
  localMessageCounter += 1;
  return `${prefix}-${Date.now()}-${localMessageCounter}`;
};

const renderMessageText = (text: string, isUserBubble = false) => {
  const segments = text.split(/(https?:\/\/[^\s]+)/gi);
  const linkClassName = isUserBubble
    ? "font-medium underline underline-offset-2 break-all text-white/95 hover:text-white"
    : "font-medium underline underline-offset-2 break-all text-brand-teal hover:text-brand-teal/80";

  return segments.map((segment, index) => {
    if (/^https?:\/\//i.test(segment)) {
      return (
        <a
          key={`msg-link-${index}-${segment}`}
          href={segment}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {segment}
        </a>
      );
    }

    return <React.Fragment key={`msg-text-${index}`}>{segment}</React.Fragment>;
  });
};

type MessageThreadProps = {
  messages: ChatMessage[];
  onQuickPrompt: (prompt: string) => void;
};

const MessageThread: React.FC<MessageThreadProps> = React.memo(({ messages, onQuickPrompt }) => {
  const sortedMessages = React.useMemo(
    () => [...messages].sort((a, b) => a.createdAt - b.createdAt),
    [messages]
  );

  const renderAssistantBubble = (message: ChatMessage) => {
    const isTransient =
      message.status === "thinking" || message.status === "orchestrating";

    return (
      <div
        key={message.id}
        className="animate-in fade-in-0 slide-in-from-bottom-1 flex items-start gap-3 duration-200 ease-out"
      >
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
          <p
            className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${
              isTransient ? "animate-pulse" : ""
            }`}
          >
            {renderMessageText(message.text)}
          </p>
        </div>
      </div>
    );
  };

  const renderUserBubble = (message: ChatMessage) => {
    return (
      <div
        key={message.id}
        className="animate-in fade-in-0 slide-in-from-bottom-1 flex justify-end duration-200 ease-out"
      >
        <div className="flex max-w-[85%] flex-col items-end gap-1.5">
          <span className="rounded-full border border-brand-teal/20 bg-brand-teal/10 px-2 py-0.5 text-[11px] font-semibold text-brand-teal">
            You
          </span>
          <div className="rounded-2xl bg-brand-teal px-4 py-3 text-sm text-white">
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {renderMessageText(message.text, true)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
            <Sparkles className="h-4 w-4 text-brand-teal" />
          </div>
          <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Hi! I&apos;m your AI event planner. Share your goals and constraints, and I&apos;ll
            help orchestrate the plan.
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Try one of these prompts
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="h-auto justify-start whitespace-normal rounded-xl border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition-colors duration-200 hover:bg-slate-50 focus-visible:ring-brand-teal/35"
                onClick={() => onQuickPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sortedMessages.map((message) =>
        message.role === "user" ? renderUserBubble(message) : renderAssistantBubble(message)
      )}
    </div>
  );
});

MessageThread.displayName = "MessageThread";

type ChatPanelProps = {
  messages: ChatMessage[];
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onQuickPrompt: (prompt: string) => void;
  disableSend: boolean;
  isCreditsEnabled: boolean;
  credits: number;
  creditsPerMessage: number;
  onAddDemoCredits: () => void;
  onResetCredits: () => void;
  heightClass?: string;
};

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  draftMessage,
  onDraftChange,
  onSend,
  onQuickPrompt,
  disableSend,
  isCreditsEnabled,
  credits,
  creditsPerMessage,
  onAddDemoCredits,
  onResetCredits,
  heightClass = "h-[72vh] min-h-[520px]"
}) => {
  const threadRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);
  const isOutOfCredits = isCreditsEnabled && credits < creditsPerMessage;
  const sendDisabled = disableSend || isOutOfCredits;

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
          <div className="flex items-center gap-2">
            {isCreditsEnabled && (
              <Badge
                variant="secondary"
                className="border border-brand-teal/20 bg-brand-teal/10 text-brand-teal"
              >
                <Coins className="mr-1 h-3 w-3" />
                Credits: {credits}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="border border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              <CircleDot className="mr-1 h-3 w-3" />
              Ready
            </Badge>
          </div>
        </div>
      </header>

      <div ref={threadRef} className="flex-1 overflow-y-auto overscroll-y-contain p-5">
        <MessageThread messages={messages} onQuickPrompt={onQuickPrompt} />
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          {isOutOfCredits && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-900">
                You&apos;re out of credits. Upgrade to continue.
              </p>
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-7 rounded-lg bg-brand-teal px-3 text-xs text-white hover:bg-brand-teal/90"
                  >
                    Upgrade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upgrade is coming soon</DialogTitle>
                    <DialogDescription>
                      Billing and package management will arrive with backend integration.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        onAddDemoCredits();
                        setUpgradeDialogOpen(false);
                      }}
                      className="bg-brand-teal text-white hover:bg-brand-teal/90"
                    >
                      Add demo credits (+50)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        onResetCredits();
                        setUpgradeDialogOpen(false);
                      }}
                    >
                      Reset to default
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200 px-2 focus-visible:ring-brand-teal/35"
            >
              Styles
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 focus-visible:ring-brand-teal/35"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 focus-visible:ring-brand-teal/35"
                aria-label="Voice input"
              >
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
              aria-label="Message composer"
              placeholder="Describe your event goals, guest count, date, and budget..."
              className="min-h-[44px] max-h-[112px] resize-none border-slate-200 text-sm focus-visible:ring-brand-teal/35"
            />
            <Button
              onClick={onSend}
              disabled={sendDisabled}
              className="h-10 min-w-[112px] rounded-xl bg-brand-teal px-4 text-white transition-colors duration-200 hover:bg-brand-teal/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:opacity-100"
            >
              Generate
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">Shift+Enter for a new line.</p>
            {isCreditsEnabled && (
              <p className="text-[11px] text-slate-500">
                {creditsPerMessage} {creditsPerMessage === 1 ? "credit" : "credits"} per message
              </p>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
};

const OrganizerAIWorkspace: React.FC = () => {
  const [tabletView, setTabletView] = React.useState<WorkspaceView>("chat");
  const [rightPanelView, setRightPanelView] = React.useState<RightPanelView>("matches");
  const [draftMessage, setDraftMessage] = React.useState("");
  const [isRightPanelLoading, setIsRightPanelLoading] = React.useState(false);
  const [blueprintHighlights, setBlueprintHighlights] =
    React.useState<BlueprintHighlights>(defaultBlueprintHighlights);
  const creditsConfig = React.useMemo(() => getCreditsConfig(), []);
  const { credits, deduct, add, resetToDefault, isEnabled: isCreditsEnabled } = useCredits();
  const { isReady, activeSessionId, activeSession, createNewSession, updateSession } =
    usePlannerSessions();
  const timeoutRefs = React.useRef<number[]>([]);
  const rightPanelSessionRef = React.useRef<string | null>(null);
  const rightPanelHadPlannerRef = React.useRef(false);
  const blueprintTimeoutRef = React.useRef<number | null>(null);
  const previousPlannerSnapshotRef = React.useRef<{
    sessionId: string | null;
    plannerState?: PlannerState;
    plannerStateUpdatedAt?: number;
  }>({
    sessionId: null
  });

  const messages = activeSession?.messages ?? [];
  const matches = React.useMemo(() => {
    const sessionMatches = activeSession?.matches;
    if (!sessionMatches) {
      return fallbackMatches;
    }

    const hasItems =
      sessionMatches.templates.length > 0 || sessionMatches.marketplace.length > 0;
    if (hasItems) {
      return sessionMatches;
    }

    return {
      ...fallbackMatches,
      activeTab: sessionMatches.activeTab
    };
  }, [activeSession?.matches]);
  const hasPlannerState = Boolean(activeSession?.plannerState);

  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timer) => window.clearTimeout(timer));
      timeoutRefs.current = [];
      if (blueprintTimeoutRef.current) {
        window.clearTimeout(blueprintTimeoutRef.current);
        blueprintTimeoutRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const sessionChanged = rightPanelSessionRef.current !== (activeSessionId ?? null);

    if (!hasPlannerState) {
      setRightPanelView("matches");
      rightPanelHadPlannerRef.current = false;
      rightPanelSessionRef.current = activeSessionId ?? null;
      return;
    }

    if (sessionChanged || !rightPanelHadPlannerRef.current) {
      setRightPanelView("blueprint");
    }

    rightPanelHadPlannerRef.current = true;
    rightPanelSessionRef.current = activeSessionId ?? null;
  }, [activeSessionId, hasPlannerState]);

  React.useEffect(() => {
    if (!activeSessionId) {
      setIsRightPanelLoading(false);
      return;
    }

    setIsRightPanelLoading(true);
    const timer = window.setTimeout(() => {
      setIsRightPanelLoading(false);
    }, 140);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeSessionId]);

  React.useEffect(() => {
    const currentState = activeSession?.plannerState;
    const currentUpdatedAt = activeSession?.plannerStateUpdatedAt;
    const previous = previousPlannerSnapshotRef.current;
    const sessionChanged = previous.sessionId !== (activeSessionId ?? null);

    if (!currentState) {
      previousPlannerSnapshotRef.current = {
        sessionId: activeSessionId ?? null,
        plannerState: undefined,
        plannerStateUpdatedAt: undefined
      };
      setBlueprintHighlights(defaultBlueprintHighlights);
      return;
    }

    if (sessionChanged || !previous.plannerState) {
      previousPlannerSnapshotRef.current = {
        sessionId: activeSessionId ?? null,
        plannerState: currentState,
        plannerStateUpdatedAt: currentUpdatedAt
      };
      setBlueprintHighlights(defaultBlueprintHighlights);
      return;
    }

    const nextHighlights: BlueprintHighlights = {
      header:
        previous.plannerState.status !== currentState.status ||
        previous.plannerState.summary !== currentState.summary ||
        previous.plannerState.title !== currentState.title ||
        previous.plannerStateUpdatedAt !== currentUpdatedAt,
      kpis:
        previous.plannerState.kpis.totalCost !== currentState.kpis.totalCost ||
        previous.plannerState.kpis.costPerAttendee !== currentState.kpis.costPerAttendee ||
        previous.plannerState.kpis.confidencePct !== currentState.kpis.confidencePct,
      inventory:
        JSON.stringify(previous.plannerState.spacePlan.inventory) !==
        JSON.stringify(currentState.spacePlan.inventory),
      timeline:
        JSON.stringify(previous.plannerState.timeline) !== JSON.stringify(currentState.timeline),
      budget: JSON.stringify(previous.plannerState.budget) !== JSON.stringify(currentState.budget)
    };

    const hasChanges = Object.values(nextHighlights).some(Boolean);
    if (hasChanges) {
      setBlueprintHighlights(nextHighlights);
      if (blueprintTimeoutRef.current) {
        window.clearTimeout(blueprintTimeoutRef.current);
      }
      blueprintTimeoutRef.current = window.setTimeout(() => {
        setBlueprintHighlights(defaultBlueprintHighlights);
        blueprintTimeoutRef.current = null;
      }, 700);
    }

    previousPlannerSnapshotRef.current = {
      sessionId: activeSessionId ?? null,
      plannerState: currentState,
      plannerStateUpdatedAt: currentUpdatedAt
    };
  }, [activeSession?.plannerState, activeSession?.plannerStateUpdatedAt, activeSessionId]);

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

  const handleOpenMatchItem = React.useCallback((item: MatchItem) => {
    console.log("Open match item:", item);
  }, []);

  const handleApproveLayout = React.useCallback(() => {
    if (!activeSessionId) return;
    const approvalTime = Date.now();

    updateSession(activeSessionId, (session) => {
      if (!session.plannerState || session.plannerState.status === "approved") {
        return session;
      }

      const approvalMessage: ChatMessage = {
        id: createMessageId("assistant-approval"),
        role: "assistant",
        text: "Layout approved. I locked the blueprint status and captured this as the active orchestration baseline.",
        status: "final",
        createdAt: approvalTime
      };

      return {
        ...session,
        plannerState: {
          ...session.plannerState,
          status: "approved"
        },
        plannerStateUpdatedAt: approvalTime,
        messages: [...session.messages, approvalMessage]
      };
    });
    setRightPanelView("blueprint");
  }, [activeSessionId, updateSession]);

  const renderRightPanel = (heightClass?: string) => {
    const showBlueprintPanel = rightPanelView === "blueprint";
    const panelHeightClass = heightClass ?? "h-[72vh] min-h-[520px]";
    const panelTransitionKey = `${activeSessionId ?? "none"}-${showBlueprintPanel ? "blueprint" : "matches"}-${hasPlannerState ? "state" : "blank"}-${isRightPanelLoading ? "loading" : "ready"}`;

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setRightPanelView("matches")}
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-brand-teal/35 ${
                rightPanelView === "matches"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={rightPanelView === "matches"}
              aria-label="Show matches panel"
            >
              Matches
            </button>
            <button
              type="button"
              onClick={() => setRightPanelView("blueprint")}
              className={`rounded-md px-3 py-2 font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-brand-teal/35 ${
                rightPanelView === "blueprint"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={rightPanelView === "blueprint"}
              aria-label="Show blueprint panel"
            >
              Blueprint
            </button>
          </div>
        </div>

        <div
          key={panelTransitionKey}
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out"
        >
          {showBlueprintPanel ? (
            activeSession?.plannerState ? (
              <BlueprintDetailPanel
                plannerState={activeSession.plannerState}
                plannerStateUpdatedAt={activeSession.plannerStateUpdatedAt}
                changedSections={blueprintHighlights}
                onApproveLayout={handleApproveLayout}
                heightClass={heightClass}
                isLoading={isRightPanelLoading}
              />
            ) : (
              <aside
                className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${panelHeightClass}`}
                aria-label="Blueprint panel"
              />
            )
          ) : (
            <RelevantMatchesPanel
              matches={matches}
              onTabChange={handleMatchTabChange}
              onOpenItem={handleOpenMatchItem}
              heightClass={heightClass}
              isLoading={isRightPanelLoading}
              loadingMatches={loadingMatches}
            />
          )}
        </div>
      </div>
    );
  };

  const sendMessage = React.useCallback(
    async (rawMessageText: string) => {
      const messageText = rawMessageText.trim();
      if (!messageText) return;
      if (isCreditsEnabled && !deduct(creditsConfig.creditsPerMessage)) return;

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
            plannerStateUpdatedAt: response.updatedPlannerState
              ? Date.now()
              : session.plannerStateUpdatedAt,
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
    [
      activeSession,
      createNewSession,
      creditsConfig.creditsPerMessage,
      deduct,
      isCreditsEnabled,
      updateSession
    ]
  );

  const handleSendCurrentDraft = React.useCallback(() => {
    void sendMessage(draftMessage);
  }, [draftMessage, sendMessage]);

  const handleSendQuickPrompt = React.useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage]
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
          onSend={handleSendCurrentDraft}
          onQuickPrompt={handleSendQuickPrompt}
          disableSend={!draftMessage.trim()}
          isCreditsEnabled={isCreditsEnabled}
          credits={credits}
          creditsPerMessage={creditsConfig.creditsPerMessage}
          onAddDemoCredits={() => add(50)}
          onResetCredits={resetToDefault}
        />
        {renderRightPanel()}
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
              onSend={handleSendCurrentDraft}
              onQuickPrompt={handleSendQuickPrompt}
              disableSend={!draftMessage.trim()}
              isCreditsEnabled={isCreditsEnabled}
              credits={credits}
              creditsPerMessage={creditsConfig.creditsPerMessage}
              onAddDemoCredits={() => add(50)}
              onResetCredits={resetToDefault}
            />
          </TabsContent>
          <TabsContent value="matches" className="mt-0">
            {renderRightPanel()}
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
              <Button size="sm" variant="outline" className="h-10 px-4" aria-label="Open planner panel">
                Open Panel
              </Button>
            </SheetTrigger>
          </div>
          <ChatPanel
            messages={messages}
            draftMessage={draftMessage}
            onDraftChange={setDraftMessage}
            onSend={handleSendCurrentDraft}
            onQuickPrompt={handleSendQuickPrompt}
            disableSend={!draftMessage.trim()}
            isCreditsEnabled={isCreditsEnabled}
            credits={credits}
            creditsPerMessage={creditsConfig.creditsPerMessage}
            onAddDemoCredits={() => add(50)}
            onResetCredits={resetToDefault}
            heightClass="h-[70vh] min-h-[460px]"
          />
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <SheetHeader className="border-b border-slate-200 px-5 py-4">
              <SheetTitle>Planner Panel</SheetTitle>
            </SheetHeader>
            <div className="flex h-[calc(100vh-4.5rem)] flex-col overflow-hidden p-4">
              {renderRightPanel("h-[calc(100vh-7.5rem)] min-h-0 rounded-xl")}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default OrganizerAIWorkspace;
