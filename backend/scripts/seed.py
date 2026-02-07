"""Seed database with realistic sample data.

Usage:
    cd backend && uv run python -m scripts.seed

Creates:
    - 1 admin user
    - 3 venue-owner users with 6 venues (approved)
    - 4 service-provider users with provider profiles + offered services
    - 2 regular users
    - 16 service catalog entries
    - 6 event templates (2 featured)

All passwords default to "password123" — for development only.
"""

import asyncio
import uuid

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.engine import async_session_factory, engine
from app.models.service import Service
from app.models.service_provider import ServiceProvider, ServiceProviderService
from app.models.template import Template
from app.models.user import User
from app.models.venue import Venue


DEFAULT_PASSWORD = hash_password("password123")


# ---------------------------------------------------------------------------
# Service catalog
# ---------------------------------------------------------------------------

SERVICE_CATALOG: list[dict] = [
    {"name": "Full-Service Catering", "category": "Catering", "description": "Complete food and beverage service including setup, serving staff, and cleanup."},
    {"name": "Cocktail Bar Service", "category": "Catering", "description": "Professional bartenders with custom cocktail menus."},
    {"name": "Wedding Photography", "category": "Photography", "description": "Full-day wedding photography with engagement shoot and edited album."},
    {"name": "Event Photography", "category": "Photography", "description": "Professional event photography with same-day digital delivery."},
    {"name": "Videography", "category": "Photography", "description": "Cinematic event videography with highlight reel and full edit."},
    {"name": "DJ Services", "category": "Entertainment", "description": "Professional DJ with sound system, lighting, and MC services."},
    {"name": "Live Band", "category": "Entertainment", "description": "Live music performance for events — various genres available."},
    {"name": "Floral Design", "category": "Decorations", "description": "Custom floral arrangements for ceremonies, centerpieces, and bouquets."},
    {"name": "Event Decorations", "category": "Decorations", "description": "Full venue decoration including linens, centerpieces, backdrops, and lighting."},
    {"name": "Uplighting & Ambiance", "category": "Lighting", "description": "LED uplighting, string lights, and atmospheric lighting design."},
    {"name": "Event Planning", "category": "Coordination", "description": "Full event coordination from planning through day-of execution."},
    {"name": "Day-of Coordination", "category": "Coordination", "description": "Professional coordinator to manage your event day timeline and vendors."},
    {"name": "Wedding Cake", "category": "Catering", "description": "Custom multi-tier wedding cakes and dessert tables."},
    {"name": "Photo Booth", "category": "Entertainment", "description": "Photo booth with props, instant prints, and digital gallery."},
    {"name": "Transportation", "category": "Logistics", "description": "Luxury vehicle rental and shuttle services for guests."},
    {"name": "Security Services", "category": "Logistics", "description": "Professional event security and crowd management."},
]

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

ADMIN_USER = {
    "email": "admin@strathwell.com",
    "first_name": "Admin",
    "last_name": "Strathwell",
    "role": "admin",
    "is_verified": True,
}

VENUE_OWNERS = [
    {"email": "sarah@grandballroom.com", "first_name": "Sarah", "last_name": "Mitchell", "role": "venue_owner", "is_verified": True},
    {"email": "james@lakesideestate.com", "first_name": "James", "last_name": "Walker", "role": "venue_owner", "is_verified": True},
    {"email": "maria@urbanrooftop.com", "first_name": "Maria", "last_name": "Garcia", "role": "venue_owner", "is_verified": True},
]

PROVIDER_USERS = [
    {"email": "chef@premiumcatering.com", "first_name": "Marcus", "last_name": "Chen", "role": "service_provider", "is_verified": True},
    {"email": "lens@capturemoments.com", "first_name": "Emily", "last_name": "Rodriguez", "role": "service_provider", "is_verified": True},
    {"email": "beats@djelectro.com", "first_name": "Alex", "last_name": "Thompson", "role": "service_provider", "is_verified": True},
    {"email": "bloom@flowercraft.com", "first_name": "Lily", "last_name": "Nguyen", "role": "service_provider", "is_verified": True},
]

