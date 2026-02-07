### Project Overview
You are building **Strathwell**, an end-to-end event orchestration platform that connects users with venues and service providers through an AI-powered chat interface. **The main attraction of the platform is the AI-generated templates** that show complete event visualizations including before/after floor plans and comprehensive component breakdowns. The platform handles everything from event planning to payment processing and task completion.

### Technical Stack

**Backend:**
- Framework: FastAPI
- Package Manager: `uv` (use `uv add` for dependencies)
- Data Validation: Pydantic
- RAG Implementation: Pydantic AI
- Database: PostgreSQL with pgvector
- LLM: NVIDIA NeMo (`nemotron-3-nano-30b-a3b`)
- Image Generation: Google Imagen (nano-banana)
- Image Storage: Cloudinary CDN
- Payment Processing: Stripe Connect
- Authentication: JWT with email verification using OTP

**Frontend:**
- Framework: React
- UI Components: shadcn/ui
- Language: English only
- Follow the existing color palette and design system

### Core Features & User Flows

#### 1. Authentication System

**Implementation Requirements:**
- JWT-based authentication
- Email verification using OTP (One-Time Password)
- User registration flow:
  1. User provides email and password
  2. System sends OTP to email
  3. User verifies OTP
  4. Account activated
- Login flow with JWT token generation
- Token refresh mechanism
- Password reset with OTP verification
- Separate authentication flows for:
  - Regular users (event hosts)
  - Service providers
  - Venue owners
  - Admins

#### 2. AI Chat-Based Event Planning (Strathwell OS) - **PRIMARY FEATURE**

**User Journey:**
1. User initiates chat with requirements (e.g., "I want to host an event in Chicago with a budget of $2,400 on January 2nd, 2026")
2. AI (using `nemotron-3-nano-30b-a3b`) collects missing information through conversational questions (combine 2-3 questions per message to avoid excessive back-and-forth)
3. Required information to collect:
   - Event type (wedding, corporate, birthday, conference, etc.)
   - Location/city
   - Date and time
   - Budget
   - Number of attendees
   - Specific service requirements (catering, photography, DJ, decorations, etc.)
   - Any special preferences (theme, dietary restrictions, accessibility needs)

4. Once sufficient information is gathered, AI orchestrates and generates a comprehensive event template
5. System queries database for top 4-5 options based on:
   - Venue/vendor availability for the specified date
   - Budget constraints
   - Location match
   - Service type match
   - Ratings and reviews

**RAG Implementation:**
- Use Pydantic AI with NVIDIA NeMo (`nemotron-3-nano-30b-a3b`)
- Vector embeddings stored in pgvector for similarity search
- Context includes:
  - Available venues with full details and photos
  - Available service providers with offerings and portfolios
  - Pricing information and package deals
  - Availability calendars
  - Past successful event templates with ratings
  - User preferences and history
  - Venue floor plans and layouts

**Template Generation - THE SHOWCASE FEATURE:**

This is the main attraction of Strathwell. The generated template must be visually impressive and comprehensive.

**Template Components:**

1. **Before/After Floor Plan Visualization:**
   - **Before Photo:** Shows the empty venue space (use actual venue photos from Cloudinary)
   - **After Photo:** AI-generated visualization showing the venue transformed for the event
   - Use Google Imagen (nano-banana) to generate the "after" photo based on:
     - Venue floor plan
     - Event type and theme
     - Guest count
     - Selected services (table arrangements, stage setup, decoration style)
     - Lighting and ambiance preferences
   - Side-by-side comparison view
   - Interactive elements to zoom and explore details

2. **Budget Breakdown Component:**
   - Itemized cost breakdown by category:
     - Venue rental
     - Catering (per person × guest count)
     - Photography/Videography
     - Entertainment (DJ, band, etc.)
     - Decorations
     - Lighting
     - Audio/Visual equipment
     - Staffing
     - Miscellaneous
   - Visual pie chart or bar graph
   - Show percentage of budget per category
   - Highlight cost savings or budget optimizations
   - Total cost with platform fee (10%)

3. **Service Provider Lineup Component:**
   - Card for each service provider with:
     - Service type
     - Provider name (anonymous until booking confirmed)
     - Rating and review count
     - Sample work photos
     - Brief description
     - Price for this event
   - Top 4-5 options per service type
   - Ability to swap providers (counts as iteration)

4. **Timeline Component:**
   - Event day timeline showing:
     - Setup time
     - Service provider arrival times
     - Event start time
     - Key moments (cocktail hour, dinner, speeches, etc.)
     - Event end time
     - Cleanup time
   - Visual Gantt-chart style display

5. **Venue Details Component:**
   - Venue name and location
   - Capacity and selected guest count
   - Amenities included
   - Parking information
   - Accessibility features
   - Photos gallery
   - Map integration

6. **Additional Visual Components:**
   - Table arrangement visualization
   - Seating chart (if applicable)
   - Menu preview (for catered events)
   - Color scheme and theme preview
   - Decoration mockups

**Template Iteration:**
- User can request changes to the template
- Each change request counts as one iteration
- Iteration limits based on subscription tier (see pricing page)
- User can:
  - Swap service providers
  - Adjust budget allocations
  - Change venue (if available)
  - Modify floor plan arrangement
  - Update guest count
  - Change theme/decoration style
- AI regenerates template with requested changes
- New before/after visualizations generated if floor plan changes

