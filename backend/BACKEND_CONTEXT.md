# Strathwell Backend Context & Product Spec (Living Doc)

> Purpose: Capture the shared understanding of Strathwell's product, payments, roles, and demo-to-production backend direction.
> This is a **living document** and will be updated as implementation evolves.
> Last updated: 2025-01-25

---

## 0) Tech Stack & Architecture

### Backend Framework
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and settings management
- **Pydantic AI**: AI service orchestration and tool calling
- **UV Package Manager**: Modern Python dependency management

### AI & ML Services
- **NVIDIA AI API**: RAG knowledge base queries and template generation
- **Google Cloud Vision - Nano Bana**: Floor plan and blueprint generation from venue images
- **Stripe Connect (Test Mode)**: Payment processing and escrow
- **Hybrid Content Moderation**: Regex + AI for message filtering

### Vector Database
- **PostgreSQL** with Alembic migrations
- **pgvector extension**: Built-in vector similarity (no external vector DB for MVP)

### Database
- **PostgreSQL** with Alembic ORM for entity management
- SQLAlchemy ORM for entity management

---

## 1) What Strathwell Is

Strathwell is an **AI-powered Event Planning OS** with:
- **Sequential AI chatbot**: Progressive 2-3 question flow for event planning
- **RAG-powered templates**: Customized event plans retrieved from knowledge base
- AI planner for event generation, orchestration, and guidance
- Templates/blueprints that represent "operating system" plans for events
- Blueprint generation from venue images using Google Cloud Vision
- Vendor + venue matching with first-to-accept logic
- Multi-vendor coordination with milestone-based payouts
- In-platform booking and payment orchestration (trust layer with escrow)
- Vendor rating and review system
- Dispute resolution workflow
- Off-platform prevention with hybrid message filtering

Strathwell is **NOT**:
- an event host
- a ticketing company
- an event reseller
- a service markup platform

Strathwell does not "sell events." It provides planning + coordination + payment rails between organizers and vendors.

---

## 2) Roles & Actor Types

### Roles in the system
- **Organizer (User)**: plans and books events (venue + services)
- **Vendor** (split into two subtypes):
  - **Venue Owner**: owns a venue/property and can be booked for hosting
  - **Service Provider**: provides services at events (catering, DJ, security, etc.)
- **Admin**: trust & safety, approvals, payout controls, moderation, disputes

### Vendor subtypes (important)
Vendor is split at onboarding/sign-up:
- `vendorType = venue_owner`
- `vendorType = service_provider`

Both vendor subtypes:
- can receive booking requests
- can be booked and paid inside of platform
- are subject to verification and payout controls
- have rating system (1-5 stars with subcategories)
- submit completion proofs for milestone-based payouts

---

## 3) Sequential AI Chatbot & RAG System

### 3.1 Progressive Question Flow

Chatbot asks 2-3 targeted questions sequentially (not all at once):

**Stage 1: Core Event Information**
- Event type? (wedding, corporate, party, etc.)
- Location? (city/state or "I have a venue")
- Guest count? (number or "TBD")

**Stage 2: Details Refinement (Conditional)**
- If needs venue:
  - Budget range?
  - Date/time preferences?
  - Event tone? (casual, luxury, tech-forward)
- If has venue:
  - What services needed? (catering, AV, decor, etc.)
  - Venue blueprint upload or generate from photos?

**Stage 3: Final Preferences**
- Special requirements? (outdoor, alcohol, accessibility, etc.)
- Timeline constraints? (rush, flexible, advance planning)
- Any other details?

### 3.2 RAG Knowledge Base

- **Vector Database**: PostgreSQL with **pgvector** extension
- **Embedding Model**: sentence-transformers (all-MiniLM-L6-v2)
- **Indexed Content**:
  - Template space plans (before/after layouts)
  - Service stacks (vendor categories + recommendations)
  - Budget simulations (breakdown + trade-offs)
  - Timelines (dependencies + milestones)
  - Risk & compliance layers (insurance, noise, capacity)
- **Query**: NVIDIA AI API for semantic search + template generation
- **Storage**: Use existing `dummyTemplates.ts` from frontend as initial knowledge base
  - **No synthetic data generation** (manual approach)

### 3.3 RAG + Sequential Integration

When user completes sequential questions:
1. Combine answers into context
2. Query pgvector with NVIDIA API for semantic similarity
3. Generate tailored plan JSON using retrieved template components
4. Display comprehensive blueprint with budget, timeline, vendor stack

