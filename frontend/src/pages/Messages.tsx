import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { ConversationParticipant } from '@/api/entities';
import { Message } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChatCircle, PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Fetch all users to create a name map
      const users = await User.list();
      const userMap = users.reduce((acc, u) => {
        acc[u.id] = u.full_name || u.email || 'User';
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
            otherParticipantName: otherParticipant ? (userMap[otherParticipant.user_id] || 'User') : 'User',
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
  
  const handleSelectConversation = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    setSelectedConversation(conversation);
    const conversationMessages = await Message.filter({ conversation_id: conversationId }, "created_date");
    setMessages(conversationMessages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedConversation || !currentUser || !newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const message = await Message.create({
        conversation_id: selectedConversation.id,
        sender_id: currentUser.id,
        text: newMessage.trim(),
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch(error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerGap className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with venues and service providers</p>
        </div>

        <Card className="border-none shadow-lg h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ChatCircle className="w-5 h-5" />
                Conversations ({conversations.length})
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {conversations.map(convo => (
                  <button
                    key={convo.id}
                    onClick={() => handleSelectConversation(convo.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
                      selectedConversation?.id === convo.id 
                        ? "bg-blue-50 border-blue-200 border" 
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
                  <div className="text-center py-8 text-gray-500">
                    <ChatCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start messaging venues and services to see conversations here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle>{selectedConversation.otherParticipantName}</CardTitle>
                </CardHeader>
                <div className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.sender_id === currentUser.id ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.sender_id !== currentUser.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {selectedConversation.otherParticipantName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-3 py-2",
                              message.sender_id === currentUser.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            )}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              message.sender_id === currentUser.id
                                ? "text-blue-100"
                                : "text-gray-500"
                            )}>
                              {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={sending || !newMessage.trim()}>
                        {sending ? (
                          <SpinnerGap className="w-4 h-4 animate-spin" />
                        ) : (
                          <PaperPlaneTilt className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChatCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}