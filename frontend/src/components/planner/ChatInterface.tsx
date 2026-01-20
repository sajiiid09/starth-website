
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react"; // Loader2 is removed from here as it's replaced by animated dots
import { cn } from "@/lib/utils";

// Simple message bubble component for the chat
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  onSendMessage: () => void;
  onKeyPress: (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  showComposer?: boolean;
  showPrompts?: boolean;
  className?: string;
  cardClassName?: string;
  heightClassName?: string;
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex gap-3 mb-4 message-bubble ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-teal">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] p-3 rounded-2xl ${
        isUser 
          ? 'bg-brand-teal text-white' 
          : 'bg-brand-light/80 text-brand-dark'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-dark/10">
          <span className="text-xs font-semibold text-brand-dark">You</span>
        </div>
      )}
    </div>
  );
};

export default function ChatInterface({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  onSendMessage,
  onKeyPress,
  showComposer = true,
  showPrompts = true,
  className,
  cardClassName,
  heightClassName = "h-[520px]"
}: ChatInterfaceProps) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={cn("space-y-6", className)}>
      <style>{`
        @keyframes slide-in-fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message-bubble {
          animation: slide-in-fade-in 0.3s ease-out forwards;
        }

        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
        }
        .typing-dot { animation: typing-dot 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
      <Card
        className={cn(
          "flex flex-col rounded-3xl border border-white/50 bg-white/85 shadow-card",
          heightClassName,
          cardClassName
        )}
      >
        <CardHeader className="flex-shrink-0 border-b border-brand-dark/10 p-6">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-teal">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold text-brand-dark">Strathwell AI</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-brand-teal/80" />
                <span className="text-xs text-brand-dark/60">Ready to plan</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start message-bubble">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-brand-cream/60 p-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-dark/50 typing-dot"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-dark/50 typing-dot"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-dark/50 typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {showComposer && (
          <div className="flex-shrink-0 border-t border-brand-dark/10 p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your event (e.g., 'Plan a 100-person wedding in NYC for June, budget $30k')"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={onKeyPress}
                disabled={isLoading}
                className="h-12 flex-1 text-base"
              />
              <Button
                onClick={onSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-12 w-12 bg-brand-teal text-white hover:bg-brand-dark"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Sample Prompts */}
      {showPrompts && (
        <Card className="rounded-3xl border border-white/50 bg-white/85 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-brand-dark">Try These Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Plan a 120-guest product launch in San Francisco for March, budget $25k",
              "Organize a 50-person corporate retreat in Boston for Q2, budget $15k",
              "Design a 200-guest wedding reception in NYC for September, budget $45k"
            ].map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputValue(prompt)}
                className="w-full rounded-lg bg-brand-cream/40 p-3 text-left text-sm text-brand-dark/70 transition hover:bg-brand-cream/60"
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
