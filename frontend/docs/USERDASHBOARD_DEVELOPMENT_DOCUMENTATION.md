# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

## Immersive AI Editor Redesign (Rail + Co-pilot + Canvas)

### Locked UX Rules
- Rail icon strip (5%), Co-pilot persistent chat (25%), Canvas read-only preview (70%).
- Global nav behaves like overlay drawer (no layout shift).
- No Matches tab.
- Zero state = centered prompt + 3-card template grid only.
- Canvas hidden during scratch flow until chain questions completed; template selection loads canvas immediately.

### Phase Checklist (1–8)
- [Done] Phase 1 - Baseline audit + docs setup.
- [Done] Phase 2 - Navigation redesign (rail + floating overlay drawer, organizer scoped).
- [Done] Phase 3 - Workspace shell (persistent Co-pilot + Canvas containers).
- [Done] Phase 4 - Zero-state redesign (center prompt + 3 starter templates only).
- [Not Started] Phase 5 - Canvas read-only preview surface and data mapping.
- [Not Started] Phase 6 - Scratch/template branching behavior and canvas gating rules.
- [Not Started] Phase 7 - Session continuity, accessibility, and responsive pass.
- [Not Started] Phase 8 - QA hardening, regression checks, and rollout docs.

### Phase 2 Navigation Redesign (Implemented)
- Organizer dashboard now uses a thin icon rail (`w-16`) as the default nav surface.
- Organizer rail menu opens a fixed-position floating drawer overlay that sits over content and does not change workspace column widths.
- Overlay close behaviors implemented:
  - Escape key closes drawer.
  - Scrim/outside click closes drawer.
  - Selecting a nav link or planner session closes drawer.
- Overlay also locks body scroll while open and restores scroll on close.
- Scope safety:
  - Applied only to organizer/user dashboard shell.
  - Vendor/admin keep the existing full sidebar behavior.
  - Public website layout/pages are unchanged.
- Files added/modified for Phase 2:
  - `frontend/src/features/immersive/navItems.ts` (typed organizer nav config)
  - `frontend/src/features/immersive/RailNav.tsx` (icon rail + tooltips + menu trigger)
  - `frontend/src/features/immersive/NavDrawerOverlay.tsx` (floating drawer + scrim/close behavior)
  - `frontend/src/components/dashboard/DashboardShell.tsx` (organizer-only wiring and conditional sidebar scoping)

### Phase 3 Workspace Shell (Implemented)
- Added dedicated immersive shell component:
  - `frontend/src/features/immersive/OrganizerImmersiveShell.tsx`
  - Props: `copilot`, `canvas`, `showCanvas`, optional `topBar`.
- Organizer AI planner now renders through the shell in:
  - `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx`
- Layout model:
  - Desktop (`lg+`): split container with persistent Co-pilot left column (`clamp(22rem, 25vw, 26rem)`) and Canvas right column (`1fr`).
  - Tablet (`md` to `lg`): stacked layout (Co-pilot above Canvas).
  - Mobile (`<md`): Co-pilot only by default; Canvas opens via `Preview` button in a right-side `Sheet`.
- Scroll behavior:
  - Co-pilot and Canvas are both mounted in isolated overflow containers (`min-h-0` + internal scrolling components).
- Matches UI removal:
  - Removed organizer workspace `Matches` tab/toggle UI and related panel wiring from the planner route.
  - Planner session/service persistence remains intact; match data can still be stored but is not rendered in Phase 3.
- Files changed for Phase 3:
  - `frontend/src/features/immersive/OrganizerImmersiveShell.tsx`
  - `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx`

### Phase 4 Zero State Redesign (Implemented)
- Zero-state rule is enforced as a minimal surface only:
  - centered prompt composer
  - 3-card template preview grid directly below
  - no matches panel and no extra workspace sections.
- Added:
  - `frontend/src/features/immersive/ZeroStateLanding.tsx`
  - `frontend/src/features/immersive/data/starterTemplates.ts` (exactly 3 starter templates)