---

## 4) Blueprint & Floor Plan Generation

### 4.1 Venue Image Upload

- Venue owners upload photos during registration
- Option A: Upload existing blueprint
- Option B: Upload venue photos → trigger AI blueprint generation

### 4.2 AI Blueprint Generation

- **Service**: Google Cloud Vision - Nano Bana
- **Process**:
  1. Analyze uploaded images for objects (tables, chairs, stages, walls)
  2. Estimate dimensions and room layout
  3. Generate SVG floor plan/blueprint
  4. Create two layout modes:
     - Optimized seating (comfortable, fewer guests)
     - Max capacity seating (congested but doable, more guests)
- **Output**: Structured blueprint JSON + visual SVG

### 4.3 Blueprint Storage

- Stored per venue profile
- Integrated with booking system for capacity validation
- Displayed in template details with "before → after" visualization

---

## 5) Vendor Registration & Portfolio System

### 5.1 Venue Owner Registration

**Multi-step wizard:**
1. Basic Info (venue name, location, capacity)
2. Blueprint Upload
   - Upload existing blueprint file OR
   - Upload photos → trigger AI generation
3. Availability Rules
   - Full-day rental OR specific time slots
   - Operating hours, blackout dates
4. Pricing Structure
   - Base rates
   - Time-based pricing
   - Capacity-based pricing
5. Review & Submit → Admin approval queue

### 5.2 Service Provider Registration

**Multi-step wizard:**
1. Business Info (name, category, service areas)
2. Portfolio Upload
   - Upload work samples (images)
   - Descriptions per sample
   - Categories served
3. Services & Pricing
   - Multiple services if applicable
   - Price ranges (min-max for search flexibility)
4. Availability Rules
   - Service availability calendar
5. Review & Submit → Admin approval queue

### 5.3 Admin Approval Workflow

- Admin reviews pending registrations
- View blueprints, portfolios, compliance flags
- Actions: Approve, Request Changes, Deny
- Status tracking: draft → submitted → pending → approved | needs_changes | denied

---

## 6) Templates as "Operating System" Blueprints

Templates are more than pretty event examples. Each template should include OS-grade planning elements:
- **Space Transformation Plan**
  - Before → After layout
  - Seating, AV, catering zones
  - Capacity logic (comfortable vs max doable)
  - Blueprint visuals (SVG/floor plans)
- **Service Stack**
  - Vendors selected for this event (not generic browsing)
  - Stack includes venue + providers + packages
  - Multi-service support
- **Budget Simulation**
  - Where money goes (breakdown by category)
  - Trade-offs and optimization suggestions
  - Margin awareness (10% platform fee visibility)
- **Timeline & Dependencies**
  - What happens when
  - What breaks if delayed
  - Milestones and checkpoints
- **Risk & Compliance Layer**
  - Insurance, noise, capacity, permits (even if abstracted)

### Venue data requirement
To support "space transformation" and capacity logic:
- Each venue needs **sq ft** and/or usable area data
- For showcased venues: at least **10 popular local venues** with:
  - sq ft
  - location
  - 2 layout scenarios:
    1) optimized seating (less guests)
    2) congested but doable seating (more guests)
  - Simplified blueprint visuals (generated from AI or uploaded)

**Source Data**:
- Primary: Use existing `frontend/src/data/dummyTemplates.ts` as initial knowledge base
- Secondary: Venue CSV files from `/Data/` directory:
  - `venues_rows.csv` (Boston-area venues - 97 venues)
  - `venues_sf_rows.csv` (San Francisco Bay Area venues - 72 venues)

**Venue CSV Structure** (both files):
- id, name, address, city, state, postcode
- lat, lng (geolocation for map-based search)
- capacity_min, capacity_max
- style, event_types
- External API IDs: google_place_id, yelp_business_id, foursquare_id, osm_id
- Quality metrics: event_friendly_score, data_quality_score
- Ratings: rating, user_ratings_total
- Contact info: phone, website, email

**Utilization**:
- Database seeding for initial venue inventory
- Geolocation-based search and filtering
- Integration with existing `dummyVendors.ts`
- Venue recommendations based on location, capacity, and quality scores
- Map-based venue search using lat/lng coordinates

---

## 7) Campaign/Partnership Data

### 7.1 Campaigns.csv Data Structure

**Location**: `/Data/Campaigns.csv`

