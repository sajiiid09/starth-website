import React, { useState, useRef, useEffect } from "react";
import { 
  ChatCircleDots, 
  PaperPlaneTilt, 
  DotsThree, 
  Check, 
  Checks,
  Image as ImageIcon,
  Paperclip,
  Smiley,
  MagnifyingGlass,
  ArrowLeft
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Mock conversation data
const mockConversations = [
  {
    id: "1",
    name: "Venue Collective",
    avatar: "/images/marketplace/venue-hall.webp",
    lastMessage: "We can hold your date and share pricing today. Let me know if you'd like to schedule a tour!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: 2,
    online: true
  },
  {
    id: "2", 
    name: "Bloom & Beam Florals",
    avatar: "/images/marketplace/vendor-floral.webp",
    lastMessage: "Moodboard draft is ready for review.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unread: 0,
    online: false
  },
  {
    id: "3",
    name: "Elite Catering Co",
    avatar: "/images/marketplace/vendor-catering.webp", 
    lastMessage: "The tasting menu has been confirmed for next week.",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    unread: 0,
    online: true
  },
  {
    id: "4",
    name: "Luxe Photography",
    avatar: "/images/marketplace/vendor-photo.webp",
    lastMessage: "Looking forward to capturing your special day!",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    unread: 1,
    online: false
  }
];

const mockMessages = [
  {
    id: "m1",
    senderId: "vendor",
    text: "Hi! Thanks for reaching out about your event. I'd love to help you find the perfect space.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    status: "read"
  },
  {
    id: "m2",
    senderId: "user",
    text: "Thank you! We're looking for a venue that can accommodate around 150 guests for a corporate gala in December.",
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    status: "read"
  },
  {
    id: "m3",
    senderId: "vendor",
    text: "That sounds wonderful! We have several options that would work perfectly for that size. Our Grand Hall can accommodate up to 200 guests with flexible layouts.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "read"
  },
  {
    id: "m4",
    senderId: "vendor",
    text: "We can hold your date and share pricing today. Let me know if you'd like to schedule a tour!",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    status: "read"
  }
];

const UserMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: `m${messages.length + 1}`,
      senderId: "user",
      text: newMessage.trim(),
      timestamp: new Date(),
      status: "sent" as const
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response
      setMessages(prev => [...prev, {
        id: `m${prev.length + 1}`,
        senderId: "vendor",
        text: "Thanks for your message! I'll get back to you shortly with more details.",
        timestamp: new Date(),
        status: "read"
      }]);
    }, 2000);
  };

  const handleSelectConversation = (conversation: typeof mockConversations[0]) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-white/50" />;
      case "delivered":
        return <Checks className="h-3 w-3 text-white/50" />;
      case "read":
        return <Checks className="h-3 w-3 text-brand-teal" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50/50 md:h-[calc(100vh-2rem)]">
      {/* Header - Mobile */}
      <div className="border-b border-brand-dark/10 bg-white p-4 md:hidden">
        {showMobileChat ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMobileChat(false)}
              className="rounded-lg p-1.5 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={selectedConversation.avatar} />
              <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-brand-dark">{selectedConversation.name}</p>
              {selectedConversation.online && (
                <p className="text-xs text-green-600">Online</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-brand-teal">
              <ChatCircleDots weight="fill" className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Inbox</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-brand-dark">Messages</h1>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className={cn(
          "w-full flex-col border-r border-brand-dark/10 bg-white md:flex md:w-80 lg:w-96",
          showMobileChat ? "hidden" : "flex"
        )}>
          {/* Desktop Header */}
          <div className="hidden border-b border-brand-dark/5 p-4 md:block">
            <div className="flex items-center gap-2 text-brand-teal">
              <ChatCircleDots weight="fill" className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-widest">Inbox</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-brand-dark">Messages</h1>
          </div>

          {/* Search */}
          <div className="border-b border-brand-dark/5 p-3">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
              <Input 
                placeholder="Search conversations..."
                className="h-10 rounded-xl border-brand-dark/10 bg-gray-50 pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-brand-dark/5 p-4 text-left transition-colors hover:bg-gray-50",
                  selectedConversation?.id === conversation.id && "bg-brand-teal/5"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback className="bg-brand-teal/10 text-brand-teal">
                      {conversation.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-brand-dark">{conversation.name}</p>
                    <span className="flex-shrink-0 text-xs text-brand-dark/50">
                      {formatDistanceToNow(conversation.timestamp, { addSuffix: false })}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="truncate text-sm text-brand-dark/60">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <Badge className="h-5 min-w-[20px] flex-shrink-0 rounded-full bg-brand-teal px-1.5 text-xs font-medium">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex-col bg-gray-50",
          showMobileChat ? "flex" : "hidden md:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Chat Header - Desktop */}
              <div className="hidden items-center justify-between border-b border-brand-dark/10 bg-white px-6 py-4 md:flex">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-brand-dark">{selectedConversation.name}</p>
                    {selectedConversation.online ? (
                      <p className="text-xs text-green-600">Online now</p>
                    ) : (
                      <p className="text-xs text-brand-dark/50">
                        Last seen {formatDistanceToNow(selectedConversation.timestamp, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <DotsThree weight="bold" className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-3xl space-y-4">
                  {/* Date separator */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-brand-dark/10" />
                    <span className="text-xs font-medium text-brand-dark/40">Today</span>
                    <div className="h-px flex-1 bg-brand-dark/10" />
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.senderId === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      {message.senderId !== "user" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={selectedConversation.avatar} />
                          <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-3 md:max-w-[65%]",
                          message.senderId === "user"
                            ? "rounded-br-md bg-brand-teal text-white"
                            : "rounded-bl-md bg-white shadow-sm"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <div className={cn(
                          "mt-1.5 flex items-center gap-1.5 text-[10px]",
                          message.senderId === "user" ? "justify-end text-white/70" : "text-brand-dark/40"
                        )}>
                          <span>
                            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                          </span>
                          {message.senderId === "user" && getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConversation.avatar} />
                        <AvatarFallback>{selectedConversation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-dark/30" style={{ animationDelay: "0ms" }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-dark/30" style={{ animationDelay: "150ms" }} />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-brand-dark/30" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-brand-dark/10 bg-white p-4">
                <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
                  <div className="flex items-end gap-2">
                    <div className="hidden gap-1 sm:flex">
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-brand-dark/50 hover:text-brand-dark">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-brand-dark/50 hover:text-brand-dark">
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="h-11 rounded-xl border-brand-dark/10 bg-gray-50 pr-10"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-brand-dark/50 hover:text-brand-dark"
                      >
                        <Smiley className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="h-11 w-11 rounded-xl bg-brand-teal p-0 hover:bg-brand-teal/90 disabled:opacity-50"
                    >
                      <PaperPlaneTilt weight="fill" className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dark/5">
                <ChatCircleDots className="h-8 w-8 text-brand-dark/30" />
              </div>
              <h3 className="mt-4 font-semibold text-brand-dark">No conversation selected</h3>
              <p className="mt-1 text-sm text-brand-dark/60">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMessages;