- Organizer planner wiring updates in:
  - `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx`
- Fresh-session bootstrap:
  - On first organizer planner load with no persisted planner storage, the route opens a fresh session so zero state is shown instead of seeded mock conversation content.
- Transition behavior:
  - Prompt submit from zero state -> exits zero state and starts Co-pilot chat flow; canvas visibility remains deferred until planning state exists (Phase 7 finalizes strict gating rules).
  - Template select from zero state -> exits zero state, seeds a template planner state + assistant follow-up message, and shows canvas immediately.
- Scope safety:
  - Organizer/user planner route only.
  - Vendor/admin dashboards unchanged.
  - Public website pages/layout unchanged.

### Current Code Map

#### Route files involved
- `frontend/src/pages/routes/DashboardRoutes.tsx`:
  - Organizer dashboard home route: `createPageUrl("Dashboard")` -> `/dashboard`.
  - Organizer AI planner route: `/dashboard/ai-planner` -> `PlanWithAI`.
  - Planner compatibility alias: `/dashboard/plan-with-ai` -> redirect to `/dashboard/ai-planner`.
  - Dashboard home alias: `/dashboard/home` -> redirect to `/dashboard`.
- `frontend/src/pages/routes/lazyPages.ts`: lazy route bindings for `PlanWithAI`, `OrganizerAIWorkspace`, and organizer dashboard pages.
- `frontend/src/pages/Layout.tsx`: dashboard route matcher (`/dashboard`, `/vendor`, `/admin`) and `DashboardShell` wrapper selection.
- `frontend/src/pages/routes/PublicRoutes.tsx`: public planner route (`createPageUrl("AIPlanner")` -> `/ai-planner`) remains separate from dashboard planner.
- `frontend/src/pages/AppEntry.tsx`: organizer post-auth redirect target is `/dashboard/ai-planner` via `getPostAuthRedirectPath`.

#### Layout + workspace components
- `frontend/src/components/dashboard/DashboardShell.tsx`: organizer dashboard shell with immersive rail + overlay drawer; vendor/admin keep legacy sidebar.
- `frontend/src/features/immersive/OrganizerImmersiveShell.tsx`: immersive workspace shell used by organizer planner route (Co-pilot + Canvas columns).
- `frontend/src/features/immersive/ZeroStateLanding.tsx`: zero-state minimal landing (center prompt + 3 template cards only).
- `frontend/src/features/immersive/data/starterTemplates.ts`: fixed three-card starter template data for zero state.
- `frontend/src/pages/dashboard/PlanWithAI.tsx`: route-level wrapper that renders `OrganizerAIWorkspace`.
- `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx`:
  - Chat surface (internal `ChatPanel` + `MessageThread`) mounted as Co-pilot.
  - Blueprint detail panel mounted as Canvas preview within immersive shell.
  - No `Matches` tabs/toggles rendered in organizer planner route.
  - Zero-state routing logic: show `ZeroStateLanding` when session has no messages and no planner state.
- `frontend/src/features/planner/components/RelevantMatchesPanel.tsx`: legacy component remains in repo but is not wired to organizer planner route in Phase 3.
- `frontend/src/features/planner/components/BlueprintDetailPanel.tsx`: current blueprint detail panel (closest current "canvas-ish" read-only structure).
- `frontend/src/features/planner/PlannerSessionsContext.tsx`: planner session lifecycle/provider used by dashboard shell + workspace.
- Legacy public planner (still in repo, not dashboard planner):
  - `frontend/src/pages/AIPlanner.tsx`
  - `frontend/src/components/planner/ChatInterface.tsx`
  - `frontend/src/components/planner/ResultsPanels.tsx`
  - `frontend/src/components/planner/PlannerPromptBox.tsx`

#### Current session storage + types
- Organizer role + dashboard session:
  - `frontend/src/utils/role.ts` -> localStorage key `activeRole` (`AppRole` + role mapping helpers).
  - `frontend/src/utils/session.ts` -> localStorage key `starth_session_state` (`SessionState` with role/vendor onboarding state).