**JSON Structure for Template:**
```json
{
  "template_id": "uuid",
  "event_type": "wedding",
  "created_at": "timestamp",
  "venue": {
    "id": "uuid",
    "name": "Grand Ballroom",
    "location": "Chicago, IL",
    "capacity": 200,
    "cost": 3000,
    "photos": ["url1", "url2"],
    "floor_plan_url": "cloudinary_url"
  },
  "before_image_url": "cloudinary_url/venue_empty",
  "after_image_url": "generated_imagen_url",
  "services": [
    {
      "service_type": "catering",
      "provider_id": "uuid",
      "provider_name": "Elite Catering",
      "cost": 5000,
      "description": "Full service catering for 150 guests",
      "photos": ["url1", "url2"],
      "rating": 4.8
    }
  ],
  "budget": {
    "total_budget": 15000,
    "venue": 3000,
    "catering": 5000,
    "photography": 2000,
    "decorations": 1500,
    "entertainment": 2000,
    "miscellaneous": 1500,
    "breakdown_chart_data": {...}
  },
  "timeline": [
    {
      "time": "14:00",
      "activity": "Venue setup begins",
      "duration_minutes": 120
    }
  ],
  "guest_count": 150,
  "theme": "Elegant Garden",
  "color_scheme": ["#hexcode1", "#hexcode2"],
  "iterations_used": 0
}
```

#### 3. Event Cancellation & Refund Policy

**Cancellation Rules:**
- Users can cancel events at any time before the event date
- Refund policy: **90% refund** of total paid amount
- Platform retains 10% to cover processing fees and administrative costs

**Cancellation Workflow:**
1. User requests cancellation through event dashboard
2. System shows refund amount (90% of total paid)
3. User confirms cancellation
4. System processes refund via Stripe
5. Notifications sent to:
   - All service providers (booking cancelled)
   - Venue owner (booking cancelled)
   - User (cancellation confirmation + refund details)
6. Service providers and venue owner freed up for other bookings
7. Event status changed to "cancelled"
8. Chat group archived but remains accessible for reference

**Database Updates on Cancellation:**
```sql
-- Update event status
UPDATE events SET status = 'cancelled', cancelled_at = NOW() WHERE id = event_id;

-- Process refund
INSERT INTO payments (
  event_id, 
  payer_id, 
  amount, 
  payment_type, 
  status
) VALUES (
  event_id,
  user_id,
  original_amount * 0.9,
  'refund',
  'processing'
);

-- Update availability for venue and service providers
UPDATE availability 
SET is_available = true 
WHERE entity_id IN (venue_id, service_provider_ids) 
AND date = event_date;

-- Send notifications
```

**API Endpoint:**
- POST `/api/events/{id}/cancel` - Cancel event with 90% refund
  - Request body: `{ "reason": "optional cancellation reason" }`
  - Response: `{ "refund_amount": 13500, "processing_time": "3-5 business days" }`

#### 4. Vendor & Venue Owner Onboarding

**Service Provider Onboarding Steps:**
1. Account creation with email verification (OTP)
2. Location details (city, address, service area)
3. Services offered (single or multiple services - ensure database schema supports many-to-many relationship)
4. Pricing structure (per service, with different tiers if applicable)
5. Availability calendar setup
6. Portfolio/Sample Work:
   - Upload before/after photos of past events (these feed into RAG system)
   - Minimum 5 photos required
   - Photos stored in Cloudinary
7. Business information:
   - Business name
   - Website (optional)
   - Phone number
   - Legal documents upload (business license, insurance, etc.)
8. Admin review and approval process
9. Pending status until approved

**Venue Owner Onboarding Steps:**
1. Account creation with email verification (OTP)
2. Venue name and description
3. Venue specifications (capacity, indoor/outdoor, amenities)
4. Location (address with map integration)
5. Pricing structure (hourly, daily rates, etc.)
6. Availability calendar setup
7. Legal documents upload (business license, permits, insurance)
8. **Venue photos upload (minimum 10 high-quality photos required) to Cloudinary:**
   - Empty venue from multiple angles
   - Different lighting conditions
   - Entrance and parking areas
   - Restrooms and facilities
   - Kitchen/catering areas (if applicable)
   - **These photos are critical for the "Before" images in templates**
9. Floor plan:
   - **Option 1:** Venue owner uploads existing floor plan → store and use as-is
   - **Option 2:** No floor plan provided → **AI generates one** using:
     - Google Imagen (nano-banana)
     - Input: Venue photos, dimensions, capacity, room descriptions
     - Output: Top-down floor plan showing room layout, dimensions, entrance/exit points
     - Stored in Cloudinary
     - Marked as `floor_plan_generated: true`
10. Admin review and approval process
11. Pending status until approved

**Floor Plan Generation Prompt for Google Imagen:**
```
Generate a detailed architectural floor plan for an event venue based on these specifications:
- Venue name: {venue_name}
- Dimensions: {dimensions}
- Capacity: {capacity} people
- Room type: {indoor/outdoor/mixed}
- Features: {list of amenities}
- Reference photos: {venue_photos}

Create a top-down 2D floor plan showing:
- Room boundaries and walls
- Entrance and exit points
- Windows and doors
- Stage or focal areas
- Built-in features (bars, kitchen access, etc.)
- Dimensions labeled
- Scale indicator
- Clean, professional architectural drawing style
```

**Post-Approval:**
- Status changed to "Active"
- Listed in marketplace
- Eligible to receive event requests
- Profile visible to users
- Photos and floor plans indexed in vector database for RAG

#### 5. Request & Booking Flow

**After Template Approval by User:**
1. System automatically sends booking requests to top 3-4 matching venues simultaneously
2. Venues receive notification (email + in-app)
3. **First venue to accept gets the booking** (race condition handling required)
4. System notifies other venues that position is filled
5. Once venue is confirmed, system sends requests to selected service providers
6. Service providers confirm availability (48-hour response window)
7. If provider doesn't respond, system automatically selects next best option
8. System generates final budget breakdown showing:
   - Venue cost
   - Each service cost
   - Platform fee (10% commission)
   - Total amount