**Affiliate/Partnership Campaigns**:
- Advertiser details: Advertiser ID, Name, URL, Category
- Program info: Program ID, Program Name, Logo URI, Terms Name, Active Date
- Tracking: Tracking Link, Allows Deep Linking, Payout structure
- Categories: Sports Apparel & Accessories, Website Hosting, Consumer Electronics, Apps, Software, etc.

**Example Campaigns**:
- 1st Phorm (Sports Apparel): 25%-100% commission
- Bluehost (Website Hosting): $65.00-$1,500.00 commission
- 99designs by Vista (Creative Digital Assets): USD5.00-USD40.00 commission
- TikTok for Business (Social Media): Creator tools partnerships
- Various apps and software services with commission structures

### 7.2 Campaign Data Utilization

**Recommended Services Catalog**:
- Build a partner services directory based on campaign categories
- Map campaigns to event service needs (e.g., Bluehost for event websites, TikTok for social media)
- Display partner services alongside local vendors in marketplace

**AI Planner Enhancement**:
- Use campaign data to enhance service recommendations
- Suggest partner services when user asks for specific needs
- Match campaigns to event types and budgets

**Partnership Management**:
- Track affiliate relationships and commissions
- Create referral tracking system
- Enable revenue opportunities through partner links

**Frontend Integration**:
- Partner service cards alongside vendor listings
- Category-based filtering for partner services
- Commission-aware pricing display

**Backend Implementation**:
- Campaign data loader script in `backend/scripts/`
- Alembic migration for campaigns table
- API endpoints for campaign/partnership management
- Service recommendation engine using campaign data

---

## 8) Subscription + Commission Monetization Model (Client-Approved)

### 7.1 Subscription = core product access

All users subscribe for **$20/month**:
- Organizers
- Venues
- Vendors (service providers)

Subscription covers:
- Access to AI planner (sequential chatbot + RAG)
- Templates and planning blueprints
- Vendor/venue matching
- Booking coordination + workflow tools

Subscription is for the AI OS product, not for hosting or selling events.

### 7.2 Booking payments happen inside Strathwell

When an organizer books a venue/vendor:
- Organizer pays **inside platform**
- Vendor/venue receives payment **inside platform**
- Strathwell orchestrates and tracks the transaction
- Strathwell does not sell the event

Payments can be:
- Deposits or full payments
- Split across multiple vendors
- Scheduled by milestones

### 7.3 10% commission only on successful bookings

Strathwell earns **10% commission** only when a booking occurs:
- Applied to vendor/venue booking line items
- Automatically calculated
- Deducted before vendor payout

Constraints:
- ❌ No commission without a booking
- ❌ No ticketing / event resale
- ❌ No markups on services

### 7.4 Platform-held, controlled payouts (trust & safety)

To protect all parties:
- Funds are temporarily held in-platform (escrow)
- Vendors can receive approved partial payouts (reservation deposits)
- Remaining balances released after:
  - Event completion, or
  - Organizer/admin confirmation
- **Milestone-based payouts**: Setup → Delivery → Completion
- Each vendor completes tasks separately with proof submission

This ensures:
- Organizers don't lose money if services fall through
- Vendors protected against last-minute cancellations
- Disputes and fraud minimized

---

## 9) Booking + Payment Flow (High-Level)

### 9.1 Core flow (approval-based, controlled payouts, first-to-win)

1. Organizer uses sequential AI chatbot → generates RAG-powered plan
2. Organizer reviews plan → submits booking request with selected vendors
3. Multiple vendors are notified simultaneously
4. **First vendor to accept wins** (others auto-declined)
5. Organizer pays deposit or full amount inside platform (Stripe)
6. Platform holds funds in escrow
7. Vendors submit completion proofs at checkpoints
8. Organizer approves each checkpoint → payouts released
9. Event completion → remaining balances released
10. Booking closed

### 9.2 Multi-vendor coordination

- Each vendor in booking has separate checkpoint schedule
- Vendors complete tasks independently
- Organizer approves each vendor's proofs separately
- Payouts released per vendor as checkpoints approved
- Dashboard tracks all vendors and payout progress

### 9.3 MVP simplification option (early stage)

We may initially implement manual admin-controlled releases while:
- Tracking ledger internally
- Modeling payout milestones
Then upgrade to automated payouts later.

---

## 10) Backend MVP: Core Entities (FastAPI + Pydantic)

### Users & access
```python
class User(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    password_hash: str
    roles: List[str]  # ["organizer", "venue_owner", "service_provider", "admin"]
    subscription_status: str  # "active", "past_due", "cancelled"
    subscription_ends_at: datetime | None
    created_at: datetime
    updated_at: datetime
```