- Planner sessions (dashboard AI workspace):
  - `frontend/src/features/planner/utils/storage.ts` -> localStorage key `strathwell_planner_sessions_v2`.
  - Payload schema (`version: 2`): `{ version, activeSessionId, sessions }`.
  - Types: `PlannerStoragePayload`, `PlannerSession`, `ChatMessage`, `MatchesState`, `PlannerState` from `frontend/src/features/planner/types.ts`.
  - Validation: `zPlannerSessionsPayload`, `zPlannerSession`, `zPlannerState` in `frontend/src/features/planner/schemas.ts`.
- Credits (planner gating, frontend-only):
  - `frontend/src/features/planner/credits/storage.ts` -> localStorage key `strathwell_credits_v1` (versioned credits payload).
- Auth/planner intent sessionStorage:
  - `frontend/src/utils/authSession.ts` -> sessionStorage key `currentUser`.
  - `frontend/src/utils/pendingIntent.ts` -> sessionStorage key `pendingPlannerIntent`.

## Phase Checklist
- [x] Phase 1 - Foundations, routing switch, and documentation scaffolding
- [x] Phase 2 - 3-panel responsive workspace layout (chat + matches placeholders)
- [x] Phase 3 - Premium chat UI (dummy message loop, chips, sticky composer)
- [x] Phase 4 - Multi-session chat history in sidebar + local persistence
- [x] Phase 5 - Planner model + Zod validation + service boundary
- [x] Phase 6 - Right panel `Relevant Matches` component wired to session state
- [x] Phase 7 - Blueprint detail panel rendered from `PlannerState`
- [x] Phase 8 - Interactive mock orchestration updates + approve flow
- [x] Phase 9 - Credits/usage gating UI (frontend-only)
- [x] Phase 10 - Polish, performance guardrails, and responsive QA

## Current Route Behavior (After Final UX Lock)
- `/dashboard` (user role): renders `UserDashboardHome` overview (not the AI workspace).
- `/dashboard/ai-planner` (user role): renders `OrganizerAIWorkspace` as the dashboard AI workspace.
- `/dashboard/plan-with-ai` (user role): preserved as a compatibility alias and redirects to `/dashboard/ai-planner`.
- `/ai-planner` (public website): unchanged and still uses the existing public AI planner implementation.
- `/vendor` and `/admin`: unchanged behavior and routing.

### Frontend Polish (Routing Reliability - Phase 1)
- Added a dedicated `NotFoundPage` and a catch-all route so unknown URLs now render a friendly 404 state instead of blank content.
- Routing reliability improved with low-risk canonical redirects (`/home` -> `/`, `/app-entry` -> `/appentry`, `/signin` -> `/appentry`) while keeping existing URL access paths valid.
- Existing organizer, vendor, and admin dashboard experiences were not redesigned as part of this polish pass.

### Frontend Polish (Phase 3 - Route-Based Code Splitting)
- Route components are now lazy loaded through the route registry with a shared suspense fallback loader.
- Organizer routes are lazy-loaded, including dashboard home and AI workspace (`/dashboard`, `/dashboard/ai-planner`), to reduce initial public-page bundle pressure.
- No dashboard UI or behavior changes were introduced in this phase.

### Frontend Polish (Phase 2 - Router Architecture Cleanup)
- Routing has been refactored from a single mega route file into grouped route modules with a shared lazy import map.
- This was an architecture cleanup only; route paths, role gating, layout behavior, and UI behavior remain unchanged.

### Frontend Polish (Phase 4 - Auth/API Hardening)
- The shared API client now includes stronger token handling, centralized `401` logout/redirect behavior, and safer base URL resolution.
- Error normalization was tightened in the HTTP layer to improve consistency for future backend/RAG service integration, without changing dashboard UI behavior.

### Frontend Polish (Phase 6 - UX Polish)
- Loading/empty states:
  - chat empty-state spacing and typography were refined for consistency
  - right-panel loading skeleton behavior now covers both Matches and Blueprint panels during session transitions
