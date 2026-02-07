import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PaperPlaneTilt, SpinnerGap, Info, Sparkle } from '@phosphor-icons/react';
import MessageBubble from './MessageBubble';
import { InvokeLLM } from '@/api/integrations';
import { toast } from "sonner";

export default function MessageWindow({ conversation, messages, onSendMessage, isSending, currentUser }) {
  const [newMessage, setNewMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleGenerateReply = async () => {
    if (!conversation || isGenerating) return;

    setIsGenerating(true);
    toast.info("Generating AI suggestion...");
    try {
        const messageHistory = messages.slice(-5).map(m => {
            const sender = m.sender_id === currentUser.id ? 'Venue Owner' : 'Client';
            return `${sender}: ${m.text}`;
        }).join('\n');

        const prompt = `You are a helpful and professional venue manager. A client is messaging you. Based on the following conversation history, draft a polite and helpful response. Keep it concise.
---
Conversation History:
${messageHistory}
---
Draft a response as the Venue Owner:`;

        const result = await InvokeLLM({ prompt });
        if (typeof result === 'string') {
            setNewMessage(result);
            toast.success("AI suggestion generated!");
        } else {
            throw new Error("Invalid response from AI");
        }
    } catch (error) {
        console.error("AI reply generation failed:", error);
        toast.error("Could not generate AI suggestion.");
    }
    setIsGenerating(false);
  };

  if (!conversation) {
    return (
      <div className="w-2/3 h-full flex flex-col items-center justify-center bg-gray-50 text-center">
        <Info className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Select a Conversation</h3>
        <p className="text-gray-500">Choose a conversation from the left to view messages.</p>
      </div>
    );
  }

  return (
    <div className="w-2/3 h-full flex flex-col">
      <div className="border-b p-4">
        <h3 className="text-lg font-semibold">{conversation.otherParticipantName}</h3>
        {/* Can add more details here later, like event name */}
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
            {messages.map(msg => <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />)}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-white">
        <div className="relative">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="pr-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateReply}
                disabled={isGenerating || messages.length === 0}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
             >
                {isGenerating ? <SpinnerGap className="w-4 h-4 animate-spin"/> : <Sparkle className="w-4 h-4" />}
                <span className="ml-1 hidden sm:inline">AI Reply</span>
            </Button>
            <Button size="icon" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? <SpinnerGap className="w-4 h-4 animate-spin"/> : <PaperPlaneTilt className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}