REGULAR_USERS = [
    {"email": "john@example.com", "first_name": "John", "last_name": "Doe", "role": "user", "is_verified": True},
    {"email": "jane@example.com", "first_name": "Jane", "last_name": "Smith", "role": "user", "is_verified": True},
]

# ---------------------------------------------------------------------------
# Venues
# ---------------------------------------------------------------------------

VENUES_DATA = [
    # Owned by Sarah (index 0)
    {
        "owner_index": 0,
        "name": "The Grand Ballroom",
        "description": "An opulent ballroom with crystal chandeliers, marble floors, and floor-to-ceiling windows. Perfect for weddings and galas up to 400 guests.",
        "location_address": "250 Michigan Ave",
        "location_city": "Chicago",
        "capacity": 400,
        "amenities": ["Parking", "Catering Kitchen", "AV Equipment", "Bridal Suite", "Wheelchair Accessible", "Valet Parking"],
        "pricing_structure": {"base_price": 8000, "per_guest": 25, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"],
    },
    {
        "owner_index": 0,
        "name": "The Terrace Room",
        "description": "An intimate indoor-outdoor space with a covered terrace and garden views. Ideal for bridal showers, rehearsal dinners, and small receptions.",
        "location_address": "252 Michigan Ave",
        "location_city": "Chicago",
        "capacity": 80,
        "amenities": ["Outdoor Space", "Garden", "Parking", "AV Equipment"],
        "pricing_structure": {"base_price": 2500, "per_guest": 15, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800"],
    },
    # Owned by James (index 1)
    {
        "owner_index": 1,
        "name": "Lakeside Estate",
        "description": "A stunning waterfront estate with manicured gardens, a private dock, and panoramic lake views. Exclusive hire for up to 250 guests.",
        "location_address": "1200 Lakeshore Dr",
        "location_city": "Chicago",
        "capacity": 250,
        "amenities": ["Waterfront", "Gardens", "Parking", "Catering Kitchen", "Overnight Accommodation", "Boat Dock"],
        "pricing_structure": {"base_price": 12000, "per_guest": 35, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800"],
    },
    {
        "owner_index": 1,
        "name": "The Barn at Willow Creek",
        "description": "A beautifully restored rustic barn set on 50 acres of rolling countryside. A charming setting for weddings and outdoor celebrations.",
        "location_address": "8800 Willow Creek Rd",
        "location_city": "Chicago",
        "capacity": 180,
        "amenities": ["Outdoor Space", "Parking", "Fire Pit", "Bridal Suite", "Pet Friendly"],
        "pricing_structure": {"base_price": 5000, "per_guest": 20, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800"],
    },
    # Owned by Maria (index 2)
    {
        "owner_index": 2,
        "name": "Urban Rooftop Lounge",
        "description": "A sleek rooftop venue with skyline views, retractable glass roof, and modern industrial design. Perfect for corporate events and cocktail parties.",
        "location_address": "500 W Madison St",
        "location_city": "Chicago",
        "capacity": 150,
        "amenities": ["Rooftop", "City Views", "Full Bar", "AV Equipment", "Climate Controlled"],
        "pricing_structure": {"base_price": 6000, "per_guest": 30, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"],
    },
    {
        "owner_index": 2,
        "name": "Gallery Loft",
        "description": "A converted art gallery with exposed brick, soaring ceilings, and natural light. A blank canvas for creative events and celebrations.",
        "location_address": "720 N Wells St",
        "location_city": "Chicago",
        "capacity": 120,
        "amenities": ["Natural Light", "Open Floor Plan", "Parking Nearby", "AV Equipment", "Wheelchair Accessible"],
        "pricing_structure": {"base_price": 3500, "per_guest": 18, "currency": "USD"},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
    },
]

# ---------------------------------------------------------------------------
# Service providers + their services
# ---------------------------------------------------------------------------

PROVIDERS_DATA = [
    # Marcus Chen — catering
    {
        "user_index": 0,
        "business_name": "Premium Catering Co.",
        "description": "Award-winning catering for weddings and corporate events. Farm-to-table menus, dietary accommodations, and impeccable service.",
        "location_city": "Chicago",
        "service_area": ["Chicago", "Naperville", "Evanston", "Oak Park"],
        "pricing_structure": {"min_price": 2000, "max_price": 15000},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1555244162-803834f70033?w=800"],
        "services": ["Full-Service Catering", "Cocktail Bar Service", "Wedding Cake"],
    },
    # Emily Rodriguez — photography/video
    {
        "user_index": 1,
        "business_name": "Capture Moments Studio",
        "description": "Documentary-style event photography and cinematic videography. Serving Chicago for over 10 years.",
        "location_city": "Chicago",
        "service_area": ["Chicago", "Milwaukee", "Indianapolis"],
        "pricing_structure": {"min_price": 1500, "max_price": 8000},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800"],
        "services": ["Wedding Photography", "Event Photography", "Videography", "Photo Booth"],
    },
    # Alex Thompson — DJ/entertainment
    {
        "user_index": 2,
        "business_name": "DJ Electro Beats",
        "description": "High-energy DJ and MC services with premium sound and lighting. Weddings, corporate events, and private parties.",
        "location_city": "Chicago",
        "service_area": ["Chicago", "Schaumburg", "Joliet"],
        "pricing_structure": {"min_price": 800, "max_price": 3500},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800"],
        "services": ["DJ Services", "Uplighting & Ambiance"],
    },
    # Lily Nguyen — florals/decorations
    {
        "user_index": 3,
        "business_name": "Flowercraft Studio",
        "description": "Bespoke floral design and event decoration. From minimalist elegance to lavish garden themes — we bring your vision to life.",
        "location_city": "Chicago",
        "service_area": ["Chicago", "Evanston", "Oak Park", "Naperville"],
        "pricing_structure": {"min_price": 1000, "max_price": 10000},
        "status": "approved",
        "photos": ["https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800"],
        "services": ["Floral Design", "Event Decorations"],
    },
]

# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

TEMPLATES_DATA = [
    {
        "name": "Elegant Garden Wedding",
        "description": "A romantic outdoor wedding for 150 guests with garden ceremony, cocktail hour, and seated reception.",
        "event_type": "wedding",
        "budget_min": 15000,
        "budget_max": 25000,
        "guest_count": 150,
        "is_featured": True,
        "times_used": 47,
        "average_rating": 4.8,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "A modern wedding blueprint built for seamless transitions, curated guest experiences, and a refined aesthetic from ceremony to late-night celebration. Includes garden ceremony, cocktail hour with live music, plated dinner, and dancing under the stars.",
            "venueId": "harborview-hall",
            "defaultGuestCount": 150,
            "recommendedMode": "optimized",
            "maxGuestCount": 400,
            "stats": [
                {"label": "Guest Count", "value": "150"},
                {"label": "Duration", "value": "8 hours"},
                {"label": "Format", "value": "Indoor/Outdoor"},
            ],
            "timeline": [
                {"time": "3:00 PM", "title": "Guest Arrival & Seating", "description": "Welcome drinks and ambient lounge seating in the garden."},
                {"time": "3:30 PM", "title": "Ceremony", "description": "Live string trio with custom floral arch moment."},
                {"time": "4:00 PM", "title": "Cocktail Hour", "description": "Passed hors d'oeuvres and photo activations."},
                {"time": "5:00 PM", "title": "Reception & Dinner", "description": "Plated dinner service with seasonal farm-to-table menu."},
                {"time": "7:00 PM", "title": "First Dance & Toasts", "description": "Speeches, cake cutting, and first dance."},
                {"time": "8:00 PM", "title": "Dancing & Open Bar", "description": "DJ set with premium open bar service."},
                {"time": "10:30 PM", "title": "Farewell & Sparkler Exit", "description": "Sparkler send-off and guest departure."},
            ],
            "vendors": [
                {"category": "Venue", "name": "The Grand Ballroom", "note": "Crystal chandeliers, marble floors, and floor-to-ceiling windows."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "Seasonal plated dinner with vegan pairing."},
                {"category": "Entertainment", "name": "DJ Electro Beats", "note": "DJ set with premium sound and lighting."},
                {"category": "Floral", "name": "Flowercraft Studio", "note": "Custom floral arch and centerpieces."},
            ],
            "budget": {
                "total": "$20,000",
                "breakdown": [
                    {"label": "Venue & rentals", "amount": "$8,000"},
                    {"label": "Food & beverage", "amount": "$5,000"},
                    {"label": "Photography", "amount": "$2,500"},
                    {"label": "Entertainment", "amount": "$1,500"},
                    {"label": "Decor & florals", "amount": "$2,500"},
                ],
            },
            "theme": "Romantic Garden",
            "color_palette": ["Blush Pink", "Sage Green", "Ivory", "Gold"],
            "services": ["Full-Service Catering", "Wedding Photography", "DJ Services", "Floral Design", "Uplighting & Ambiance"],
        },
    },
    {
        "name": "Chic Corporate Gala",
        "description": "A sophisticated black-tie corporate gala for 200 attendees with keynote stage, dinner, and networking.",
        "event_type": "corporate",
        "budget_min": 20000,
        "budget_max": 40000,
        "guest_count": 200,
        "is_featured": True,
        "times_used": 32,
        "average_rating": 4.7,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "Designed for high-impact corporate events, this blueprint blends immersive keynote staging with elegant seated dinner service and premium networking experiences. Black-tie format with full AV production.",
            "venueId": "summit-terrace",
            "defaultGuestCount": 200,
            "recommendedMode": "optimized",
            "maxGuestCount": 400,
            "stats": [
                {"label": "Attendees", "value": "200"},
                {"label": "Format", "value": "Black Tie"},
                {"label": "Duration", "value": "5 hours"},
            ],
            "timeline": [
                {"time": "6:00 PM", "title": "Cocktail Reception", "description": "Signature cocktails and networking in the foyer."},
                {"time": "7:00 PM", "title": "Seated Dinner", "description": "Three-course plated dinner with wine service."},
                {"time": "8:00 PM", "title": "Keynote Address & Awards", "description": "CEO keynote, award presentations, and impact video."},
                {"time": "9:00 PM", "title": "Dancing & Open Bar", "description": "Live band and premium open bar."},
                {"time": "11:00 PM", "title": "Event Close", "description": "Guest departure and valet service."},
            ],
            "vendors": [
                {"category": "Venue", "name": "Urban Rooftop Lounge", "note": "Skyline views and retractable glass roof."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "Three-course plated dinner with wine pairing."},
                {"category": "Production", "name": "Signal Stageworks", "note": "LED wall, sound, and lighting design."},
                {"category": "Entertainment", "name": "DJ Electro Beats", "note": "DJ set with premium sound system."},
            ],
            "budget": {
                "total": "$32,000",
                "breakdown": [
                    {"label": "Venue", "amount": "$12,000"},
                    {"label": "Food & beverage", "amount": "$10,000"},
                    {"label": "AV & production", "amount": "$5,000"},
                    {"label": "Decorations", "amount": "$5,000"},
                ],
            },
            "theme": "Modern Elegance",
            "color_palette": ["Black", "Gold", "White"],
            "services": ["Full-Service Catering", "Event Photography", "DJ Services", "Uplighting & Ambiance", "Event Decorations"],
        },
    },
    {
        "name": "Milestone Birthday Bash",
        "description": "A fun and colorful celebration for 80 guests with themed decorations, food stations, and a live DJ.",
        "event_type": "birthday",
        "budget_min": 5000,
        "budget_max": 12000,
        "guest_count": 80,
        "is_featured": False,
        "times_used": 63,
        "average_rating": 4.6,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "A vibrant celebration designed for milestone birthdays. Features themed food stations, interactive photo booth, custom cake reveal, and high-energy DJ to keep the party going all night.",
            "venueId": "foundry-warehouse",
            "defaultGuestCount": 80,
            "recommendedMode": "optimized",
            "maxGuestCount": 150,
            "stats": [
                {"label": "Guests", "value": "80"},
                {"label": "Duration", "value": "5 hours"},
                {"label": "Format", "value": "Party"},
            ],
            "timeline": [
                {"time": "7:00 PM", "title": "Guests Arrive", "description": "Welcome drinks and themed photo wall."},
                {"time": "7:30 PM", "title": "Food Stations Open", "description": "Interactive food stations with global flavors."},
                {"time": "8:30 PM", "title": "Birthday Toast & Cake", "description": "Champagne toast and custom cake reveal."},
                {"time": "9:00 PM", "title": "Dancing & Photo Booth", "description": "DJ set with photo booth and props."},
                {"time": "11:30 PM", "title": "Event Wrap-up", "description": "Farewell and gift bags."},
            ],
            "vendors": [
                {"category": "Venue", "name": "Gallery Loft", "note": "Open floor plan with natural light."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "Themed food stations and dessert bar."},
                {"category": "Entertainment", "name": "DJ Electro Beats", "note": "High-energy DJ with party lighting."},
                {"category": "Photography", "name": "Capture Moments Studio", "note": "Event photography and photo booth."},
            ],
            "budget": {
                "total": "$8,800",
                "breakdown": [
                    {"label": "Venue", "amount": "$3,000"},
                    {"label": "Catering", "amount": "$2,500"},
                    {"label": "Entertainment", "amount": "$1,200"},
                    {"label": "Photography", "amount": "$800"},
                    {"label": "Decorations", "amount": "$500"},
                ],
            },
            "theme": "Party Vibes",
            "color_palette": ["Electric Blue", "Hot Pink", "Silver"],
            "services": ["Full-Service Catering", "DJ Services", "Event Photography", "Photo Booth"],
        },
    },
    {
        "name": "Tech Conference Summit",
        "description": "A full-day technology conference for 300 attendees with breakout sessions, expo area, and keynote theater.",
        "event_type": "conference",
        "budget_min": 25000,
        "budget_max": 50000,
        "guest_count": 300,
        "is_featured": False,
        "times_used": 18,
        "average_rating": 4.5,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "A comprehensive conference blueprint optimized for tech summits and industry events. Includes keynote theater, breakout session rooms, expo area, and structured networking. Full AV production and livestream support included.",
            "venueId": "granite-conservatory",
            "defaultGuestCount": 300,
            "recommendedMode": "max",
            "maxGuestCount": 500,
            "stats": [
                {"label": "Attendees", "value": "300"},
                {"label": "Duration", "value": "Full day"},
                {"label": "Sessions", "value": "12+"},
            ],
            "timeline": [
                {"time": "8:00 AM", "title": "Registration & Coffee", "description": "Badge pickup, coffee bar, and networking."},
                {"time": "9:00 AM", "title": "Opening Keynote", "description": "45-minute keynote with live Q&A."},
                {"time": "10:30 AM", "title": "Breakout Sessions", "description": "Three parallel tracks across multiple rooms."},
                {"time": "12:00 PM", "title": "Networking Lunch", "description": "Catered lunch with roundtable discussions."},
                {"time": "1:30 PM", "title": "Afternoon Sessions", "description": "Workshops, panels, and demo stations."},
                {"time": "4:00 PM", "title": "Closing Keynote", "description": "Final keynote and awards."},
                {"time": "5:00 PM", "title": "Networking Happy Hour", "description": "Cocktails, appetizers, and open networking."},
            ],
            "vendors": [
                {"category": "Venue", "name": "The Grand Ballroom", "note": "Multiple breakout rooms and main theater."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "All-day coffee service and catered lunch."},
                {"category": "AV", "name": "Campus Tech Services", "note": "Recording, livestreaming, and full AV support."},
                {"category": "Photography", "name": "Capture Moments Studio", "note": "Event photography and videography."},
            ],
            "budget": {
                "total": "$44,000",
                "breakdown": [
                    {"label": "Venue", "amount": "$15,000"},
                    {"label": "Catering", "amount": "$12,000"},
                    {"label": "AV & production", "amount": "$8,000"},
                    {"label": "Photography", "amount": "$3,000"},
                    {"label": "Decorations & signage", "amount": "$2,000"},
                ],
            },
            "theme": "Innovation Forward",
            "color_palette": ["Navy Blue", "Cyan", "White"],
            "services": ["Full-Service Catering", "Event Photography", "Videography", "Uplighting & Ambiance"],
        },
    },
    {
        "name": "Intimate Engagement Party",
        "description": "A cozy, elegant celebration for 40 guests with wine and cheese, live acoustic music, and tasteful decor.",
        "event_type": "engagement",
        "budget_min": 3000,
        "budget_max": 7000,
        "guest_count": 40,
        "is_featured": False,
        "times_used": 29,
        "average_rating": 4.9,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "A calming, elegant blueprint for intimate engagement celebrations. Wine and cheese stations, acoustic music, and tasteful floral arrangements create a warm atmosphere for sharing the moment with close friends and family.",
            "venueId": "heritage-studio",
            "defaultGuestCount": 40,
            "recommendedMode": "optimized",
            "maxGuestCount": 80,
            "stats": [
                {"label": "Guests", "value": "40"},
                {"label": "Format", "value": "Cocktail"},
                {"label": "Setting", "value": "Garden"},
            ],
            "timeline": [
                {"time": "5:00 PM", "title": "Guest Welcome & Wine Service", "description": "Welcome champagne and garden reception."},
                {"time": "5:30 PM", "title": "Cheese & Charcuterie Stations", "description": "Curated cheese and charcuterie with wine pairing."},
                {"time": "6:30 PM", "title": "Couple's Toast", "description": "Heartfelt toast and story sharing."},
                {"time": "7:00 PM", "title": "Dessert & Mingling", "description": "Dessert table and acoustic music."},
                {"time": "8:30 PM", "title": "Evening Ends", "description": "Guest departure with favor bags."},
            ],
            "vendors": [
                {"category": "Venue", "name": "The Terrace Room", "note": "Indoor-outdoor space with garden views."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "Wine and cheese stations with custom menu."},
                {"category": "Floral", "name": "Flowercraft Studio", "note": "Soft arrangements and memory table."},
                {"category": "Photography", "name": "Capture Moments Studio", "note": "Intimate event photography."},
            ],
            "budget": {
                "total": "$5,830",
                "breakdown": [
                    {"label": "Venue", "amount": "$2,000"},
                    {"label": "Catering", "amount": "$1,500"},
                    {"label": "Photography", "amount": "$1,000"},
                    {"label": "Florals", "amount": "$800"},
                ],
            },
            "theme": "Rustic Romance",
            "color_palette": ["Burgundy", "Blush", "Cream", "Eucalyptus"],
            "services": ["Cocktail Bar Service", "Event Photography", "Floral Design"],
        },
    },
    {
        "name": "Holiday Office Party",
        "description": "A festive corporate holiday party for 120 employees with dinner, dancing, and awards ceremony.",
        "event_type": "corporate",
        "budget_min": 8000,
        "budget_max": 18000,
        "guest_count": 120,
        "is_featured": False,
        "times_used": 41,
        "average_rating": 4.4,
        "template_data": {
            "image": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1000",
            "images": [
                "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80",
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
            ],
            "fullDetails": "A festive blueprint for corporate holiday celebrations. Features a three-course dinner, awards ceremony, DJ entertainment, and photo booth. Winter wonderland theme with premium decorations and ambient lighting.",
            "venueId": "orchard-house",
            "defaultGuestCount": 120,
            "recommendedMode": "optimized",
            "maxGuestCount": 200,
            "stats": [
                {"label": "Attendees", "value": "120"},
                {"label": "Format", "value": "Evening"},
                {"label": "Theme", "value": "Winter"},
            ],
            "timeline": [
                {"time": "6:30 PM", "title": "Cocktails & Mingling", "description": "Holiday cocktails and networking in the lounge."},
                {"time": "7:30 PM", "title": "Dinner Service", "description": "Three-course plated dinner with wine service."},
                {"time": "8:30 PM", "title": "Awards & Recognition", "description": "Annual awards ceremony and employee recognition."},
                {"time": "9:00 PM", "title": "Dancing & Photo Booth", "description": "DJ set with photo booth and holiday props."},
                {"time": "11:00 PM", "title": "Event Close", "description": "Guest departure and holiday gift bags."},
            ],
            "vendors": [
                {"category": "Venue", "name": "Lakeside Estate", "note": "Waterfront estate with elegant interiors."},
                {"category": "Catering", "name": "Premium Catering Co.", "note": "Three-course dinner with holiday menu."},
                {"category": "Entertainment", "name": "DJ Electro Beats", "note": "DJ set with holiday-themed lighting."},
                {"category": "Photography", "name": "Capture Moments Studio", "note": "Event photos and photo booth service."},
            ],
            "budget": {
                "total": "$15,400",
                "breakdown": [
                    {"label": "Venue", "amount": "$5,000"},
                    {"label": "Catering", "amount": "$4,500"},
                    {"label": "Decorations", "amount": "$2,000"},
                    {"label": "Entertainment", "amount": "$1,500"},
                    {"label": "Photography", "amount": "$1,000"},
                ],
            },
            "theme": "Winter Wonderland",
            "color_palette": ["Silver", "Ice Blue", "White", "Crystal"],
            "services": ["Full-Service Catering", "DJ Services", "Event Decorations", "Photo Booth"],
        },
    },
]