9. User reviews final template with confirmed providers
10. User pays total event cost upfront via Stripe
11. Funds held in escrow by platform
12. Booking confirmed to all parties
13. Chat group created with all participants

**Stripe Connect Implementation:**
- Create connected accounts for venues and service providers during onboarding
- Hold funds in platform account (escrow)
- Release funds after task completion approval
- Deduct 10% platform commission automatically
- Handle refunds (90%) for cancellations

#### 6. Task Completion & Payment Release

**Chat System:**
- Create group chat with: User + Venue Owner + All Service Providers (could be 5-10 providers)
- All parties remain anonymous with system-generated display names:
  - User: "Event Organizer"
  - Venue: "Venue Host"
  - Services: "Catering Service", "Photography Service", "DJ Service", etc.
- Real-time messaging capabilities (WebSocket)
- Implement content guardrails using regex and validation:
  - Block URLs/links (detect http://, https://, www., .com, .net, .org, etc.)
  - Block phone numbers (all formats: (123) 456-7890, 123-456-7890, +1234567890)
  - Block email addresses (pattern: *@*.*)
  - Block attempts to share social media handles (@username, facebook.com/user)
  - Block external messaging apps (WhatsApp, Telegram, Signal, etc.)
  - Similar to Fiverr's messaging system
- Show warning message if blocked content is detected: "External contact information is not allowed. Please keep all communication within the platform."
- File sharing allowed (images only for completion evidence)

**Task Completion Workflow:**
1. Each service provider completes their assigned task during/after the event
2. Provider uploads completion photo(s) to Cloudinary as evidence (required)
3. Provider sends completion request with:
   - Photos
   - Completion notes
   - Request for payment release
4. User receives push notification + email to review completion
5. User views evidence and either:
   - **Approves** → Payment released immediately to that provider (minus 10% commission)
   - **Requests revision** → Provider makes corrections, resubmits
   - **Disputes** → Escalates to admin review with evidence from both parties
6. Each service provider gets paid independently after their task approval
7. **Venue owner marks entire event as completed** after event concludes and cleanup is done
8. Venue owner uploads final photos of venue in original condition
9. User approves venue completion
10. Payment released to venue owner (minus 10% commission)
11. After all completions approved, user prompted to leave reviews for:
    - Venue (rating 1-5 + written review)
    - Each service provider individually (rating 1-5 + written review)
12. Reviews become public and affect future RAG recommendations

**Payment Release Logic:**
```python
# Individual service provider payment
service_provider_payment = agreed_service_cost * 0.9
platform_commission = agreed_service_cost * 0.1

# Venue owner payment
venue_payment = agreed_venue_cost * 0.9
platform_commission = agreed_venue_cost * 0.1

# Total platform revenue per event
total_commission = sum(all_service_costs + venue_cost) * 0.1

# Cancellation refund
refund_amount = total_paid_amount * 0.9
platform_keeps = total_paid_amount * 0.1
```

**Stripe Connect Payment Release API:**
```python
# Release payment to service provider
stripe.Transfer.create(
    amount=int(agreed_cost * 0.9 * 100),  # Convert to cents
    currency="usd",
    destination=service_provider_stripe_account_id,
    transfer_group=f"event_{event_id}",
)
```

#### 7. Marketplace & Template Library

**Marketplace Features:**
- Browse venues with filters:
  - Location (city, zip code, radius search)
  - Capacity range
  - Price range
  - Availability date
  - Ratings (4+ stars, 3+ stars, etc.)
  - Amenities (parking, catering kitchen, AV equipment, accessibility)
  - Venue type (ballroom, outdoor garden, rooftop, warehouse, etc.)
- Browse service providers with filters:
  - Service type (catering, photography, DJ, decorations, etc.)
  - Location/service area
  - Price range
  - Availability date
  - Ratings
  - Portfolio quality
- Direct booking capabilities (without going through AI chat)
- View detailed profiles with:
  - Photo galleries
  - Reviews and ratings
  - Pricing packages
  - Availability calendar
  - Sample work/portfolio
  - Response time statistics

**Template Library (Home Page Showcase):**
- Display pre-made templates as inspiration
- **Each template prominently shows:**
  - Event type (e.g., "Elegant Wedding", "Corporate Gala", "Birthday Celebration")
  - **Large before/after floor layout images** (hero section)
  - Guest count
  - Budget range
  - Location/city
  - Services included with icons
  - Number of times this template was used
  - Average rating from users who used it
- Click template to see full details:
  - Complete budget breakdown
  - Service provider suggestions
  - Timeline
  - Additional photos
  - User testimonials
- **"Use This Template" button** → Opens AI chat with template pre-loaded
- User can customize template based on:
  - Their location
  - Their budget
  - Their specific date
  - Their preferences
- Iteration limits still apply based on subscription
- Templates are searchable by:
  - Event type
  - Budget range
  - Guest count
  - Style/theme
  - Season

**Template Library JSON Structure:**
```json
{
  "featured_templates": [
    {
      "id": "template_001",
      "name": "Elegant Garden Wedding",
      "description": "A romantic outdoor wedding for 150 guests",
      "event_type": "wedding",
      "before_image": "cloudinary_url/venue_empty",
      "after_image": "cloudinary_url/transformed_venue",
      "budget_range": {
        "min": 15000,
        "max": 25000
      },
      "guest_count": 150,
      "location": "Chicago, IL",
      "services": ["Catering", "Photography", "DJ", "Florals", "Lighting"],
      "times_used": 47,
      "average_rating": 4.8,
      "sample_budget_breakdown": {...},
      "is_featured": true
    }
  ]
}
```

#### 8. Admin Dashboard

**Admin Capabilities:**

**Approval Workflows:**
- Review and approve/reject vendor onboarding applications
- Review and approve/reject venue onboarding applications
- View all pending applications in queue with priority sorting
- For each application, review:
  - Submitted information
  - Uploaded documents (verify legitimacy)
  - Photos (verify quality and authenticity)
  - Generated floor plans (for venues without plans)
  - Business credentials
- Approval actions:
  - Approve → Activate account, add to marketplace
  - Reject → Send rejection reason, allow resubmission
  - Request more information → Flag specific fields needing correction

**Dispute Resolution:**
- View disputed task completions
- Review evidence from both parties:
  - User's rejection reason
  - Service provider's completion photos and notes
  - Chat history between parties
- Make final decision:
  - Side with user → No payment released, provider penalized
  - Side with provider → Force payment release
  - Partial resolution → Release partial payment
- Log all dispute decisions for pattern analysis

**Platform Analytics Dashboard:**
- **Revenue Metrics:**
  - Total revenue (10% commissions)
  - Revenue by month/quarter/year
  - Average order value
  - Revenue by event type
  
- **User Metrics:**
  - Total users registered
  - Active users (booked events)
  - User growth rate
  - Retention rate
  - Subscription tier distribution
  
- **Event Metrics:**
  - Total events created
  - Events completed
  - Events cancelled (track refunds)
  - Average event budget
  - Most popular event types
  - Busiest months for bookings
  
- **Venue/Provider Metrics:**
  - Total active venues
  - Total active service providers
  - Top-rated venues (leaderboard)
  - Top-rated providers (leaderboard)
  - Most booked venues/providers
  - Average response time
  
- **Template Metrics:**
  - Most popular templates
  - Average iterations per template
  - Template usage by event type
  
- **Charts and Visualizations:**
  - Line charts for growth trends
  - Pie charts for revenue distribution
  - Bar charts for top performers
  - Heat maps for booking patterns

**User Management:**
- View all users with filters
- Suspend/ban users for violations
- Reset passwords manually if needed
- View user booking history
- Refund management

**Content Moderation:**
- Monitor chat system for violations
- Review flagged messages
- Warn or suspend users for repeated violations
- Export chat logs for legal purposes if needed

### Database Schema Design

**Key Tables & Relationships:**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'service_provider', 'venue_owner', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Venues table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    capacity INTEGER NOT NULL,
    amenities JSONB DEFAULT '[]',
    pricing_structure JSONB NOT NULL,
    floor_plan_url TEXT,
    floor_plan_generated BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
    photos TEXT[] NOT NULL, -- Array of Cloudinary URLs
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_location ON venues USING GIST(ll_to_earth(location_lat, location_lng));
CREATE INDEX idx_venues_city ON venues(location_city);

-- Service Providers table
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    service_area TEXT[], -- Array of cities they serve
    pricing_structure JSONB,
    photos TEXT[] NOT NULL, -- Portfolio photos
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'suspended')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_service_providers_status ON service_providers(status);
CREATE INDEX idx_service_providers_city ON service_providers(location_city);

