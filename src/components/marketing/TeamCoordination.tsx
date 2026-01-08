
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SendEmail } from '@/api/integrations';
import { User } from '@/api/entities';
import { format } from 'date-fns';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Video,
  Mail,
  Clock,
  Plus,
  Send,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamCoordination({ eventId, event, collaborators, onRefresh }) {
  const [meetings, setMeetings] = useState([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: null,
    time: '',
    type: 'google-meet',
    attendees: []
  });
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadMeetings = useCallback(() => {
    const savedMeetings = localStorage.getItem(`meetings_${eventId}`);
    if (savedMeetings) {
      setMeetings(JSON.parse(savedMeetings));
    }
  }, [eventId]);

  useEffect(() => {
    loadCurrentUser();
    loadMeetings();
  }, [loadMeetings]);

  const saveMeetings = (updatedMeetings) => {
    setMeetings(updatedMeetings);
    localStorage.setItem(`meetings_${eventId}`, JSON.stringify(updatedMeetings));
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const meetingDateTime = new Date(newMeeting.date);
    const [hours, minutes] = newMeeting.time.split(':');
    meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

    const meeting = {
      id: Date.now(),
      title: newMeeting.title,
      description: newMeeting.description,
      datetime: meetingDateTime.toISOString(),
      type: newMeeting.type,
      attendees: newMeeting.attendees,
      created_by: currentUser?.email,
      event_title: event?.title
    };

    const updatedMeetings = [...meetings, meeting];
    saveMeetings(updatedMeetings);

    // Send email invites to collaborators
    try {
      const attendeeEmails = newMeeting.attendees.length > 0 
        ? newMeeting.attendees 
        : collaborators.map(c => c.collaborator_email);

      const meetingUrl = generateMeetingUrl(meeting);
      const emailBody = `
You're invited to a team meeting for "${event?.title}"

Meeting: ${meeting.title}
Date: ${format(meetingDateTime, 'PPP')} at ${format(meetingDateTime, 'p')}
${meeting.description ? `\nDescription: ${meeting.description}` : ''}

Join the meeting: ${meetingUrl}

Meeting organized by ${currentUser?.full_name || currentUser?.email}
      `;

      for (const email of attendeeEmails) {
        await SendEmail({
          to: email,
          subject: `Team Meeting Invitation: ${meeting.title}`,
          body: emailBody,
          from_name: 'Strathwell Events'
        });
      }

      toast.success('Meeting scheduled and invitations sent!');
    } catch (error) {
      console.error('Error sending invites:', error);
      toast.error('Meeting scheduled but failed to send some invitations');
    }

    // Reset form
    setNewMeeting({
      title: '',
      description: '',
      date: null,
      time: '',
      type: 'google-meet',
      attendees: []
    });
    setShowMeetingForm(false);
  };

  const generateMeetingUrl = (meeting) => {
    const startTime = new Date(meeting.datetime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

    if (meeting.type === 'google-meet') {
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.title)}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(meeting.description || '')}&location=Google+Meet`;
      return googleCalendarUrl;
    }
    return 'Meeting link will be provided';
  };

  const openGoogleCalendar = () => {
    const calendarUrl = `https://calendar.google.com/calendar/u/0/r`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Team Coordination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setShowMeetingForm(true)}
              className="bg-green-600 hover:bg-green-700 h-16"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Schedule Meeting</div>
              </div>
            </Button>
            
            <Button 
              onClick={openGoogleCalendar}
              variant="outline" 
              className="h-16"
            >
              <div className="text-center">
                <CalendarIcon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">View Calendar</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Mail className="w-6 h-6 mx-auto mb-1" />
                <div className="text-sm">Email Team</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Form */}
      {showMeetingForm && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Schedule New Meeting</span>
              <Button 
                variant="ghost" 
                onClick={() => setShowMeetingForm(false)}
                className="text-gray-500"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Meeting title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <Textarea
              placeholder="Meeting description (optional)"
              value={newMeeting.description}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMeeting.date ? format(newMeeting.date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newMeeting.date}
                      onSelect={(date) => setNewMeeting(prev => ({ ...prev, date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <Select
              value={newMeeting.type}
              onValueChange={(value) => setNewMeeting(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-meet">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Google Meet
                  </div>
                </SelectItem>
                <SelectItem value="in-person">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    In Person
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateMeeting} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Schedule & Send Invites
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Upcoming Meetings ({meetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{meeting.title}</h4>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {meeting.type === 'google-meet' ? (
                        <Video className="w-3 h-3" />
                      ) : (
                        <Users className="w-3 h-3" />
                      )}
                      {meeting.type === 'google-meet' ? 'Google Meet' : 'In Person'}
                    </Badge>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-gray-600 text-sm mb-3">{meeting.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {format(new Date(meeting.datetime), 'PPP p')}
                    </span>
                    <span>by {meeting.created_by}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generateMeetingUrl(meeting), '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Join Meeting
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Meetings Scheduled</h3>
              <p className="text-gray-600 mb-6">
                Coordinate with your team by scheduling meetings and syncing with Google Calendar
              </p>
              <Button 
                onClick={() => setShowMeetingForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Team Members ({collaborators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{collaborator.collaborator_email}</p>
                    <p className="text-sm text-gray-500 capitalize">{collaborator.role}</p>
                  </div>
                  <Badge className={`${
                    collaborator.status === 'accepted' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {collaborator.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No team members yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