# ---------------------------------------------------------------------------
# Seeding logic
# ---------------------------------------------------------------------------


async def _clear_seeded_data(db: AsyncSession) -> None:
    """Delete previously seeded data using raw SQL to avoid ORM cascade issues."""
    seeded_emails = (
        [ADMIN_USER["email"]]
        + [u["email"] for u in VENUE_OWNERS]
        + [u["email"] for u in PROVIDER_USERS]
        + [u["email"] for u in REGULAR_USERS]
    )

    # Collect user IDs for seeded emails
    result = await db.execute(select(User.id).where(User.email.in_(seeded_emails)))
    user_ids = [row[0] for row in result.all()]

    if user_ids:
        # Delete in FK-safe order using raw SQL (no ORM cascade interference)
        await db.execute(text("DELETE FROM templates WHERE created_by = ANY(:ids)"), {"ids": user_ids})
        await db.execute(text("DELETE FROM subscriptions WHERE user_id = ANY(:ids)"), {"ids": user_ids})
        await db.execute(text(
            "DELETE FROM service_provider_services WHERE service_provider_id IN "
            "(SELECT id FROM service_providers WHERE user_id = ANY(:ids))"
        ), {"ids": user_ids})
        await db.execute(text("DELETE FROM service_providers WHERE user_id = ANY(:ids)"), {"ids": user_ids})
        await db.execute(text("DELETE FROM venues WHERE owner_id = ANY(:ids)"), {"ids": user_ids})
        await db.execute(text("DELETE FROM users WHERE id = ANY(:ids)"), {"ids": user_ids})

    # Delete seeded services by name
    svc_names = [svc["name"] for svc in SERVICE_CATALOG]
    await db.execute(text("DELETE FROM services WHERE name = ANY(:names)"), {"names": svc_names})

    # Delete seeded templates by name (in case any orphaned from previous runs)
    tmpl_names = [tmpl["name"] for tmpl in TEMPLATES_DATA]
    await db.execute(text("DELETE FROM templates WHERE name = ANY(:names)"), {"names": tmpl_names})

    await db.flush()


