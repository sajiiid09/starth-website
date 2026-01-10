import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const messages = [
  {
    name: "Venue Collective",
    preview: "We can hold your date and share pricing today.",
    time: "2h ago"
  },
  {
    name: "Bloom & Beam",
    preview: "Moodboard draft is ready for review.",
    time: "Yesterday"
  }
];

const UserMessages: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
          Messages
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Inbox</h1>
        <p className="mt-2 text-sm text-gray-600">
          Stay in sync with your vendors and collaborators.
        </p>
      </div>

      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.name} className="border-none shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-base font-semibold text-gray-900">{message.name}</p>
                <p className="text-sm text-gray-500">{message.preview}</p>
              </div>
              <span className="text-xs text-gray-400">{message.time}</span>
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="p-6 text-center text-sm text-gray-500">
              No new messages.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserMessages;