-- Services catalog
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT
);

-- Junction table for service providers and services (many-to-many)
CREATE TABLE service_provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    price_range JSONB, -- {"min": 500, "max": 2000, "unit": "per_event"}
    UNIQUE(service_provider_id, service_id)
);

CREATE INDEX idx_provider_services ON service_provider_services(service_provider_id, service_id);

-- Availability table (for both venues and service providers)
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('venue', 'service_provider')),
    entity_id UUID NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    time_slots JSONB, -- Optional time slots for partial day availability
    UNIQUE(entity_type, entity_id, date)
);

CREATE INDEX idx_availability_lookup ON availability(entity_type, entity_id, date);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id),
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    guest_count INTEGER NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN (
        'planning', 'pending_venue', 'confirmed', 'in_progress', 'completed', 'cancelled'
    )),
    template_data JSONB NOT NULL, -- Full template JSON
    iterations_used INTEGER DEFAULT 0,
    chat_group_id UUID,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);

-- Event Services (junction table)
CREATE TABLE event_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES service_providers(id),
    service_id UUID REFERENCES services(id),
    agreed_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'completed', 'paid', 'disputed'
    )),
    completion_photos TEXT[], -- Cloudinary URLs
    completion_notes TEXT,
    completed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_services ON event_services(event_id, service_provider_id);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id),
    payee_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2),
    net_amount DECIMAL(10, 2),
    payment_type VARCHAR(50) CHECK (payment_type IN (
        'event_total', 'venue_payment', 'service_payment', 'refund'
    )),
    stripe_payment_intent_id VARCHAR(255),
    stripe_transfer_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'held', 'processing', 'released', 'refunded', 'failed'
    )),
    created_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP
);

CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Templates library
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(100) NOT NULL,
    template_data JSONB NOT NULL, -- Full template structure
    before_layout_url TEXT NOT NULL, -- Cloudinary URL
    after_layout_url TEXT NOT NULL, -- Generated image URL
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    guest_count INTEGER,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    times_used INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_public ON templates(is_public, is_featured);
CREATE INDEX idx_templates_type ON templates(event_type);

-- Chat groups
CREATE TABLE chat_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    sender_anonymous_name VARCHAR(100) NOT NULL,
    message_content TEXT NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    attachment_url TEXT, -- For completion photos
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_group ON chat_messages(chat_group_id, created_at);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    reviewee_type VARCHAR(50) CHECK (reviewee_type IN ('venue', 'service_provider')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, reviewer_id, reviewee_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id, reviewee_type);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- From pricing page
    iteration_limit INTEGER NOT NULL,
    iterations_remaining INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    stripe_subscription_id VARCHAR(255)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);

