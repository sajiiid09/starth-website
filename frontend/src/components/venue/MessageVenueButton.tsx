
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatCircle, SpinnerGap } from '@phosphor-icons/react';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { ConversationParticipant } from '@/api/entities';
import { Message } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function MessageVenueButton({ venue, className = "", children }) {
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
        
        // Check if this conversation includes the venue owner
        const hasVenueOwner = otherParticipants.some(p => p.user_id === venue.owner_id && p.user_id !== currentUser.id);
        if (hasVenueOwner) {
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
          user_id: venue.owner_id
        });
        
        // Send initial message
        await Message.create({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          text: `Hi! I'm interested in booking ${venue.name} for an upcoming event. Could you please provide more details about availability and pricing?`
        });
        
        toast.success("Message sent! Redirecting to conversation...");
      } else {
        toast.success("Opening existing conversation...");
      }
      
      // Redirect to messages page
      window.location.href = createPageUrl("Messages");
      
    } catch (error) {
      console.error("Error creating message:", error);
      // User not logged in - trigger login flow with redirect
      if (error.message?.includes('401') || error.response?.status === 401) {
        // Store redirect info
        localStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
        // Redirect to login
        window.location.href = '/api/auth/login';
      }
    }
    
    setLoading(false);
  };

  return (
    <Button
      className={`${className} bg-gray-200 hover:bg-gray-300 text-gray-800`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <SpinnerGap className="w-4 h-4 animate-spin" />
      ) : (
        children || <ChatCircle className="w-4 h-4" />
      )}
    </Button>
  );
}
