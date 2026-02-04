# Strathwell - Frontend/Backend Integration

## Overview

This document describes the integration work completed to connect the Strathwell frontend (React/TypeScript) with the backend API (Python/FastAPI).

## What Was Integrated

### 1. API Client Infrastructure ✅

Created a complete API client layer to replace the mock Base44 client:

- **`frontend/src/api/client.js`** - Axios-based HTTP client with JWT token management and automatic token refresh
- **`frontend/src/api/auth.js`** - Authentication API service (login, signup, logout, me)
- **`frontend/src/api/services.js`** - Business logic APIs:
  - Vendors API (list, get, create, update, getStats)
  - Bookings API (CRUD operations, vendor approve/decline/counter)
  - Templates API (public listing and detail views)
  - Admin API (overview stats, vendor/template management)
  - Payments API (create intent, get summary)
- **`frontend/src/api/index.js`** - Central exports

### 2. Authentication System ✅

Implemented JWT-based authentication flow:

- **`frontend/src/contexts/AuthContext.tsx`** - React context for global auth state
  - Manages user session
  - Handles login/signup/logout
  - Provides role-based access control via `hasRole()`
  - Auto-refreshes tokens on 401 responses
- **`frontend/src/components/auth/AuthModal.tsx`** - Updated to use real API with email/password forms
- **`frontend/src/main.tsx`** - Wrapped app with `AuthProvider`

Token storage:
- Access token in `localStorage.access_token` 
- Refresh token in `localStorage.refresh_token`
- Auto-refresh via axios interceptor

### 3. Vendor Dashboard ✅

Connected vendor dashboard to real backend data:

- **`frontend/src/hooks/useVendorStats.ts`** - Custom hook to fetch vendor statistics
- **`frontend/src/pages/vendor/VendorDashboardHome.tsx`** - Updated to display:
  - Real inquiry count from bookings API
  - Actual listing views from vendor stats
  - Live inquiries from pending bookings

### 4. Admin Dashboard ✅

Connected admin dashboard to real backend data:

- **`frontend/src/hooks/useAdminOverview.ts`** - Custom hook to fetch admin overview
- **`frontend/src/pages/admin/AdminDashboardHome.tsx`** - Updated to display:
  - Total users count
  - Active vendors count
  - Templates count
  - Pending approvals count
  - Moderation queue items

### 5. Development Configuration ✅

- **`backend/.env`** - Created development environment file
- **`frontend/vite.config.js`** - Added proxy to forward `/api/*` requests to backend on port 8000
- **CORS** - Backend already configured to allow `localhost:3000` and `localhost:5173`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Port 3000)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ AuthContext (Global Auth State)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Client (Axios + JWT Interceptors)                  │ │
│  │   - Auto token refresh on 401                          │ │
│  │   - Auth header injection                              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Services                                           │ │
│  │   - auth, vendors, bookings, templates, admin, payments│ │
│  └────────────────────────────────────────────────────────┘ │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP (via Vite proxy /api → :8000)
             ↓
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Port 8000)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ FastAPI Application                                    │ │
│  │   - JWT Auth (access + refresh tokens)                 │ │
│  │   - Rate limiting, CORS, security headers              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ API Routes                                             │ │
│  │   /api/auth/*                                          │ │
│  │   /api/vendors/*                                       │ │
│  │   /api/bookings/*                                      │ │
│  │   /api/payments/*                                      │ │
│  │   /api/admin/*                                         │ │
│  │   /api/public/*                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL Database                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Running the Project

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 16+
- uv (Python package manager)

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Set up database
createdb strathwell  # or use your PostgreSQL setup
psql strathwell < schema.sql  # if needed

# Run migrations
uv run alembic upgrade head

# Start the server
uv run uvicorn app.main:app --reload --port 8000
```

The backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be available at http://localhost:3000 and will proxy API requests to the backend.

## Environment Variables

### Backend `.env`

```env
APP_ENV=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/strathwell
JWT_SECRET=dev-secret-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
STRIPE_SECRET_KEY=sk_test_placeholder
# ... see backend/.env for full list
```

### Frontend (optional)

Create `frontend/.env` if you need custom configuration:

```env
# If backend is on a different host/port
VITE_API_BASE_URL=http://localhost:8000
```

## Testing the Integration

1. **Start both servers** (backend on :8000, frontend on :3000)

2. **Test Authentication:**
   - Open http://localhost:3000
   - Click any "Sign in" button
   - Create an account (signup)
   - Login with credentials
   - Check browser DevTools → Application → Local Storage for tokens

3. **Test Vendor Dashboard:**
   - Login as a vendor user
   - Navigate to `/vendor/dashboard`
   - Should see real stats from backend (or 0s if no data)

4. **Test Admin Dashboard:**
   - Login as an admin user
   - Navigate to `/admin/dashboard`
   - Should see real platform stats from backend

## What's Still TODO

### High Priority

1. **Database Setup** - PostgreSQL needs to be running and seeded with initial data
2. **User Roles** - Backend needs to assign roles (user/vendor/admin) on signup
3. **Vendor ID Association** - Backend user model needs `vendor_id` field for vendor users
4. **Stripe Subscription Service** - Currently throws `NotImplementedError`
5. **Public Vendor/Template Pages** - Connect marketplace browsing to real data

### Medium Priority

1. **Venue/Service Listing Pages** - Replace mock data with API calls
2. **Booking Flow** - Complete end-to-end booking creation with Stripe
3. **Messaging System** - Connect chat/messaging UI to backend
4. **File Uploads** - Integrate S3/storage service for images
5. **Error Handling** - Add toast notifications for API errors throughout app

### Low Priority

1. **Testing** - Add unit/integration tests for API services
2. **TypeScript** - Convert all `.js` API files to `.ts`
3. **Loading States** - Add skeleton loaders throughout app
4. **Optimistic Updates** - Improve UX for mutations

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login (returns JWT tokens)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Vendors
- `GET /api/public/vendors` - List all vendors (public)
- `GET /api/public/vendors/{id}` - Get vendor details (public)
- `POST /api/vendors` - Create vendor profile (auth required)
- `PATCH /api/vendors/{id}` - Update vendor (auth required)
- `GET /api/vendors/{id}/stats` - Get vendor statistics (auth required)

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking details
- `POST /api/bookings/{id}/cancel` - Cancel booking
- `GET /api/bookings/vendor/{vendor_id}` - List vendor's bookings
- `POST /api/bookings/{id}/vendors/{vendor_id}/approve` - Vendor approves
- `POST /api/bookings/{id}/vendors/{vendor_id}/decline` - Vendor declines

### Admin
- `GET /api/admin/overview` - Dashboard statistics
- `GET /api/admin/vendors` - List all vendors (admin only)
- `GET /api/admin/templates` - List all templates (admin only)
- `POST /api/admin/templates` - Create template (admin only)

### Payments
- `POST /api/payments/intent` - Create Stripe payment intent
- `GET /api/payments/{booking_id}/summary` - Get payment summary

## Notes

- The frontend was originally scaffolded with Base44 (a no-code tool) which used mock data
- All mock data has been replaced with API calls in the integrated components
- Legacy Base44 code still exists but is no longer used in updated components
- The backend has comprehensive audit logging and security middleware built in