-- Documents (legal documents for onboarding)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) CHECK (entity_type IN ('venue', 'service_provider')),
    entity_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL, -- Cloudinary URL
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);

-- Vector embeddings for RAG (using pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) CHECK (content_type IN ('venue', 'service', 'template', 'provider')),
    content_id UUID NOT NULL,
    embedding vector(1536), -- Adjust dimension based on your embedding model
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vector_embeddings_type ON vector_embeddings(content_type, content_id);
CREATE INDEX idx_vector_embeddings_search ON vector_embeddings USING ivfflat (embedding vector_cosine_ops);
-- Or use HNSW for better performance:
-- CREATE INDEX idx_vector_embeddings_search ON vector_embeddings USING hnsw (embedding vector_cosine_ops);
```

### API Endpoints Structure

**Authentication:**
- `POST /api/auth/register` - Register with email
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/logout` - Logout (invalidate token)

**User Management:**
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/subscription` - Get subscription details
- `PUT /api/users/subscription` - Update subscription

**Chat/AI Orchestration (Main Feature):**
- `POST /api/chat/start` - Start new event planning conversation
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/history/{session_id}` - Get conversation history
- `POST /api/chat/generate-template` - Generate event template from conversation
  - Returns complete template JSON with before/after images
  - Queries database for available venues and providers
  - Generates floor plan visualization using Imagen
  - Creates budget breakdown
  - Stores template in database

**Venues:**
- `POST /api/venues/onboard` - Start venue onboarding (multi-step)
- `POST /api/venues/{id}/photos` - Upload venue photos (batch upload to Cloudinary)
- `POST /api/venues/{id}/floor-plan` - Upload or generate floor plan
- `GET /api/venues/{id}` - Get venue details with photos and floor plan
- `GET /api/venues` - List/search venues (with filters)
- `PUT /api/venues/{id}` - Update venue (owner only)
- `POST /api/venues/{id}/availability` - Update availability calendar
- `GET /api/venues/{id}/availability` - Check availability for date range
- `GET /api/venues/{id}/reviews` - Get venue reviews

**Service Providers:**
- `POST /api/service-providers/onboard` - Start provider onboarding (multi-step)
- `POST /api/service-providers/{id}/portfolio` - Upload portfolio photos
- `GET /api/service-providers/{id}` - Get provider details
- `GET /api/service-providers` - List/search providers (with filters)
- `PUT /api/service-providers/{id}` - Update provider (owner only)
- `POST /api/service-providers/{id}/availability` - Update availability calendar
- `GET /api/service-providers/{id}/reviews` - Get provider reviews
- `POST /api/service-providers/{id}/services` - Add/update services offered

**Events:**
- `POST /api/events` - Create event from generated template
- `GET /api/events/{id}` - Get event details with full template
- `GET /api/events` - List user's events
- `PUT /api/events/{id}/iterate` - Request template iteration (deducts from limit)
- `POST /api/events/{id}/approve` - Approve template and send venue requests
- `POST /api/events/{id}/venue-response` - Venue accepts/declines (first come, first served)
- `POST /api/events/{id}/complete-service` - Service provider marks task complete
- `POST /api/events/{id}/approve-completion` - User approves task completion (triggers payment)
- `POST /api/events/{id}/cancel` - **Cancel event with 90% refund**
  - Processes Stripe refund
  - Updates availability
  - Notifies all parties
  - Archives chat group

**Payments:**
- `POST /api/payments/create-intent` - Create Stripe payment intent for event
- `POST /api/payments/confirm` - Confirm payment (funds held in escrow)
- `GET /api/payments/{event_id}` - Get payment status and breakdown
- `POST /api/payments/release/{event_service_id}` - Release payment to provider (after approval)
- `GET /api/payments/refund/{event_id}` - Get refund status

**Chat System:**
- `GET /api/messages/{event_id}` - Get chat messages for event
- `POST /api/messages/{event_id}` - Send message (with guardrails validation)
- `WebSocket /ws/chat/{event_id}` - Real-time messaging
- `POST /api/messages/{event_id}/attachment` - Upload attachment (completion photos)

**Reviews:**
- `POST /api/reviews` - Submit review after event completion
- `GET /api/reviews/venue/{venue_id}` - Get venue reviews
- `GET /api/reviews/provider/{provider_id}` - Get provider reviews
- `GET /api/reviews/event/{event_id}` - Get all reviews for an event

**Admin:**
- `GET /api/admin/pending-approvals` - Get pending onboarding requests (venues + providers)
- `GET /api/admin/pending-approvals/{entity_type}/{entity_id}` - Get detailed application
- `POST /api/admin/approve/{entity_type}/{entity_id}` - Approve onboarding
- `POST /api/admin/reject/{entity_type}/{entity_id}` - Reject onboarding with reason
- `GET /api/admin/disputes` - Get disputed task completions
- `POST /api/admin/resolve-dispute/{dispute_id}` - Resolve dispute
- `GET /api/admin/analytics` - Get platform analytics dashboard data
- `GET /api/admin/users` - List all users with filters
- `PUT /api/admin/users/{id}/suspend` - Suspend user account

**Templates:**
- `GET /api/templates` - List public templates (featured on home page)
- `GET /api/templates/{id}` - Get template details with full before/after images
- `POST /api/templates/customize` - Customize existing template for user's needs
- `GET /api/templates/popular` - Get most popular templates
- `GET /api/templates/by-type/{event_type}` - Filter templates by event type

