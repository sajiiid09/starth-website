# Strathwell Backend Context & Product Spec (Living Doc)

> Purpose: Capture the shared understanding of Strathwell’s product, payments, roles, and demo-to-production backend direction.
> This is a **living document** and will be updated as implementation evolves.

---

## 1) What Strathwell Is

Strathwell is an **AI-powered Event Planning OS** with:
- AI planner for event generation, orchestration, and guidance
- Templates/blueprints that represent “operating system” plans for events
- Vendor + venue matching and coordination workflows
- In-platform booking and payment orchestration (trust layer)

Strathwell is **NOT**:
- an event host
- a ticketing company
- an event reseller
- a service markup platform

Strathwell does not “sell events.” It provides planning + coordination + payment rails between organizers and vendors.

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
- can be booked and paid inside the platform
- are subject to verification and payout controls

---

## 3) Templates as “Operating System” Blueprints

Templates are more than pretty event examples. Each template should include OS-grade planning elements:
- **Space Transformation Plan**
  - Before → After layout
  - seating, AV, catering zones
  - capacity logic
- **Service Stack**
  - vendors selected for this event (not generic browsing)
  - stack includes venue + providers + packages
- **Budget Simulation**
  - where money goes
  - trade-offs
  - margin awareness
- **Timeline & Dependencies**
  - what happens when
  - what breaks if delayed
- **Risk & Compliance Layer**
  - insurance, noise, capacity, permits (even if abstracted)

### Venue data requirement
To support “space transformation” and capacity logic:
- Each venue needs **sq ft** and/or usable area data.
- For showcased venues: at least **10 popular local venues** with:
  - sq ft
  - location
  - 2 layout scenarios:
    1) optimized seating (less guests)
    2) congested but doable seating (more guests)
  - simplified blueprint visuals

---

## 4) Subscription + Commission Monetization Model (Client-Approved)

### 4.1 Subscription = core product access
All users subscribe for **$20/month**:
- Organizers
- Venues
- Vendors (service providers)

Subscription covers:
- access to AI planner
- templates and planning blueprints
- vendor/venue matching
- booking coordination + workflow tools

Subscription is for the AI OS product, not for hosting or selling events.

### 4.2 Booking payments happen inside Strathwell
When an organizer books a venue/vendor:
- organizer pays **inside the platform**
- vendor/venue receives payment **inside the platform**
- Strathwell orchestrates and tracks the transaction
- Strathwell does not sell the event

Payments can be:
- deposits or full payments
- split across multiple vendors
- scheduled by milestones

### 4.3 10% commission only on successful bookings
Strathwell earns **10% commission** only when a booking occurs:
- applied to vendor/venue booking line items
- automatically calculated
- deducted before vendor payout

Constraints:
- ❌ no commission without a booking
- ❌ no ticketing / event resale
- ❌ no markups on services

### 4.4 Platform-held, controlled payouts (trust & safety)
To protect all parties:
- funds are temporarily held in-platform
- vendors can receive approved partial payouts (reservation deposits)
- remaining balances released after:
  - event completion, or
  - organizer/admin confirmation

This ensures:
- organizers don’t lose money if services fall through
- vendors protected against last-minute cancellations
- disputes and fraud minimized

---

## 5) Booking + Payment Flow (High-Level)

### Core flow (approval-based, controlled payouts)
1) Organizer selects template and submits booking request.
2) Vendors (venue + selected providers) are notified.
3) Required vendors approve (or propose changes).
4) Organizer pays deposit or full amount inside platform.
5) Platform holds funds; admin supervises payout eligibility.
6) Vendors can withdraw only allowed portion (reservation payout).
7) Event happens.
8) Completion confirmed (organizer or admin).
9) Remaining balances released; vendors withdraw rest.
10) Booking closed.

### MVP simplification option (early stage)
We may initially implement manual admin-controlled releases while:
- tracking ledger internally
- modeling payout milestones
Then upgrade to automated payouts later.

---

## 6) Backend MVP: Core Entities (Suggested)

