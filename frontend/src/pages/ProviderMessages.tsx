import React from 'react';
import RoleGuard from '../components/auth/RoleGuard';
import ProviderPortalLayout from '../components/provider/ProviderPortalLayout';
import MessagingInterface from '../components/messages/MessagingInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ProviderMessagesPage() {
  return (
    <RoleGuard requiredRole="service_provider">
      <ProviderPortalLayout>
        <div className="p-6 h-full">
          <Card className="border-none shadow-lg h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span>Inbox</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <MessagingInterface />
            </CardContent>
          </Card>
        </div>
      </ProviderPortalLayout>
    </RoleGuard>
  );
}