- Responsive behavior summary:
  - desktop keeps the chat + right-panel split with independent panel scroll
  - tablet keeps `Chat | Matches` segmented flow
  - mobile keeps chat-first with planner panel in a sheet overlay and fast return to chat on close
- Keyboard shortcuts and input UX:
  - Enter sends message
  - Shift+Enter inserts newline
  - composer includes helper text to communicate newline behavior
- Accessibility notes:
  - icon buttons include explicit `aria-label`s
  - focus-visible ring styling remains applied for keyboard navigation
  - chat message content now wraps long words and URLs more safely to prevent layout breaks.

### Frontend Polish (Phase 5 - TypeScript Standardization)
- Critical shared frontend modules in `src/api` and `src/lib` were migrated from `.js` to `.ts` with explicit wrapper types, while preserving behavior and existing import ergonomics.
- This improves compile-time safety and maintainability for future backend/RAG integration work, without changing dashboard UI behavior.

## Phase 2 Layout Behavior
- Desktop (`xl` and above): two-column main workspace inside dashboard content area with chat panel at ~62% width and matches panel at ~38% width.
- Tablet (`md` to `lg`): segmented toggle (`Chat | Matches`) shows one panel at a time for focus and lower visual density.
- Mobile (`<md`): chat panel is the default view; matches open via a `Sheet` drawer from an `Open Matches` action.

## Notes
- The left dashboard sidebar remains unchanged and continues to provide organizer navigation.
- Public AI planner pages remain untouched and are not reused in the dashboard workspace.
- Phase 2 established the responsive layout foundation; Phase 3 fills the middle panel with a usable front-end-only chat flow.

## Phase 3 Chat UI Implementation
- Sticky chat header now includes `Strathwell AI`, a small status dot, and `Ready to plan`.
- Thread supports left-aligned assistant bubbles (with Strathwell icon avatar) and right-aligned user bubbles (teal with `You` badge).
- Sending a message appends user text, then simulates assistant lifecycle states:
  - `Strath AI is thinking ...`
  - `Strath AI is orchestrating ...`
  - final dummy assistant response
- Auto-scroll behavior currently scrolls to bottom whenever new messages are appended.
- Empty state includes:
  - intro assistant message (`Hi! I'm your AI event planner...`)
  - quick prompt chips (click-to-send behavior)
- Sticky composer card includes:
  - auto-grow textarea (up to ~4 lines)
  - `Styles` placeholder control
  - attach/mic icon affordances (UI-only)
  - teal `Generate` action disabled when empty

## Screenshot Mapping Notes
- Header requirement maps to the sticky chat panel header in `OrganizerAIWorkspace`.
- Bubble alignment/colors map to role-based message rendering in the chat thread.
- Temporary thinking/orchestrating visuals map to assistant status transitions in timed state updates.
- Prompt chips and premium sticky composer map to the empty-state + footer composer sections.

## Phase 4 Session + Sidebar Integration
- Added planner session model:
  - `PlannerSession = { id, title, createdAt, updatedAt, messages }`
  - `messages` use the existing Phase 3 `ChatMessage` shape.
- Local persistence:
  - sessions key: `strathwell_planner_sessions_v2` (updated in Phase 5 payload format)
  - active session id is now stored inside the v2 payload
- First-load demo seeding now creates multiple realistic sessions for organizer users.
- Sidebar integration under organizer-only `AI Planner` item:
  - collapsible session list under AI Planner (label text removed in final UX lock)
  - active session highlighting
  - `+ New chat` action
  - session timestamp metadata
- Session behavior:
  - most recent session opens by default
  - new chat starts as `New plan`
  - first user message auto-titles session from the message lead words
  - switching sessions updates the central chat thread while preserving composer draft

## Role Gating Notes (Phase 4)
- Session provider and chat history sidebar UI are enabled only for organizer/user role.
- Vendor/admin dashboards keep their existing sidebar and behavior unchanged.

