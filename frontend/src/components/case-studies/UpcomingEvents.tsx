import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowSquareOut,
  ArrowRight,
  Clock
} from "@phosphor-icons/react";

export default function UpcomingEvents() {
  const upcomingEvents = [
    {
      title: "DevFest NYC",
      description: "Google Developer conference featuring the latest in AI and cloud technologies",
      date: "March 15-17, 2025",
      location: "Brooklyn, NY",
      attendees: "300+",
      status: "Registration Open",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format&q=80"
    },
    {
      title: "TechCrunch Disrupt",
      description: "Startup competition and networking event with industry leaders",
      date: "April 22-24, 2025", 
      location: "San Francisco, CA",
      attendees: "500+",
      status: "Early Bird",
      image: "https://images.unsplash.com/photo-1559223607-d9176c7e5e40?w=600&h=400&fit=crop&auto=format&q=80"
    },
    {
      title: "AI Summit Boston",
      description: "Enterprise AI adoption strategies and case studies",
      date: "May 8-10, 2025",
      location: "Boston, MA", 
      attendees: "200+",
      status: "Planning Phase",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop&auto=format&q=80"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 mb-6">
            <Calendar className="w-4 h-4" />
            Coming Up
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join us at these exciting upcoming events orchestrated by Strathwell
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl strathwell-transition overflow-hidden">
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge 
                  className={`absolute top-3 left-3 ${
                    event.status === 'Registration Open' ? 'bg-green-600' :
                    event.status === 'Early Bird' ? 'bg-blue-600' : 'bg-orange-600'
                  } text-white`}
                >
                  {event.status}
                </Badge>
              </div>

              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {event.title}
                </CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} expected</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white group"
                  disabled={event.status === 'Planning Phase'}
                >
                  {event.status === 'Planning Phase' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </>
                  ) : (
                    <>
                      Learn More
                      <ArrowSquareOut className="w-4 h-4 ml-2 group-hover:translate-x-1 strathwell-transition" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to={createPageUrl("DFY")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl group">
              Plan Your Event
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 strathwell-transition" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}