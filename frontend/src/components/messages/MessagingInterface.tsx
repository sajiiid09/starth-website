import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { ConversationParticipant } from '@/api/entities';
import { Message } from '@/api/entities';
import { SpinnerGap } from '@phosphor-icons/react';
import ConversationList from './ConversationList';
import MessageWindow from './MessageWindow';

export default function MessagingInterface() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Fetch all users to create a name map
        const users = await User.list();
        const userMap = users.reduce((acc, u) => {
          acc[u.id] = u.full_name || u.email;
          return acc;
        }, {});
        setAllUsers(userMap);

        // Fetch conversations for the current user
        const participantRecords = await ConversationParticipant.filter({ user_id: user.id });
        const conversationIds = participantRecords.map(p => p.conversation_id);

        if (conversationIds.length > 0) {
          const conversationRecords = await Conversation.filter({ id: { $in: conversationIds } });
          const allParticipantRecords = await ConversationParticipant.filter({ conversation_id: { $in: conversationIds } });
          const allMessages = await Message.filter({ conversation_id: { $in: conversationIds } }, "-created_date", 100);

          const populatedConversations = conversationRecords.map(convo => {
            const participants = allParticipantRecords.filter(p => p.conversation_id === convo.id);
            const otherParticipant = participants.find(p => p.user_id !== user.id);
            const lastMessage = allMessages.find(m => m.conversation_id === convo.id);
            
            return {
              ...convo,
              participants,
              otherParticipantName: otherParticipant ? userMap[otherParticipant.user_id] || 'Unknown User' : 'Unknown User',
              lastMessage: lastMessage?.text || "No messages yet",
              lastMessageDate: lastMessage?.created_date
            };
          }).sort((a,b) => Number(new Date(b.lastMessageDate)) - Number(new Date(a.lastMessageDate)));

          setConversations(populatedConversations);
        }
      } catch (error) {
        console.error("Error loading messaging data:", error);
      }
      setLoading(false);
    };

    initialize();
  }, []);
  
  const handleSelectConversation = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation);
    const conversationMessages = await Message.filter({ conversation_id: conversationId }, "created_date");
    setMessages(conversationMessages);
  };

  const handleSendMessage = async (text) => {
    if (!selectedConversation || !currentUser || isSending) return;
    
    setIsSending(true);
    try {
      const newMessage = await Message.create({
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        text: text,
      });
      setMessages(prev => [...prev, newMessage]);
    } catch(error) {
      console.error("Failed to send message:", error);
    }
    setIsSending(false);
  };


  if (loading) {
    return <div className="flex items-center justify-center h-full"><SpinnerGap className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="flex h-full">
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversation?.id}
        onSelectConversation={handleSelectConversation}
      />
      <MessageWindow
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        isSending={isSending}
        currentUser={currentUser}
      />
    </div>
  );
}