**Marketplace:**
- `GET /api/marketplace/venues` - Browse venues with advanced filters
- `GET /api/marketplace/services` - Browse service providers with filters
- `POST /api/marketplace/book-venue` - Direct venue booking (bypasses AI chat)
- `POST /api/marketplace/book-service` - Direct service booking

### Frontend Components Architecture

**Using shadcn/ui, create these component categories:**

**Layout Components:**
- `Navbar` - Main navigation with authentication state, user role-based menu
- `Footer` - Company info, links, social media
- `Sidebar` - For admin dashboard and user dashboards
- `DashboardLayout` - Wrapper for dashboard pages with sidebar

**Authentication Components:**
- `LoginForm` - Email/password with JWT
- `RegisterForm` - Email/password registration with role selection
- `OTPVerificationModal` - 6-digit OTP input for email verification
- `ForgotPasswordModal` - Request OTP for password reset
- `ResetPasswordForm` - Reset password with OTP verification

**Chat Components (PRIMARY FEATURE):**
- `ChatInterface` - **Main AI chat for event planning (redesigned with existing color palette)**
  - Modern, clean design
  - Message bubbles with user/AI distinction
  - Typing indicator when AI is generating response
  - Smooth animations
  - Sticky input at bottom
- `MessageBubble` - Individual message display
- `ChatInput` - Text input with send button, emoji support
- `LoadingAnimation` - Pulsing dots when AI is thinking
- `TemplatePreview` - **Rich template card shown in chat when generated**
  - Large before/after images with slider comparison
  - Expandable budget breakdown
  - Service provider cards
  - "Approve Template" and "Request Changes" buttons
- `IterationCounter` - Badge showing "2/5 iterations remaining"
- `QuestionPrompt` - Suggested quick replies for common questions

**Template Components (SHOWCASE FEATURE):**
- `TemplateCard` - Template preview card for library
  - Hero image (before/after comparison)
  - Event type badge
  - Budget range
  - Guest count
  - Rating stars
  - "Use This Template" button
- `TemplateDetail` - Full template view
  - **Large before/after floor plan comparison** (slider or side-by-side)
  - Interactive budget breakdown chart
  - Service provider lineup with cards
  - Timeline visualization
  - Venue details with photo gallery
  - User testimonials
  - "Customize" button
- `FloorPlanViewer` - Before/after layout visualization
  - Image comparison slider
  - Zoom and pan functionality
  - Annotation tooltips
- `BudgetBreakdown` - Itemized budget display
  - Pie chart or bar chart
  - Category breakdown with percentages
  - Total cost highlighted
  - Platform fee shown
  - Savings indicators
- `ServiceLineup` - Grid of service provider cards
  - Service type
  - Provider preview (anonymous until booking)
  - Rating
  - Sample work thumbnail
  - Price
  - "Swap Provider" button (counts as iteration)
- `TimelineView` - Event day timeline
  - Gantt-chart style horizontal timeline
  - Color-coded by service type
  - Hover for details
- `IterationHistory` - Show changes made in previous iterations

**Event Management:**
- `EventCard` - Event summary card for dashboard
  - Event type and date
  - Status badge
  - Venue and location
  - Action buttons
- `EventDetails` - Full event information page
  - Complete template display
  - Chat access button
  - Task completion status for each service
  - Payment status
  - Cancel event button (with 90% refund warning)
- `CompletionRequest` - Service provider completion form
  - Photo upload (drag-and-drop)
  - Completion notes textarea
  - Submit button
- `ApprovalModal` - User approval interface
  - Display completion photos
  - Read completion notes
  - Approve/Request Revision buttons
  - Dispute button
- `CancellationModal` - Event cancellation confirmation
  - Show refund amount (90% of total)
  - Cancellation reason textarea
  - Confirm cancellation button
  - Warning message about notifying vendors

**Onboarding Components:**
- `VenueOnboardingWizard` - Multi-step venue onboarding
  - Step 1: Basic Info
  - Step 2: Location & Capacity
  - Step 3: Pricing
  - Step 4: Photos Upload (minimum 10)
  - Step 5: Floor Plan (upload or AI generate)
  - Step 6: Legal Documents
  - Step 7: Availability Calendar
  - Progress indicator
- `ServiceProviderOnboardingWizard` - Multi-step provider onboarding
  - Step 1: Basic Info
  - Step 2: Services Offered (multi-select)
  - Step 3: Pricing per Service
  - Step 4: Portfolio Upload (minimum 5 before/after photos)
  - Step 5: Legal Documents
  - Step 6: Availability Calendar
  - Progress indicator
- `DocumentUpload` - Drag-and-drop file upload to Cloudinary
  - File type validation
  - Size limit check
  - Upload progress bar
  - Preview uploaded documents
- `AvailabilityCalendar` - Calendar for setting availability
  - Month view
  - Click to toggle available/unavailable
  - Bulk select date ranges
  - Save button
- `FloorPlanUpload` - Upload or generate floor plan
  - Option 1: Upload existing floor plan
  - Option 2: AI Generate (button triggers Imagen)
  - Preview generated floor plan
  - Edit/regenerate option

**Marketplace Components:**
- `VenueCard` - Venue listing card
  - Hero image from photo gallery
  - Name and location
  - Capacity
  - Rating stars
  - Price starting from
  - "View Details" button
- `ServiceProviderCard` - Provider listing card
  - Portfolio cover image
  - Business name
  - Services offered badges
  - Rating stars
  - Price range
  - "View Profile" button