### Vendor modeling
```python
class Vendor(BaseModel):
    id: UUID
    user_id: UUID
    vendor_type: Literal["venue_owner", "service_provider"]
    verification_status: Literal["draft", "submitted", "pending", "needs_changes", "approved"]
    payout_enabled: bool
    compliance_flags: JSONField  # {"insurance": False, "documents": ["pending"]}

class VenueProfile(BaseModel):
    id: UUID
    vendor_id: UUID
    venue_name: str
    location: dict  # {"city": "Boston", "state": "MA", "address": "..."}
    sq_ft: int
    capacity_comfortable: int
    capacity_max_doable: int
    availability_rules: JSONField  # {"full_day": True, "time_slots": [...], "blackout_dates": [...]}
    pricing_rules: JSONField  # {"base_rate": 5000, "time_based": [...], "capacity_based": [...]}
    layout_presets: JSONField  # {"optimized": {...}, "max": {...}}
    blueprint_source: Literal["upload", "ai_generated"]
    blueprint_file: str | None  # URL to uploaded blueprint
    ai_generation_source_image: str | None  # URL if AI-generated
    ai_generated_layout: JSONField | None  # If from image analysis

class ServiceProfile(BaseModel):
    id: UUID
    vendor_id: UUID
    categories: List[str]  # ["Catering", "AV", "Decor"]
    areas_coverage: List[str]  # ["Greater Boston", "All of MA"]
    per_category_pricing: JSONField  # {"Catering": {"min": 1500, "max": 5000}, ...}
    availability_rules: JSONField  # {"available_dates": [...], "blackout_dates": [...]}
    portfolio_assets: List[dict]  # [{"image_url": "...", "description": "...", "category": "..."}]
```

### Templates (pgvector-indexed)

```python
class Template(BaseModel):
    id: str
    title: str
    category: str  # "wedding", "corporate", "lecture", etc.
    description: str
    full_details: str

    # Blueprint sections
    space_plan: JSONField  # {"transformation": "...", "layout_modes": [...]}
    service_stack: JSONField  # [{"category": "venue", "name": "...", "reasoning": "..."}]
    budget_simulation: JSONField  # {"total": "...", "breakdown": [...], "trade_offs": [...]}
    timeline: JSONField  # [{"time": "...", "title": "...", "description": "..."}]
    risks: JSONField  # [{"title": "...", "description": "..."}]

    # Metadata for filtering
    recommended_vendor_stack: List[UUID]
    estimated_cost_ranges: JSONField  # {"min": 5000, "max": 15000}
    guest_count_range: JSONField  # {"min": 20, "max": 300}
    venue_requirement: JSONField | None  # If specific venue required

    # pgvector embedding (stored in PostgreSQL)
    embedding: List[float]  # pgvector extension field
```

### Marketplace listings (optional)
```python
class Listing(BaseModel):
    id: UUID
    vendor_id: UUID
    type: Literal["venue", "service"]
    title: str
    description: str
    tags: List[str]
    pricing: JSONField
    availability: JSONField
    location: dict
    assets: List[str]  # image/video URLs
    status: Literal["active", "inactive", "suspended"]
```

### Booking & approvals (multi-vendor support)
```python
class Booking(BaseModel):
    id: UUID
    organizer_id: UUID
    template_id: str | None  # From RAG plan

    # Event details
    event_details: JSONField  # {"date": "...", "time": "...", "guest_count": 60, "location": "..."}

    # Status machine
    status: Literal[
        "draft",
        "awaiting_vendor_approval",
        "ready_for_payment",
        "paid",
        "in_progress",
        "completed",
        "cancelled"
    ]

    # Financials
    vendor_total: Decimal
    platform_fee: Decimal  # 10%
    total_amount: Decimal  # vendor_total + platform_fee

    created_at: datetime
    updated_at: datetime

class BookingVendor(BaseModel):
    id: UUID
    booking_id: UUID
    vendor_id: UUID
    role_in_booking: Literal["venue", "service"]
    approval_status: Literal["pending", "approved", "declined", "countered"]
    agreed_price: Decimal
    agreed_scope: str

    # Milestone tracking
    payout_schedule: JSONField  # [{"checkpoint": "setup", "percent": 30}, ...]
    completion_checkpoints: JSONField  # [{"checkpoint": "setup", "completed": False, "proof": None}, ...]
    payout_released_percent: int  # 0-100
```