## Phase 5 Architecture (Service Boundary + Validation)
- Feature module structure added:
  - `src/features/planner/types.ts`
  - `src/features/planner/schemas.ts`
  - `src/features/planner/services/plannerService.ts`
  - `src/features/planner/services/plannerService.mock.ts`
  - `src/features/planner/services/plannerService.api.ts`
  - `src/features/planner/utils/storage.ts`
- UI/service flow (drop-in ready for RAG later):
  - `OrganizerAIWorkspace` sends user input through `plannerService.sendMessage(...)`
  - UI owns temporary thinking/orchestrating bubbles
  - service returns `{ assistantMessage, updatedPlannerState?, updatedMatches? }`
  - session state is updated + persisted via planner session context/storage helpers
- Runtime safety:
  - Zod schemas validate `ChatMessage`, `MatchItem`, `MatchesState`, `PlannerState`, and `PlannerSession`
  - planner storage payload validation guards localStorage hydration
  - `assertValidPlannerState` is used in mock generation/update paths
- Storage versioning:
  - active storage key: `strathwell_planner_sessions_v2`
  - payload contains version + active session id + full session list (messages, matches, plannerState)

## Phase 5 Data Model Notes
- `PlannerSession` now persists:
  - chat thread (`messages`)
  - right-panel tab/content (`matches`)
  - structured blueprint payload (`plannerState`, optional)
- Mock planner service behavior:
  - early turns ask clarifying questions
  - turn 3+ drafts blueprint and targeted matches
  - inventory-sensitive inputs (e.g. chairs/tables counts) adjust blueprint inventory and cost KPIs

## Phase 6 Right Panel Implementation
- New component: `src/features/planner/components/RelevantMatchesPanel.tsx`
  - Header: `RELEVANT MATCHES`
  - Title: `Curated templates and marketplace options.`
  - Subtitle line and segmented tabs (`Templates | Marketplace`)
  - Card list with square thumbnail, title, description, and arrow action button
- State wiring:
  - panel reads from active session `matches`
  - tab changes call session updater to persist `matches.activeTab`
  - chat responses applying `updatedMatches` from `plannerService.mock` reflect in real time
- Workspace integration:
  - `OrganizerAIWorkspace` now renders `RelevantMatchesPanel` across desktop/tablet/mobile modes
  - panel remains visible regardless of `plannerState` presence to keep layout stable
- Dummy data:
  - seed sessions include realistic match thumbnails
  - location-aware mock updates inject contextual template/marketplace items with images

## Phase 7 Blueprint Detail Panel
- New component: `src/features/planner/components/BlueprintDetailPanel.tsx`
  - renders strictly from structured `PlannerState` JSON
  - no text parsing heuristics for panel fields
- Blueprint panel sections implemented:
  - header (title, summary, status badge, `Approve layout` UI button)
  - KPI cards (`Total Cost`, `Cost / Attendee`, `Execution Confidence`)
  - space transformation (`Before` / `After` + inventory grid)
  - timeline/dependencies vertical list
  - budget simulation (lightweight SVG donut + breakdown + tradeoff note)
- Right panel mode behavior in `OrganizerAIWorkspace`:
  - local state: `rightPanelView: 'matches' | 'blueprint'`
  - if active session has `plannerState`, default panel mode becomes `blueprint`
  - users can switch via a top segmented toggle (`Matches | Blueprint`)
  - if no `plannerState`, panel falls back to `RelevantMatchesPanel`
- Responsive behavior:
  - desktop right column uses the same mode toggle + conditional panel rendering
  - tablet `matches` tab and mobile sheet reuse identical right-panel mode logic

## Phase 8 Interactive Mock Orchestration
- `plannerService.mock.sendMessage(...)` now applies deterministic intent rules:
  - inventory intents (`chairs`, `tables`, `stage`, `buffet`) update `spacePlan.inventory`
  - guest count intents adjust attendee assumptions and KPI efficiency
  - budget-constraint intents rebalance budget breakdown and tradeoff note
  - confidence shifts up/down based on consistency vs conflicts (e.g., tight budget vs requested inventory)
