import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/api/entities';
import { EventCollaborator } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { createPageUrl } from '@/utils';
import { Plus, Mail, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CollaborationTab({ eventId, eventTitle }) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'editor'
  });

  const loadCollaborators = useCallback(async () => {
    try {
      const collabList = await EventCollaborator.filter({ event_id: eventId });
      setCollaborators(collabList);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!newInvite.email) return;

    setInviting(true);
    try {
      const currentUser = await User.me();
      
      // Generate invitation token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Create collaborator record
      await EventCollaborator.create({
        event_id: eventId,
        inviter_id: currentUser.id,
        collaborator_email: newInvite.email,
        role: newInvite.role,
        invitation_token: token
      });

      // Send invitation email
      const inviteUrl = `${window.location.origin}${createPageUrl(`AcceptCollaboration?token=${token}`)}`;
      await SendEmail({
        to: newInvite.email,
        subject: `You've been invited to collaborate on "${eventTitle}"`,
        body: `
${currentUser.full_name || currentUser.email} has invited you to collaborate on the event "${eventTitle}".

Your role: ${newInvite.role.charAt(0).toUpperCase() + newInvite.role.slice(1)}

Click here to accept the invitation:
${inviteUrl}

If you don't have a Strathwell account, you'll be able to create one during the process.

Best regards,
The Strathwell Team
        `,
        from_name: 'Strathwell Events'
      });

      toast.success('Invitation sent successfully!');
      setNewInvite({ email: '', role: 'editor' });
      loadCollaborators();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
    setInviting(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800', 
      coordinator: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Invite New Collaborator */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Invite Collaborator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <Select
                value={newInvite.role}
                onValueChange={(value) => setNewInvite(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view event details</SelectItem>
                  <SelectItem value="editor">Editor - Can edit event details</SelectItem>
                  <SelectItem value="coordinator">Coordinator - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={inviting} className="bg-blue-600 hover:bg-blue-700">
              {inviting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Collaborators */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle>Team Members ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length > 0 ? (
            <div className="space-y-3">
              {collaborators.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{collab.collaborator_email}</div>
                    <div className="text-sm text-gray-500">
                      Invited {new Date(collab.created_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(collab.role)}>
                      {collab.role.charAt(0).toUpperCase() + collab.role.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(collab.status)}>
                      {collab.status.charAt(0).toUpperCase() + collab.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No collaborators yet. Invite team members to work together on this event.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}