### Payments, ledger, payouts (Stripe Connect)
```python
class PaymentIntent(BaseModel):
    id: UUID
    booking_id: UUID
    payer_id: UUID  # organizer
    provider: Literal["stripe"]
    provider_id: str  # Stripe PaymentIntent ID
    status: Literal["pending", "paid", "failed", "refunded"]
    amount: Decimal

class LedgerEntry(BaseModel):
    id: UUID
    booking_id: UUID
    vendor_id: UUID | None
    type: Literal["held_funds", "platform_fee", "release", "payout", "refund"]
    amount: Decimal
    description: str
    timestamp: datetime

class Payout(BaseModel):
    id: UUID
    vendor_id: UUID
    booking_id: UUID
    booking_vendor_id: UUID  # Link to specific vendor in multi-vendor booking

    milestone: Literal["reservation", "completion"]
    amount: Decimal
    status: Literal["locked", "eligible", "paid", "reversed"]
    admin_approved_by: UUID | None
    stripe_transfer_id: str | None
```

### Ratings
```python
class VendorRating(BaseModel):
    id: UUID
    vendor_id: UUID
    rating_from_user: UUID  # organizer
    booking_id: UUID  # Only rate after completed booking

    # Rating fields
    overall_rating: int  # 1-5
    communication_rating: int  # 1-5
    professionalism_rating: int  # 1-5
    quality_rating: int  # 1-5

    written_review: str | None
    created_at: datetime
```

### Disputes
```python
class Dispute(BaseModel):
    id: UUID
    booking_id: UUID
    opened_by: UUID  # organizer or vendor
    against_vendor: UUID | None
    reason: str
    evidence_links: JSONField  # [image_urls, document_urls]
    status: Literal["open", "investigating", "resolved", "refunded", "partially_refunded", "rejected"]
    admin_notes: str | None
    resolution_action: str | None
    created_at: datetime
    resolved_at: datetime | None
```

### Message filtering
```python
class MessageFilterLog(BaseModel):
    id: UUID
    conversation_id: UUID
    message_text: str
    blocked: bool
    filter_type: Literal["regex_violation", "ai_detected"]
    reason: str
    confidence: float | None  # For AI detection
    timestamp: datetime
```

---

## 11) Policies We Must Decide (MVP Defaults)

### Payment structure
- Default: **deposit-first** (e.g., 20–40%)
- Remaining balance: before event or after completion

### Payout milestones
- Reservation payout: allowed portion after booking confirmation (admin supervised)
- Checkpoint payouts: setup, delivery, completion (multi-vendor support)
- Final payout: after completion confirmation

### Completion confirmation
- Organizer confirms completion OR admin confirms if needed
- Each vendor submits completion proof per checkpoint
- Organizer approves each checkpoint → payout released

### Commission application
- 10% applied only when booking payment captured/confirmed
- Deducted before payout

### Refund & cancellation policy
- Keep simple early; enforce via "hold then release" logic

### First-to-win vendor matching
- When multiple vendors match criteria, request sent to all
- First vendor to accept wins booking
- Other pending requests auto-declined with reason

---

## 12) Key UX/Product Constraints

- Sequential chatbot gates full plan generation (2-3 questions at a time)
- RAG enhances template customization from knowledge base
- Subscription gates AI planner and template access
- Booking payments occur inside platform with Stripe escrow
- No ticketing/resale/markups messaging anywhere
- Admin has visibility + control for trust and safety and payouts
- Multi-vendor coordination with independent checkpoint tracking
- System must support:
  - Multi-vendor bookings
  - Split payouts per vendor
  - Partial withdrawals with locked remainder
  - Completion proof submission
  - Organizer approval per checkpoint

---

## 13) Security & Trust Features

### 13.1 Off-Platform Prevention (Hybrid Filtering)

- **Phase 1: Regex pattern matching** (fast, obvious violations)
  - Phone numbers: `\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b`
  - Email addresses: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
  - URLs: `(https?://|www\.)[\w-]+(\.[\w-]+)+[/\w-?.]*`
  - Off-platform keywords: `\b(take off platform|outside|direct|call|text|email me)\s+(me|at|us)\b`

- **Phase 2: AI content moderation** (context-aware violations)
  - Use AI/NLP API to detect contextual attempts to move off-platform
  - Lower false positives compared to regex alone
  - Confidence scoring for moderation decisions

- **Enforcement**:
  - Block messages containing violations
  - Show warning with explanation
  - Suggest rewording
  - Log all blocked messages for audit