### Users & access
- `User`
  - id, name, email, role (organizer/vendor/admin)
  - subscription status
  - createdAt, updatedAt

### Vendor modeling
- `Vendor`
  - id, userId
  - vendorType: `venue_owner` | `service_provider`
  - verificationStatus: draft | submitted | pending | needs_changes | approved
  - payoutEnabled, complianceFlags

- `VenueProfile` (for venue_owner)
  - vendorId
  - venueName
  - location
  - sqFt
  - capacityComfortable, capacityMaxDoable
  - availability rules
  - pricing rules
  - layout presets (2 modes)

- `ServiceProfile` (for service_provider)
  - vendorId
  - categories (multi-select)
  - areas/coverage (multi-select)
  - per-category pricing
  - availability rules
  - portfolio assets

### Templates
- `Template`
  - id, title, category (wedding/funeral/lecture/etc.)
  - description
  - blueprint sections: space plan, stack, timeline, budget, risks
  - recommended vendor stack references
  - estimated cost ranges

### Marketplace listings (optional)
- `Listing`
  - id, vendorId
  - type: venue | service
  - title, description, tags
  - pricing, availability, location
  - assets (images/videos)

### Booking & approvals
- `Booking`
  - id, organizerId
  - templateId (optional)
  - event details (date/time, guestCount, location)
  - status: draft → awaiting_vendor_approval → ready_for_payment → paid → in_progress → completed/cancelled
  - total amounts (gross, commission, net)
  - createdAt, updatedAt

- `BookingVendor`
  - bookingId, vendorId
  - roleInBooking: venue | service
  - approvalStatus: pending | approved | declined | countered
  - agreed price, agreed scope
  - payoutSchedule references

### Payments, ledger, payouts
- `PaymentIntent` (provider-agnostic)
  - bookingId
  - payerId (organizer)
  - provider: stripe/paypal/manual
  - providerId
  - status: pending | paid | failed | refunded
  - amount

- `LedgerEntry`
  - bookingId
  - vendorId (nullable)
  - type: held_funds | platform_fee | release | payout | refund
  - amount
  - timestamp

- `Payout`
  - vendorId, bookingId
  - milestone: reservation | completion
  - amount
  - status: locked | eligible | paid | reversed
  - adminApprovedBy (optional)

### Disputes (later)
- `Dispute`
  - bookingId
  - openedBy (organizer/vendor/admin)
  - reason, evidence links
  - status: open | resolved | refunded | adjusted

---

## 7) Policies We Must Decide (MVP Defaults)

### Payment structure
- Default: **deposit-first** (e.g., 20–40%)
- Remaining balance: before event or after completion

### Payout milestones
- Reservation payout: allowed portion after booking confirmation (admin supervised)
- Final payout: after completion confirmation

### Completion confirmation
- organizer confirms completion OR admin confirms if needed

### Commission application
- 10% applied only when booking payment captured/confirmed
- deducted before payout

### Refund & cancellation policy
- keep simple early; enforce via “hold then release” logic

---

## 8) Key UX/Product Constraints

- Subscription gates AI planner and template access.
- Booking payments occur inside platform.
- No ticketing/resale/markups messaging anywhere.
- Admin has visibility + control for trust & safety and payouts.
- System must support:
  - multi-vendor bookings
  - split payouts
  - partial withdrawals with locked remainder

---

## 9) Implementation Notes (for backend tools/agents)

- Treat this as a marketplace-like orchestration system.
- Start with clear status machines (booking, approvals, payouts).
- Prefer a provider-agnostic payment layer:
  - implement interfaces so Stripe/PayPal/manual can be swapped.
- Store money movement in a ledger model:
  - makes admin supervision and audit easy.
- Keep first version operationally simple:
  - manual admin approval for partial payouts is acceptable.
  - automation can be phased later.

---

## 10) Current State Reminder

Frontend is already designed and polished for demo, with:
- Home v2 design language across pages
- template gallery + template details showcasing “OS” modules
- AI planner UI
- marketplace and vendor showcase pages
Backend work begins now; this doc captures the product/payment intent for correct implementation.

---
