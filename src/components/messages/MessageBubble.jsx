import React from 'react';
import { cn } from "@/lib/utils";

export default function MessageBubble({ message, currentUser }) {
    const isUser = message.sender_id === currentUser?.id;
    
    return (
        <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="h-4 w-4 rounded-full bg-gray-400" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.text && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                    )}>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
}