async def seed(db: AsyncSession) -> None:
    """Populate database with sample data."""

    print("Clearing any existing seed data...")
    await _clear_seeded_data(db)

    # --- Services ---
    print(f"Creating {len(SERVICE_CATALOG)} services...")
    service_map: dict[str, Service] = {}
    for svc_data in SERVICE_CATALOG:
        svc = Service(**svc_data)
        db.add(svc)
        service_map[svc_data["name"]] = svc
    await db.flush()

    # --- Users ---
    print("Creating users...")
    admin = User(password_hash=DEFAULT_PASSWORD, **ADMIN_USER)
    db.add(admin)

    venue_owner_users: list[User] = []
    for owner_data in VENUE_OWNERS:
        user = User(password_hash=DEFAULT_PASSWORD, **owner_data)
        db.add(user)
        venue_owner_users.append(user)

    provider_users: list[User] = []
    for prov_data in PROVIDER_USERS:
        user = User(password_hash=DEFAULT_PASSWORD, **prov_data)
        db.add(user)
        provider_users.append(user)

    for reg_data in REGULAR_USERS:
        user = User(password_hash=DEFAULT_PASSWORD, **reg_data)
        db.add(user)

    await db.flush()

    # --- Venues ---
    print(f"Creating {len(VENUES_DATA)} venues...")
    for venue_data in VENUES_DATA:
        owner_idx = venue_data.pop("owner_index")
        venue = Venue(owner_id=venue_owner_users[owner_idx].id, **venue_data)
        db.add(venue)
    await db.flush()

    # --- Service Providers ---
    print(f"Creating {len(PROVIDERS_DATA)} service providers...")
    for prov_data in PROVIDERS_DATA:
        user_idx = prov_data.pop("user_index")
        service_names = prov_data.pop("services")
        provider = ServiceProvider(
            user_id=provider_users[user_idx].id,
            business_name=prov_data["business_name"],
            description=prov_data["description"],
            location_city=prov_data["location_city"],
            service_area=prov_data["service_area"],
            pricing_structure=prov_data["pricing_structure"],
            status=prov_data["status"],
            photos=prov_data["photos"],
        )
        db.add(provider)
        await db.flush()

        # Link offered services
        for svc_name in service_names:
            svc = service_map.get(svc_name)
            if svc:
                link = ServiceProviderService(
                    service_provider_id=provider.id,
                    service_id=svc.id,
                    price_range=prov_data["pricing_structure"],
                )
                db.add(link)
        await db.flush()

        # Restore popped keys for potential re-run
        prov_data["user_index"] = user_idx
        prov_data["services"] = service_names

    # Restore venue data too
    for i, venue_data in enumerate(VENUES_DATA):
        if "owner_index" not in venue_data:
            # Figure it out from position (0,1 -> 0; 2,3 -> 1; 4,5 -> 2)
            venue_data["owner_index"] = i // 2

    # --- Templates ---
    print(f"Creating {len(TEMPLATES_DATA)} templates...")
    for tmpl_data in TEMPLATES_DATA:
        template = Template(
            name=tmpl_data["name"],
            description=tmpl_data["description"],
            event_type=tmpl_data["event_type"],
            budget_min=tmpl_data["budget_min"],
            budget_max=tmpl_data["budget_max"],
            guest_count=tmpl_data["guest_count"],
            is_featured=tmpl_data["is_featured"],
            times_used=tmpl_data["times_used"],
            average_rating=tmpl_data["average_rating"],
            template_data=tmpl_data["template_data"],
            is_public=True,
            created_by=admin.id,
        )
        db.add(template)
    await db.flush()

    print("\nSeed complete!")
    print(f"  Admin:       {ADMIN_USER['email']} / password123")
    print(f"  Venue owners: {', '.join(u['email'] for u in VENUE_OWNERS)}")
    print(f"  Providers:   {', '.join(u['email'] for u in PROVIDER_USERS)}")
    print(f"  Users:       {', '.join(u['email'] for u in REGULAR_USERS)}")
    print(f"  Services:    {len(SERVICE_CATALOG)}")
    print(f"  Venues:      {len(VENUES_DATA)}")
    print(f"  Templates:   {len(TEMPLATES_DATA)}")


async def main() -> None:
    async with async_session_factory() as db:
        await seed(db)
        await db.commit()


if __name__ == "__main__":
    asyncio.run(main())
