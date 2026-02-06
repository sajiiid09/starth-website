import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ conversations, selectedConversationId, onSelectConversation }) {
  return (
    <div className="w-1/3 border-r h-full">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          <div className="space-y-2">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
                  selectedConversationId === convo.id 
                    ? "bg-blue-50" 
                    : "hover:bg-gray-50"
                )}
              >
                <Avatar className="w-10 h-10 border">
                  <AvatarFallback>{convo.otherParticipantName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900 truncate">{convo.otherParticipantName}</p>
                        {convo.lastMessageDate && (
                            <p className="text-xs text-gray-500 flex-shrink-0">
                                {formatDistanceToNow(new Date(convo.lastMessageDate), { addSuffix: true })}
                            </p>
                        )}
                    </div>
                  <p className="text-sm text-gray-600 truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
                <p className="text-center text-gray-500 pt-10">No conversations yet.</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}