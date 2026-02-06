import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Plus, 
  Sparkle, 
  Calendar, 
  ListBullets, 
  ArrowRight,
  Heart,
  Bell,
  MapPin,
  Users,
  CurrencyDollar,
  CheckCircle,
  TrendUp,
  Buildings,
  CalendarCheck,
  Eye,
  Briefcase,
  FileText,
  Shield,
  Clock,
  SquaresFour
} from "@phosphor-icons/react";

// Mock Data
const mockEvents = [
  { id: 1, title: 'Annual Tech Summit 2025', date_start: '2025-10-20', city: 'New York', status: 'planning' },
  { id: 2, title: 'Summer Gala Fundraiser', date_start: '2025-08-15', city: 'Boston', status: 'booked' },
];

const mockPlans = [
  { id: 1, title: 'Q4 Product Launch', event_date: '2025-11-05', venues: 3, vendors: 5 },
  { id: 2, title: 'Holiday Office Party', event_date: '2025-12-18', venues: 2, vendors: 4 },
];

const OrganizerDashboardPreview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Events" value="12" icon={<Calendar />} color="blue" />
      <StatCard title="Upcoming" value="3" icon={<TrendUp />} color="green" />
      <StatCard title="Total Budget" value="$1.2M" icon={<CurrencyDollar />} color="purple" />
      <StatCard title="Avg. Event Size" value="250" icon={<Users />} color="orange" />
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="text-indigo-600"/>Recent Events</CardTitle></CardHeader>
          <CardContent>
            {mockEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">{new Date(event.date_start).toLocaleDateString()} • {event.city}</p>
                </div>
                <Badge className="capitalize bg-yellow-100 text-yellow-800">{event.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><ListBullets className="text-blue-600"/>Saved AI Plans</CardTitle></CardHeader>
          <CardContent>
            {mockPlans.map(plan => (
              <div key={plan.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                <p className="font-semibold text-gray-900">{plan.title}</p>
                <p className="text-sm text-gray-500">{plan.venues} Venues • {plan.vendors} Vendors</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="text-red-500"/>Favorites</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center">Your favorite venues and vendors will appear here.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="text-yellow-600"/>Reminders</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 text-center">Keep track of important deadlines and tasks.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const VenueDashboardPreview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Venues" value="5" icon={<Buildings />} color="blue" />
      <StatCard title="Total Bookings" value="82" icon={<CalendarCheck />} color="green" />
      <StatCard title="Total Revenue" value="$480k" icon={<CurrencyDollar />} color="purple" />
      <StatCard title="This Month" value="$35k" icon={<TrendUp />} color="orange" />
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-none shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck className="text-green-600"/>Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-900">Booking #A4B1C2</p>
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
            <span className="font-semibold text-gray-900">$15,000</span>
            <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><Buildings className="text-blue-600"/>Top Venues</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium text-gray-900 text-sm">The Grand Ballroom</p>
          <p className="text-xs text-gray-500 mb-2">25 bookings</p>
          <p className="font-medium text-gray-900 text-sm">The Waterfront Loft</p>
          <p className="text-xs text-gray-500">18 bookings</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ProviderDashboardPreview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Services" value="8" icon={<Briefcase />} color="blue" />
      <StatCard title="Total Bookings" value="112" icon={<CheckCircle />} color="green" />
      <StatCard title="Total Revenue" value="$215k" icon={<CurrencyDollar />} color="purple" />
      <StatCard title="This Month" value="$18k" icon={<TrendUp />} color="orange" />
    </div>
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
        <p className="text-gray-600 mb-4">Complete all steps to get discovered.</p>
        <Progress value={75} className="h-3" />
        <p className="text-right text-sm font-bold text-gray-900 mt-1">75% Complete</p>
      </CardContent>
    </Card>
    <div className="grid md:grid-cols-2 gap-6">
      <SetupStep title="Organization Profile" icon={<Buildings />} score={100} />
      <SetupStep title="Services" icon={<Briefcase />} score={100} />
      <SetupStep title="Documents" icon={<FileText />} score={50} />
      <SetupStep title="Insurance" icon={<Shield />} score={50} />
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <Card className="border-none shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      <div className={`p-2 rounded-lg bg-${color}-100`}>
        {React.cloneElement(icon, { className: `h-4 w-4 text-${color}-600` })}
      </div>
    </CardHeader>
    <CardContent><div className="text-2xl font-bold text-gray-900">{value}</div></CardContent>
  </Card>
);

const SetupStep = ({ title, icon, score }) => (
  <Card className="border-none shadow-lg">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${score === 100 ? 'bg-green-100' : 'bg-yellow-100'}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${score === 100 ? 'text-green-600' : 'text-yellow-600'}` })}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <Progress value={score} className="h-2 flex-1" />
            <span className="text-sm font-medium text-gray-700">{score}%</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);


export default function DashboardPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center pt-20 pb-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">One Platform, Many Roles</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore how Strathwell's powerful dashboards adapt to your specific needs, whether you're planning an event, managing a venue, or providing a service.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <Tabs defaultValue="organizer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="organizer" className="flex items-center gap-2"><SquaresFour className="w-4 h-4"/>Event Organizer</TabsTrigger>
            <TabsTrigger value="venue" className="flex items-center gap-2"><Buildings className="w-4 h-4"/>Venue Owner</TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2"><Briefcase className="w-4 h-4"/>Service Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="organizer">
            <Card className="bg-white border-none shadow-2xl rounded-xl">
              <CardContent className="p-6">
                <OrganizerDashboardPreview />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="venue">
            <Card className="bg-white border-none shadow-2xl rounded-xl">
              <CardContent className="p-6">
                <VenueDashboardPreview />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="provider">
            <Card className="bg-white border-none shadow-2xl rounded-xl">
              <CardContent className="p-6">
                <ProviderDashboardPreview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="text-center pb-20 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600 mb-8">Join thousands of professionals revolutionizing the event industry.</p>
        <Link to={createPageUrl('AppEntry')}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign Up for Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}