- `FilterSidebar` - Search and filter controls
  - Location input with autocomplete
  - Date picker for availability
  - Price range slider
  - Capacity range
  - Amenities checkboxes (for venues)
  - Service type checkboxes (for providers)
  - Rating filter
  - "Apply Filters" button
- `MapView` - Location-based browsing
  - Interactive map with markers
  - Click marker to see venue/provider info
  - Filter results on map
- `ProfilePage` - Detailed venue/provider profile
  - Photo gallery slider
  - Reviews section
  - Availability calendar
  - Pricing packages
  - About section
  - Book Now button

**Admin Components:**
- `ApprovalQueue` - List of pending approvals
  - Tabs for Venues / Service Providers
  - Sort by submission date
  - Filter by status
  - Quick action buttons
- `ApprovalDetailModal` - Review onboarding application
  - Display all submitted information
  - View uploaded photos in gallery
  - View documents with download links
  - View generated floor plan (for venues)
  - Approve/Reject buttons
  - Rejection reason textarea
- `AnalyticsDashboard` - Platform metrics
  - KPI cards (total revenue, events, users)
  - Line chart for growth trends
  - Pie chart for revenue by event type
  - Bar chart for top venues/providers
  - Data table for recent transactions
- `DisputeResolution` - Handle disputed completions
  - Display both parties' evidence
  - Chat history viewer
  - Resolution decision buttons
  - Admin notes textarea
- `UserManagement` - Manage user accounts
  - User list with search
  - Filter by role and status
  - Suspend/unsuspend buttons
  - View user event history

**Shared Components:**
- `ImageGallery` - Photo gallery from Cloudinary
  - Thumbnail grid
  - Lightbox for full view
  - Navigation arrows
  - Zoom functionality
- `Rating` - Star rating display (read-only and interactive)
- `ReviewCard` - Individual review display
  - User avatar (anonymous)
  - Rating stars
  - Review text
  - Date posted
- `ImageComparisonSlider` - Before/after image slider
  - Draggable slider handle
  - Before label on left, After on right
  - Smooth transition
- `LoadingSpinner` - Loading animation
- `ErrorMessage` - Error alert with icon
- `SuccessMessage` - Success alert with icon
- `ConfirmationModal` - Reusable confirmation dialog
- `Tooltip` - Information tooltip on hover
- `Badge` - Status badge (pending, active, completed, etc.)
- `EmptyState` - Empty state illustration with CTA

### Implementation Steps

**Phase 1: Foundation (Week 1)**
1. Set up project structure with `uv`
   ```bash
   uv init strathwell-backend
   cd strathwell-backend
   uv add fastapi uvicorn pydantic pydantic-ai psycopg2-binary sqlalchemy alembic
   uv add python-jose[cryptography] passlib[bcrypt] python-multipart
   uv add stripe cloudinary pgvector python-dotenv
   uv add httpx aiofiles pillow
   ```
2. PostgreSQL database setup
   ```sql
   CREATE DATABASE strathwell;
   CREATE EXTENSION vector;
   ```
3. Alembic for migrations
4. Pydantic models for all entities
5. JWT authentication system with OTP email verification (use SMTP)
6. Basic FastAPI app structure with routers

**Phase 2: Core Backend (Week 2)**
1. User management endpoints (register, login, profile)
2. Venue onboarding endpoints (multi-step)
3. Service provider onboarding endpoints (multi-step)
4. Cloudinary integration
   - Image upload utility functions
   - URL generation
   - Folder structure (venues/, providers/, events/, templates/)
5. Admin approval workflow endpoints
6. Availability management (calendar CRUD)
7. Database seeding with sample data

**Phase 3: AI & RAG - CORE FEATURE (Week 3-4)**
1. Pydantic AI setup with NVIDIA NeMo (`nemotron-3-nano-30b-a3b`)
   ```bash
   uv add pydantic-ai nvidia-rag-client
   ```
2. Conversational agent implementation:
   - System prompt for event planning
   - Context management
   - Question chaining logic (2-3 questions per message)
   - Information extraction from user responses
3. Vector embeddings with pgvector:
   - Embed venue descriptions, photos metadata
   - Embed service provider portfolios
   - Embed successful templates
   - Similarity search queries
4. Template generation logic:
   - Query database for available venues (filtered by date, location, capacity, budget)
   - Query service providers (filtered by services needed, location, availability)
   - Rank by ratings and match score
   - Construct template JSON
5. **Google Imagen integration for before/after floor plans:**
   ```bash
   uv add google-cloud-aiplatform
   ```
   - Floor plan generation from venue specs
   - Event transformation visualization
   - Upload generated images to Cloudinary
   - Return URLs in template
6. Budget breakdown calculation
7. Timeline generation based on services

**Phase 4: Templates & Marketplace (Week 4-5)**
1. Template library endpoints
   - List featured templates
   - Template detail view
   - Template customization
   - Template usage tracking
2. Seed database with 10-15 high-quality featured templates
3. Marketplace endpoints:
   - Venue browsing with filters
   - Service provider browsing
   - Direct booking (without AI)
4. Search and filter logic (Elasticsearch optional for better search)

**Phase 5: Booking & Payments (Week 5-6)**
1. Event creation from template
2. Venue request system:
   - Send to top 3-4 venues simultaneously
   - First-come-first-served acceptance
   - Notify other venues when filled
3. **Stripe Connect integration:**
   ```bash
   uv add stripe
   ```
   - Create connected accounts for venues/providers during onboarding
   - Create payment intent for event total
   - Hold funds in escrow
   - Transfer funds on completion approval (minus 10%)
4. **Cancellation and refund logic:**
   - Calculate 90% refund
   - Process Stripe refund
   - Update availability
   - Send notifications