### 13.2 Vendor Ratings
- 1-5 star rating system
- Subcategory ratings: Communication, Professionalism, Quality
- Only after completed booking
- Aggregated averages displayed in marketplace
- Written reviews optional

### 13.3 Dispute Resolution
- Both organizer and vendor can open disputes
- Admin investigates with evidence review
- Resolution actions: refund to organizer, release payment to vendor, partial refund
- All disputes tracked and auditable

---

## 14) Implementation Notes (for backend tools/agents)

### Tech stack adherence
- Use **FastAPI** for all API endpoints (async/await patterns)
- Use **Pydantic** for request/response models (strict validation)
- Use **Pydantic AI** for AI service orchestration (tool calling)
- Use **UV** package manager for dependency management
- Follow clean code principles and Python best practices

### Vector Database: Neon PostgreSQL + pgvector
- Use **Neon DB** (managed PostgreSQL) with built-in pgvector extension
- No local PostgreSQL installation required
- Connection string format: `postgresql://user:pass@ep-xyz.region.aws.neon.tech/strathwell`
- Store embeddings as pgvector type field in Template model
- No external vector DB dependencies needed

### RAG system
- Treat NVIDIA AI API as RAG engine
- Index templates with pgvector in Neon PostgreSQL
- Use existing `dummyTemplates.ts` as initial knowledge base
- Retrieve relevant templates based on semantic similarity + filters
- Generate tailored plans combining retrieved template + user context

### Image processing
- Use **Google Cloud Vision - Nano Bana** for floor plan generation
- Detect objects, estimate dimensions, generate SVG layouts
- Store generated blueprints as structured data + visuals

### Marketplace orchestration
- Start with clear status machines (booking, approvals, payouts)
- Prefer provider-agnostic payment layer with Stripe Connect
- Store money movement in ledger model (audit trail)
- Implement first-to-win logic for vendor acceptance
- Keep first version operationally simple:
  - Manual admin approval for partial payouts is acceptable
  - Automation can be phased later

### Security implementation
- Implement hybrid filtering (regex + AI) for message safety
- Log all filter decisions for transparency
- Allow admin to override if false positive

### Database migrations
- Use **Alembic** for schema versioning
- Create incremental migrations for new features
- Test migrations on development database before production

### MVP Note: pgvector First Approach
- For MVP: Use pgvector in Neon PostgreSQL (built-in, no external dependencies)
- Template embeddings stored directly in templates table as vector column
- No migration needed from external vector databases

---

## 15) API Service Integration Details

### 15.1 NVIDIA AI API (RAG)
- **Purpose**: Template knowledge base queries + plan generation
- **Endpoints**: Chat completions with RAG context
- **Model**: NVIDIA's LLM with tool calling support
- **Rate limiting**: Implement caching and queue management
- **Cost management**: Track token usage and costs

### 15.2 Google Cloud Vision - Nano Bana
- **Purpose**: Floor plan and blueprint generation from venue images
- **Endpoints**: Image analysis (object detection, label detection)
- **Features**:
  - Object detection (furniture, walls, stages)
  - Dimension estimation
  - SVG blueprint generation
- **Error handling**: Retry logic, fallback to manual upload

### 15.3 Stripe Connect (Test Mode)
- **Purpose**: Payment processing and vendor payouts
- **Features**:
  - Connect accounts for vendors (onboarding flow)
  - Payment intents with application fees (10% commission)
  - Split payments to vendor accounts
  - Webhook handling for payment events
- **Test mode**: Use `pk_test_` and `sk_test_` keys
  - **Webhook secrets**: Secure storage in environment variables

---

## 16) Current State Reminder

Frontend is already designed and polished for demo, with:
- Home v2 design language across pages
- Template gallery + template details showcasing "OS" modules
- Marketplace and vendor showcase pages
- Basic AI planner UI (needs sequential chatbot upgrade)

Backend implementation begins now with:
- FastAPI + Pydantic architecture
- UV package manager for dependencies
- Sequential AI chatbot with RAG (NVIDIA)
- Blueprint generation (Google Nano Bana)
- Complete booking/payment system (Stripe Connect)
- Multi-vendor milestone tracking
- Security features (off-platform prevention, ratings, disputes)
- Admin workflows (vendor approval, dispute management)
- **Neon PostgreSQL + pgvector** (vector similarity in managed database)

This doc captures product/payment intent for correct implementation with updated tech stack.