- Session model extension:
  - `PlannerSession.plannerStateUpdatedAt` is now persisted for recency indicators
- Blueprint panel UX:
  - header shows live recency label (`Updated just now`, `Updated Xm ago`)
  - lightweight section highlight on planner updates (KPI row, inventory, timeline, budget, header)
  - highlights use simple Tailwind transition classes (no heavy animation runtime)
- Approve flow (UI-only, session-backed):
  - `Approve layout` sets `plannerState.status = 'approved'`
  - adds an assistant acknowledgment message to the thread
  - writes `plannerStateUpdatedAt` + session `updatedAt`, then persists to storage

## Phase 9 Credits UI (Frontend Only)
- Added env flags in `.env.example`:
  - `VITE_ENABLE_CREDITS_UI=true`
  - `VITE_DEFAULT_CREDITS=120`
  - `VITE_CREDITS_PER_MESSAGE=1`
- Added credits module:
  - `src/features/planner/credits/types.ts`
  - `src/features/planner/credits/storage.ts`
  - `src/features/planner/credits/useCredits.ts`
- Storage:
  - key: `strathwell_credits_v1`
  - versioned payload with credits + updatedAt
- Behavior:
  - credit badge appears in chat header (`Credits: N`) when enabled
  - deduction happens immediately on send
  - `Generate` is blocked when credits are below message cost
  - out-of-credits banner appears with `Upgrade` CTA
  - upgrade dialog is UI-only with demo actions (`Add demo credits`, `Reset to default`)
- Planner sessions and planner state persistence remain unchanged (`strathwell_planner_sessions_v2`).

## Phase 10 Polish / Mobile / Accessibility
- Added lightweight transitions (`duration-200`) for chat bubbles, right-panel switching, and card interactions.
- Added skeleton fallback rendering for missing/empty right-panel data in:
  - `RelevantMatchesPanel`
  - `BlueprintDetailPanel` timeline and budget sections
- Accessibility + keyboard UX:
  - Enter sends / Shift+Enter newline preserved in composer
  - icon-only actions now include `aria-label` attributes
  - focus-visible ring styles applied to key interactive controls
- Responsive QA:
  - desktop keeps 3-segment layout
  - tablet keeps segmented `Chat | Matches`
  - mobile keeps chat-first with right panel in sheet drawer and independent panel scroll
- Performance guardrails:
  - message sorting moved to `useMemo` in chat panel
  - persistence remains event-driven (send/session updates), not per-keystroke.

## Final UX Rules (Locked)
- 3-panel organizer dashboard workspace remains fixed in structure:
  - left dashboard sidebar
  - middle chat panel
  - right planner panel with `Matches | Blueprint` tabs
- Right panel defaults:
  - `Matches` always shows seeded/default items, including pre-chat states
  - `Blueprint` shows a blank white panel if no blueprint state exists (no placeholder text)
- Dashboard route separation is locked:
  - `/dashboard` = organizer overview home
  - `/dashboard/ai-planner` = organizer AI workspace
  - `/dashboard/plan-with-ai` = compatibility redirect to `/dashboard/ai-planner`
- Organizer post-auth landing behavior is locked to AI workspace route (`/dashboard/ai-planner`), while vendor/admin post-auth behavior remains unchanged.
- Sidebar polish:
  - `Chat history` heading text is removed
  - sessions list, active highlighting, collapse/expand behavior, and `New chat` action remain intact.

## How to Demo
- Reset credits:
  - use the out-of-credits `Upgrade` dialog and click `Reset to default`, or clear `strathwell_credits_v1` in localStorage.
- Show out-of-credits state:
  - set `strathwell_credits_v1` to `0` in localStorage or repeatedly send messages until credits reach zero.
- Show blueprint updates:
  - send inventory or budget prompts (for example: `need 250 chairs and 30 tables under $28k`) and observe KPI/inventory/budget updates in the Blueprint panel.
