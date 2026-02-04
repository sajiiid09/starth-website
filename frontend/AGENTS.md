# Frontend Agent Notes

## Immersive AI Editor Redesign (Rail + Co-pilot + Canvas)

### Status
- Phase 2 complete.
- Phase 3 next.

### Key Decisions
- Rail icon strip (5%), Co-pilot persistent chat (25%), Canvas read-only preview (70%).
- Global nav behaves like overlay drawer (no layout shift).
- No Matches tab.
- Zero state = centered prompt + 3-card template grid only.
- Canvas hidden during scratch flow until chain questions completed; template selection loads canvas immediately.
- Phase 2 scoping is organizer/user dashboard only; vendor/admin keep legacy sidebar and public pages/layout remain unchanged.

## User Dashboard Redesign

### Current Status
- Phase 9 and Phase 10 are complete.
- Organizer/User post-auth landing targets `OrganizerAIWorkspace` at `/dashboard/ai-planner`, while `/dashboard` is restored as overview home.
- Organizer AI workspace now supports interactive blueprint updates, approval flow, credits gating UI, and responsive polish in dummy orchestration mode.
- Required documentation is updated in `docs/USERDASHBOARD_DEVELOPMENT_DOCUMENTATION.md`.

### Next Phase To Do
- Next: RAG integration (backend) while keeping the existing planner service contract stable.

### Key Decisions
- Public website AI planner remains unchanged.
- Dashboard AI entry points no longer reuse the public AI planner page.
- Vendor and admin dashboards remain unchanged.
- Tablet behavior uses `Chat | Matches` segmented tabs (single panel visible at a time).
- Mobile behavior uses a `Sheet` drawer to open matches while keeping chat as the default view.
- Chat bubbles use role-based styles: assistant left/light bubble with icon, user right/teal bubble with `You` badge.
- Auto-scroll currently follows new messages to the bottom by default.
- Empty-state chips use click-to-send behavior for faster first prompt entry.
- Planner sessions render only for organizer/user role under the `AI Planner` sidebar item as an independent collapsible section (without a visible `Chat history` label).
- Planner sessions persist in localStorage (`strathwell_planner_sessions_v2`) with active session tracking.
- UI now consumes `plannerService`; dummy mode is default (`VITE_DUMMY_PLANNER_MODE` defaults true), and API stub is ready for drop-in replacement.
- Runtime validation uses Zod schemas for planner model + storage payload hydration safety.
- Right panel rendering is now componentized in `RelevantMatchesPanel`, including tab persistence and card-level open actions.
- Blueprint detail rendering is strictly driven by `PlannerState` JSON (no freeform text parsing), with `rightPanelView` toggle behavior (`Matches | Blueprint`).
- Blueprint updates now react to chat constraints (inventory/guests/budget) with lightweight visual section highlights and a persisted `plannerStateUpdatedAt` indicator.
- Credits UI is frontend-only and controlled by env flags (`VITE_ENABLE_CREDITS_UI`, `VITE_DEFAULT_CREDITS`, `VITE_CREDITS_PER_MESSAGE`).
- Credits are deducted immediately on send (when enabled); send is blocked when credits are insufficient.
- Upgrade action is demo-only (no payments/backend) and can add demo credits for walkthroughs.
- Credits persist via `strathwell_credits_v1`; planner sessions continue using `strathwell_planner_sessions_v2`.

## Frontend Polish Phase 1 (Routing Reliability)

### Status
- Done.

### What Changed
- Added `src/pages/NotFoundPage.tsx` with a friendly 404 experience and actions for `Go Home`, `Go Back`, and conditional `Go to Dashboard` for authenticated users.
- Added a catch-all route in `src/pages/index.tsx` (`path="*"`) to ensure unknown routes render the NotFound page instead of a blank screen.
- Consolidated obvious route aliases into redirects:
  - `/home` now redirects to `/` (canonical home route).
  - `/app-entry` and `/signin` now redirect to `/appentry` to preserve legacy links.
- Verified existing `ScrollToTop` behavior remains wired and reliable in the router wrapper; no redesign changes were introduced for dashboard surfaces.

## Frontend Polish Phase 3 (Route-Based Code Splitting)

### Status
- Done.

### What Changed
- Implemented route-based lazy loading in `src/pages/index.tsx` using `React.lazy` for most route components, including organizer dashboard, vendor dashboard, and admin dashboard pages.
- Added a reusable suspense fallback component at `src/components/RouteLoader.tsx` and wrapped route rendering with `Suspense` to show a lightweight loading state during chunk fetch.
- Kept route paths and page behavior unchanged; this is import/loading mechanics only to reduce upfront bundle loading on public pages.