5. Commission calculation (10% platform fee)
6. Payment release workflow

**Phase 6: Chat & Task Completion (Week 6-7)**
1. Real-time chat system with WebSocket
   ```bash
   uv add websockets
   ```
2. Chat group creation on event confirmation
3. Anonymous participant naming
4. **Content guardrails implementation:**
   - Regex patterns for URLs, emails, phone numbers
   - Validation before saving message
   - Warning messages to user
   - Log blocked attempts
5. Task completion workflow:
   - Service provider completion request with photos
   - User approval interface
   - Payment release trigger
6. Dispute handling
7. Review system after completion


2. Install shadcn/ui components:
   ```bash
   npx shadcn-ui@latest add button card input label textarea
   npx shadcn-ui@latest add dialog dropdown-menu tabs badge
   npx shadcn-ui@latest add calendar select slider toast
   ```
3. Set up routing (React Router)
4. Authentication context and protected routes
5. API client setup (Axios)
6. WebSocket client for chat
7. Color palette and theme configuration
8. Global layouts (Navbar, Footer)

**Phase 8: Frontend - Core Features (Week 8-9)**
1. **Authentication UI:**
   - Login form
   - Registration form
   - OTP verification modal
   - Password reset flow
2. **AI Chat Interface (MAIN FEATURE):**
   - Chat UI with message bubbles
   - Template preview in chat
   - Before/after image comparison
   - Iteration controls
   - Approve/iterate buttons
3. **Template components:**
   - Template card for library
   - Full template detail view
   - Budget breakdown visualization (Chart.js or Recharts)
   - Service lineup grid
   - Timeline view
4. Home page with featured templates showcase

**Phase 9: Frontend - Onboarding & Marketplace (Week 9-10)**
1. **Onboarding wizards:**
   - Venue onboarding (7 steps)
   - Service provider onboarding (6 steps)
   - Progress indicator
   - Form validation
   - Photo upload with preview
   - Floor plan upload/generate UI
2. **Marketplace:**
   - Venue browsing with filters
   - Service provider browsing
   - Map view integration (Google Maps API)
   - Profile pages
3. **Event management:**
   - User dashboard with event list
   - Event detail page
   - Cancellation modal with refund info
   - Task completion interface for providers
   - Approval interface for users

**Phase 10: Frontend - Admin & Polish (Week 10-11)**
1. **Admin dashboard:**
   - Approval queue
   - Approval detail modal
   - Analytics dashboard with charts
   - Dispute resolution interface
   - User management
2. **Chat interface:**
   - Real-time messaging with WebSocket
   - Guardrails validation on client side
   - File upload for completion photos
3. **Review system:**
   - Review submission form
   - Review display on profiles
4. Mobile responsiveness
5. Accessibility improvements (ARIA labels, keyboard navigation)

**Phase 11: Integration & Testing (Week 11-12)**
1. Connect all frontend pages to backend APIs
2. End-to-end flow testing:
   - Registration → OTP → Login
   - AI Chat → Template Generation → Booking
   - Payment → Escrow → Completion → Release
   - Cancellation → Refund
3. Admin approval flows
4. Chat guardrails testing
5. Payment integration testing (Stripe test mode)
6. Load testing for concurrent venue requests
7. WebSocket stability testing

**Phase 12: Deployment & Launch (Week 12-13)**
1. Environment configuration for production
2. Database migration to production PostgreSQL
3. Deploy backend (AWS/GCP/Heroku)
4. Deploy frontend (Vercel/Netlify)
5. Stripe production keys
6. Cloudinary production setup
7. Domain and SSL setup
8. Monitoring and logging (Sentry)
9. Documentation (API docs with Swagger)
10. User onboarding flow documentation

### Code Quality Requirements

- **Follow code-simplifier principles:**
  - DRY (Don't Repeat Yourself) - Create reusable functions
  - Single Responsibility Principle - Each function/class does one thing
  - Keep functions small and focused (<50 lines)
  - Use clear, descriptive naming (no abbreviations)
  - Avoid premature optimization
  - Comment complex business logic
  
- **Type Safety:**
  - Use Pydantic models for ALL data validation
  - Define request/response schemas for each endpoint
  - TypeScript for frontend (recommended)
  
- **Error Handling:**
  - Proper try-catch blocks in all async operations
  - User-friendly error messages (not stack traces)
  - Log errors with context for debugging
  - Handle edge cases (no venue accepts, payment fails, etc.)
  
- **Security:**
  - NEVER store plain text passwords (use bcrypt)
  - Validate and sanitize ALL user inputs
  - Use parameterized queries (SQLAlchemy ORM)
  - Implement rate limiting on sensitive endpoints (login, OTP)
  - Secure JWT token handling (HTTP-only cookies)
  - CORS configuration for production
  - Input validation on both frontend and backend
  
- **Testing:**
  - Unit tests for critical business logic (payment calculations, commission, refunds)
  - Integration tests for API endpoints
  - E2E tests for core user flows (AI chat → booking → payment)
  
- **Performance:**
  - Database indexes on frequently queried columns
  - Lazy loading for images
  - Pagination for list endpoints
  - Caching for template library
  - WebSocket connection pooling
  - Optimize vector similarity search with appropriate index (HNSW or IVFFlat)

### Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/strathwell

# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@strathwell.com
SMTP_FROM_NAME=Strathwell

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_COMMISSION=0.10

# NVIDIA NeMo
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_API_BASE=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nemotron-3-nano-30b-a3b

# Google Imagen
GOOGLE_API_KEY=your-google-api-key
GOOGLE_PROJECT_ID=your-project-id
IMAGEN_MODEL=imagegeneration@006

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Misc
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

