
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { ConversationParticipant } from '@/api/entities';
import { Message } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function MessageServiceButton({ service, className, children }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    
    try {
      // Check if user is logged in
      const currentUser = await User.me();
      
      // Check if conversation already exists
      const existingParticipants = await ConversationParticipant.filter({ 
        user_id: currentUser.id 
      });
      
      let existingConversation = null;
      for (const participant of existingParticipants) {
        const otherParticipants = await ConversationParticipant.filter({ 
          conversation_id: participant.conversation_id 
        });
        
        // Check if this conversation includes the service provider
        const hasServiceProvider = otherParticipants.some(p => p.user_id === service.provider_id && p.user_id !== currentUser.id);
        if (hasServiceProvider) {
          existingConversation = participant.conversation_id;
          break;
        }
      }
      
      let conversationId = existingConversation;
      
      // Create new conversation if none exists
      if (!conversationId) {
        const conversation = await Conversation.create({});
        conversationId = conversation.id;
        
        // Add participants
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: currentUser.id
        });
        
        await ConversationParticipant.create({
          conversation_id: conversationId,
          user_id: service.provider_id
        });
        
        // Send initial message
        await Message.create({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          text: `Hi! I'm interested in your ${service.category} services for an upcoming event. Could you please provide more details about your offerings and pricing?`
        });
        
        toast.success("Message sent! Redirecting to conversation...");
      } else {
        toast.success("Opening existing conversation...");
      }
      
      // Redirect to messages page
      window.location.href = createPageUrl("Messages");
      
    } catch (error) {
      console.error("Error creating message:", error);
      if (error.message?.includes('401') || error.response?.status === 401) {
        // Store redirect info
        localStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
        // Redirect to login
        window.location.href = '/api/auth/login';
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    }
    
    setLoading(false);
  };

  return (
    <Button
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <MessageSquare className="w-4 h-4 mr-2" />
      )}
      {children || "Message"}
    </Button>
  );
}
