
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react"; // Loader2 is removed from here as it's replaced by animated dots

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
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex gap-3 mb-4 message-bubble ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] p-3 rounded-2xl ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-gray-700 font-semibold text-xs">You</span>
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
  showPrompts = true
}: ChatInterfaceProps) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="space-y-6">
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
      <Card className="border-none shadow-lg h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b border-gray-100 p-6">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Strathwell AI</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Ready to plan</span>
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {showComposer && (
          <div className="flex-shrink-0 p-6 border-t border-gray-100">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your event (e.g., 'Plan a 100-person wedding in NYC for June, budget $30k')"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={onKeyPress}
                disabled={isLoading}
                className="flex-1 h-12 text-base"
              />
              <Button
                onClick={onSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Sample Prompts */}
      {showPrompts && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Try These Examples</CardTitle>
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
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 strathwell-transition text-sm"
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