## Frontend Polish Phase 2 (Router Architecture Cleanup)

### Status
- Done.

### What Changed
- Modularized the router into grouped route files under `src/pages/routes/`:
  - `PublicRoutes.tsx`
  - `AuthRoutes.tsx`
  - `DashboardRoutes.tsx`
  - `VendorRoutes.tsx`
  - `AdminRoutes.tsx`
- Added centralized lazy imports in `src/pages/routes/lazyPages.ts` and reused them across route groups.
- Simplified `src/pages/index.tsx` to compose route groups with existing wrappers (`Layout`, `ScrollToTop`, `Suspense`, `RouteLoader`) and keep catch-all NotFound routing at the end.

## Frontend Polish Phase 4 (Auth/API Hardening)

### Status
- Done.

### What Changed
- Hardened `src/api/httpClient.ts` so auth tokens are read immediately before each authenticated `fetch` call.
- Added centralized `401` handling in `httpClient`:
  - clears auth tokens
  - dispatches an `auth:unauthorized` event
  - redirects safely to `/appentry` (with loop guard when already on auth routes)
- Replaced brittle URL string concatenation with robust URL resolution/joining using `URL`, with validation and fallback for invalid `VITE_API_BASE_URL`.
- Standardized thrown API errors to consistently include `status`, `message`, and `details` via `HttpClientError`.
- Added `src/api/authStorage.ts` token helpers (`get/set/clear` access and refresh token utilities) and wired `httpClient` to use them.

## Frontend Polish Phase 6 (Organizer AI UX Polish)

### Status
- Done.

### What Changed
- Refined organizer AI workspace UX in `src/pages/dashboard/OrganizerAIWorkspace.tsx` with smoother empty state spacing/typography, helper text in composer (`Shift+Enter for a new line`), clearer disabled generate state, and improved long-text/link wrapping inside message bubbles.
- Added lightweight CSS-only micro-interactions (fade/slide bubble entry, right-panel transition, and faster blueprint section highlight fades) without introducing animation dependencies.
- Improved right-panel loading continuity during session switches by wiring loading skeleton behavior into:
  - `src/features/planner/components/RelevantMatchesPanel.tsx`
  - `src/features/planner/components/BlueprintDetailPanel.tsx`
- Tightened scroll ergonomics with explicit overscroll containment for chat and right-panel bodies while preserving sticky headers/composer behavior.
- Added small performance guardrails:
  - memoized message-thread rendering to avoid full thread recompute on every composer keystroke
  - debounced planner session localStorage persistence in `src/features/planner/PlannerSessionsContext.tsx`.

## Frontend Polish Phase 5 (TypeScript + Dependency Cleanup)

### Status
- Done.

### What Changed
- Migrated critical shared JS modules to TypeScript:
  - `src/lib/utils.js` -> `src/lib/utils.ts`
  - `src/api/entities.js` -> `src/api/entities.ts`
  - `src/api/functions.js` -> `src/api/functions.ts`
  - `src/api/integrations.js` -> `src/api/integrations.ts`
  - `src/api/base44Client.js` -> `src/api/base44Client.ts`
- Added lightweight explicit types to core API wrappers (entity/function/integration maps) while preserving existing export names and runtime behavior.
- Confirmed `lucide-react` imports remain named-import style (tree-shaking friendly); no namespace/default icon imports were introduced.

## Frontend Final UX Lock (Organizer Dashboard)

### Status
- Done.

### What Changed
- Organizer post-auth redirect now lands on the dashboard AI Planner route (`/dashboard/ai-planner`) for user/organizer role only; vendor/admin behavior remains unchanged.
- Restored Dashboard Home as a standard organizer overview page at `/dashboard` (`UserDashboardHome`), with AI Planner now isolated to `/dashboard/ai-planner`.
- Kept backward compatibility for existing links by redirecting `/dashboard/plan-with-ai` to `/dashboard/ai-planner`.
- Locked right panel behavior in `OrganizerAIWorkspace`:
  - tabs are always visible (`Matches | Blueprint`)
  - `Matches` always has default seeded items available pre-chat
  - `Blueprint` renders a blank white panel when no blueprint state exists.
- Removed the visible `Chat history` label in the organizer sidebar while keeping sessions list, active state, collapse control, and `New chat` action intact.
