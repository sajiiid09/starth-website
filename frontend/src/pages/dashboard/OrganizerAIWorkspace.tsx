import React from "react";
import {
  Coins,
  CaretDown,
  CircleDashed,
  SpinnerGap,
  Microphone,
  Paperclip,
  Sparkle
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import PlanPreviewCanvas from "@/components/planner/PlanPreviewCanvas";
import { Textarea } from "@/components/ui/textarea";
import OrganizerImmersiveShell from "@/features/immersive/OrganizerImmersiveShell";
import ZeroStateLanding from "@/features/immersive/ZeroStateLanding";
import {
  StarterTemplate,
  starterTemplates
} from "@/features/immersive/data/starterTemplates";
import { useCredits } from "@/features/planner/credits/useCredits";
import { getCreditsConfig } from "@/features/planner/credits/storage";
import { plannerService } from "@/features/planner/services/plannerService";
import { usePlannerSessions } from "@/features/planner/PlannerSessionsContext";
import { PLANNER_SESSIONS_STORAGE_KEY } from "@/features/planner/utils/storage";
import { ChatMessage, PlannerState } from "@/features/planner/types";

const quickPrompts = [
  "Plan a 120-guest product launch in SF for March, budget $25k.",
  "Build a premium timeline for a two-day executive summit in Austin.",
  "Find a venue + catering direction for a 90-person networking night.",
  "Create a staffing and vendor checklist for a spring brand activation."
];

const createTemplatePlannerState = (template: StarterTemplate): PlannerState => {
  if (template.id === "executive-summit") {
    return {
      blueprintId: `template-${template.id}`,
      title: "Executive Summit Blueprint",
      summary: "Structured two-day summit with keynote depth, breakouts, and concierge hospitality.",
      kpis: {
        totalCost: 42000,
        costPerAttendee: 280,
        confidencePct: 82
      },
      spacePlan: {
        beforeLabel: "Open ballroom",
        afterLabel: "Summit zones with breakout wings",
        inventory: {
          chairs: 180,
          tables: 30,
          stage: 2,
          buffet: 5
        }
      },
      timeline: [
        {
          time: "T-6 weeks",
          title: "Confirm speaker blocks",
          notes: "Finalize keynote and panel sequencing."
        },
        {
          time: "T-2 weeks",
          title: "Production rehearsal",
          notes: "Dry-run AV, stage transitions, and room resets."
        },
        {
          time: "Event day",
          title: "Operate summit flow",
          notes: "Coordinate welcome, sessions, and closing dinner cadence."
        }
      ],
      budget: {
        total: 42000,
        breakdown: [
          { label: "Venue", pct: 36 },
          { label: "Food + Beverage", pct: 24 },
          { label: "Production", pct: 20 },
          { label: "Staffing", pct: 14 },
          { label: "Contingency", pct: 6 }
        ],
        tradeoffNote: "Protect keynote production quality before optimizing decor layers."
      },
      status: "ready_for_review"
    };
  }

  if (template.id === "brand-evening") {
    return {
      blueprintId: `template-${template.id}`,
      title: "Brand Evening Blueprint",
      summary: "Atmospheric evening program designed for storytelling and high-touch networking.",
      kpis: {
        totalCost: 34000,
        costPerAttendee: 227,
        confidencePct: 80
      },
      spacePlan: {
        beforeLabel: "Raw venue floor",
        afterLabel: "Arrival lounge + stage + experience pods",
        inventory: {
          chairs: 140,
          tables: 24,
          stage: 1,
          buffet: 4
        }
      },
      timeline: [
        {
          time: "T-5 weeks",
          title: "Lock guest journey script",
          notes: "Confirm arrival, reveal, and networking beats."
        },
        {
          time: "T-10 days",
          title: "Finalize visual production",
          notes: "Approve run-of-show visuals, lighting, and audio cues."
        },
        {
          time: "Event day",
          title: "Host branded experience",
          notes: "Run transitions between showcase moments and close."
        }
      ],
      budget: {
        total: 34000,
        breakdown: [
          { label: "Venue", pct: 34 },
          { label: "Food + Beverage", pct: 26 },
          { label: "Production", pct: 18 },
          { label: "Staffing", pct: 15 },
          { label: "Contingency", pct: 7 }
        ],
        tradeoffNote: "If needed, trim decorative accents before reducing guest hospitality."
      },
      status: "ready_for_review"
    };
  }

  return {
    blueprintId: `template-${template.id}`,
    title: "Product Launch Blueprint",
    summary: "Launch-first orchestration with timed reveals, demo moments, and conversion checkpoints.",
    kpis: {
      totalCost: 30000,
      costPerAttendee: 214,
      confidencePct: 84
    },
    spacePlan: {
      beforeLabel: "Open event floor",
      afterLabel: "Launch stage + demo zones + networking area",
      inventory: {
        chairs: 160,
        tables: 26,
        stage: 1,
        buffet: 4
      }
    },
    timeline: [
      {
        time: "T-4 weeks",
        title: "Finalize launch narrative",
        notes: "Align messaging, keynote, and feature reveal sequence."
      },
      {
        time: "T-1 week",
        title: "Full run-through",
        notes: "Test stage cues, demos, and guest check-in flows."
      },
      {
        time: "Event day",
        title: "Execute launch experience",
        notes: "Run arrival to close with live conversion checkpoints."
      }
    ],
    budget: {
      total: 30000,
      breakdown: [
        { label: "Venue", pct: 37 },
        { label: "Food + Beverage", pct: 23 },
        { label: "Production", pct: 22 },
        { label: "Staffing", pct: 12 },
        { label: "Contingency", pct: 6 }
      ],
      tradeoffNote: "Preserve launch demo quality before reducing hospitality depth."
    },
    status: "ready_for_review"
  };
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
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex items-start gap-3 duration-300 ease-out"
      >
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-teal to-brand-blue shadow-sm">
          <Sparkle weight="fill" className="h-4 w-4 text-white" />
        </div>
        <div
          className={cn(
            "max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-relaxed",
            isTransient
              ? "bg-slate-50 border border-slate-200 text-slate-500 italic"
              : "bg-brand-light/40 border border-brand-teal/5 text-slate-700 shadow-sm"
          )}
        >
          <p className={cn("whitespace-pre-wrap break-words", isTransient ? "animate-pulse" : "")}>
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
        className="animate-in fade-in-0 slide-in-from-bottom-2 flex justify-end duration-300 ease-out"
      >
        <div className="flex max-w-[88%] flex-col items-end gap-1.5">
          <div className="rounded-[20px] bg-brand-teal px-4 py-3 text-sm text-white shadow-md shadow-brand-teal/10">
            <p className="whitespace-pre-wrap break-words leading-relaxed">
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
            <Sparkle className="h-4 w-4 text-brand-teal" />
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
  heightClass = "h-full min-h-0"
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
              <CircleDashed className="mr-1 h-3 w-3" />
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
              <CaretDown className="ml-1 h-3.5 w-3.5" />
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
                <Microphone className="h-4 w-4" />
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
  const [draftMessage, setDraftMessage] = React.useState("");
  const creditsConfig = React.useMemo(() => getCreditsConfig(), []);
  const { credits, deduct, add, resetToDefault, isEnabled: isCreditsEnabled } = useCredits();
  const { isReady, activeSession, setActiveSession, createNewSession, updateSession } =
    usePlannerSessions();
  const timeoutRefs = React.useRef<number[]>([]);
  const hasBootstrappedFreshSessionRef = React.useRef(false);

  const messages = activeSession?.messages ?? [];
  const hasBlueprint = Boolean(activeSession?.plannerState);
  const isZeroState = !activeSession || (messages.length === 0 && !hasBlueprint);

  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timer) => window.clearTimeout(timer));
      timeoutRefs.current = [];
    };
  }, []);

  React.useEffect(() => {
    if (!isReady || hasBootstrappedFreshSessionRef.current) {
      return;
    }

    const hasPersistedPlannerState = Boolean(
      window.localStorage.getItem(PLANNER_SESSIONS_STORAGE_KEY)
    );
    const seededSessionHasContent = Boolean(
      activeSession && (activeSession.messages.length > 0 || activeSession.plannerState)
    );

    if (!hasPersistedPlannerState && seededSessionHasContent) {
      createNewSession();
    }

    hasBootstrappedFreshSessionRef.current = true;
  }, [activeSession, createNewSession, isReady]);

  const renderCanvasPanel = React.useCallback(
    () => <PlanPreviewCanvas planData={activeSession?.plannerState ?? null} />,
    [activeSession?.plannerState]
  );

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
          const sessionPatch = response.updatedSession ?? {};
          const nextPlannerState =
            response.updatedPlannerState ?? sessionPatch.plannerState ?? session.plannerState;
          const plannerStateDidChange =
            response.updatedPlannerState !== undefined || sessionPatch.plannerState !== undefined;

          return {
            ...session,
            ...sessionPatch,
            messages: hasReplaced ? replaced : [...replaced, response.assistantMessage],
            plannerState: nextPlannerState,
            plannerStateUpdatedAt: plannerStateDidChange
              ? sessionPatch.plannerStateUpdatedAt ?? Date.now()
              : sessionPatch.plannerStateUpdatedAt ?? session.plannerStateUpdatedAt
          };
        });

        if (response.deferredGeneration) {
          const generationTimer = window.setTimeout(() => {
            updateSession(targetSessionId, (session) => {
              const generationAssistantMessage: ChatMessage = {
                id: createMessageId("assistant-generated"),
                role: "assistant",
                text: response.deferredGeneration?.assistantText ?? "Blueprint generated.",
                status: "final",
                createdAt: Date.now()
              };
              const generationPatch = response.deferredGeneration?.sessionUpdate ?? {};

              return {
                ...session,
                ...generationPatch,
                plannerState: response.deferredGeneration?.plannerState ?? session.plannerState,
                plannerStateUpdatedAt:
                  generationPatch.plannerStateUpdatedAt ?? Date.now(),
                messages: [...session.messages, generationAssistantMessage]
              };
            });
          }, response.deferredGeneration.delayMs);

          timeoutRefs.current.push(generationTimer);
        }
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

  const handleZeroStatePromptSubmit = React.useCallback(
    (text: string) => {
      void sendMessage(text);
    },
    [sendMessage]
  );

  const handleZeroStateTemplateSelect = React.useCallback(
    (templateId: string) => {
      const template = starterTemplates.find((entry) => entry.id === templateId);
      if (!template) return;

      const sessionSnapshot = activeSession ?? createNewSession();
      const targetSessionId = sessionSnapshot.id;
      const now = Date.now();
      const templatePlannerState = createTemplatePlannerState(template);

      const assistantMessage: ChatMessage = {
        id: createMessageId("assistant-template"),
        role: "assistant",
        text: `Loaded the ${template.title}. What would you like to change?`,
        status: "final",
        createdAt: now
      };

      updateSession(targetSessionId, (session) => ({
        ...session,
        title: template.title,
        mode: "template",
        viewMode: "split",
        briefStatus: "canvas_open",
        draftBrief: undefined,
        artifact: {
          id: templatePlannerState.blueprintId,
          title: templatePlannerState.title,
          createdAt: now
        },
        lastAskedField: undefined,
        messages: [...session.messages, assistantMessage],
        plannerState: templatePlannerState,
        plannerStateUpdatedAt: now
      }));
      setActiveSession(targetSessionId);
      setDraftMessage("");
    },
    [activeSession, createNewSession, setActiveSession, updateSession]
  );

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SpinnerGap className="h-6 w-6 animate-spin text-brand-dark/50" />
      </div>
    );
  }

  if (isZeroState) {
    return (
      <div className="mx-auto w-full max-w-[1600px]">
        <ZeroStateLanding
          onSubmitPrompt={handleZeroStatePromptSubmit}
          templates={starterTemplates}
          onSelectTemplate={handleZeroStateTemplateSelect}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <OrganizerImmersiveShell
        showCanvas
        topBar={
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-brand-light px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
              Strathwell AI
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">Immersive Planner Workspace</h1>
              <Badge variant="secondary" className="border border-slate-200 bg-white text-slate-700">
                <Sparkle className="mr-1 h-3.5 w-3.5 text-brand-teal" />
                {hasBlueprint ? "Co-pilot + Canvas shell active" : "Co-pilot shell active"}
              </Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {hasBlueprint
                ? "Persistent co-pilot chat sits alongside a live canvas preview with independent scrolling regions."
                : "The canvas viewport is mounted in read-only mode and remains blank until a generated plan is available."}
            </p>
          </section>
        }
        copilot={
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
            heightClass="h-full min-h-0 rounded-none border-0 shadow-none"
          />
        }
        canvas={renderCanvasPanel()}
      />
    </div>
  );
};

export default OrganizerAIWorkspace;
