import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  CaretLeft, 
  CaretRight,
  Plus,
  ArrowSquareOut,
  Funnel
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

export default function EventCalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const currentUser = await User.me();
      const userEvents = await Event.filter({ organizer_id: currentUser.id });
      setEvents(userEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date_start && isSameDay(new Date(event.date_start), date)
    );
  };

  const exportToGoogleCalendar = () => {
    const calendarUrl = `https://calendar.google.com/calendar/u/0/r`;
    window.open(calendarUrl, '_blank');
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous/next month to complete the grid
  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  
  const previousMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (i + 1));
    previousMonthDays.push(date);
  }
  
  const nextMonthDays = [];
  for (let i = 1; i <= (6 - lastDayOfWeek); i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    nextMonthDays.push(date);
  }

  const allCalendarDays = [...previousMonthDays, ...calendarDays, ...nextMonthDays];

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      planning: "bg-blue-100 text-blue-800",
      published: "bg-green-100 text-green-800",
      booked: "bg-purple-100 text-purple-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Event Calendar</h1>
            <p className="text-lg text-gray-600">View all your events in calendar format</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={exportToGoogleCalendar} variant="outline">
              <ArrowSquareOut className="w-4 h-4 mr-2" />
              Export to Google
            </Button>
            <Link to={createPageUrl("CreateEvent")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Calendar Controls */}
        <Card className="border-none shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                  <CaretLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                  <CaretRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={view} onValueChange={setView}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Funnel className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center font-medium text-gray-700 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {allCalendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isDayToday = isToday(date);
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-32 p-2 border-b border-r ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isDayToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${isDayToday ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <Link 
                          key={event.id} 
                          to={createPageUrl(`EventDetails?id=${event.id}`)}
                          className="block"
                        >
                          <div className="text-xs p-1 rounded truncate hover:shadow-sm transition-shadow cursor-pointer">
                            <Badge className={`${getStatusColor(event.status)} text-xs px-1 py-0.5`}>
                              {event.title}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-none shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {[
                { status: 'draft', label: 'Draft' },
                { status: 'planning', label: 'Planning' },
                { status: 'published', label: 'Published' },
                { status: 'booked', label: 'Booked' },
                { status: 'completed', label: 'Completed' },
                { status: 'cancelled', label: 'Cancelled' }
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge className={getStatusColor(status)}>{label}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}