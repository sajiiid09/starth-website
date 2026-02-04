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
- [Done] Phase 5 - Remove Matches state/UI/service plumbing completely.
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
  - Later completed in Phase 5 by removing matches from planner session/service types and storage migration.
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

### Phase 5 Remove Matches Completely (Implemented)
- Matches functionality is fully removed from organizer planner architecture:
  - no Matches tab
  - no Matches UI component wiring
  - no matches/session field in planner types
  - no `updatedMatches` return path in planner service responses.
- Planner model now keeps only:
  - chat session thread (`messages`)
  - optional `plannerState` (blueprint/canvas data)
  - session metadata (`id`, `title`, timestamps).
- Storage version bump + migration:
  - new storage key: `strathwell_planner_sessions_v3`
  - legacy v2 payloads (`strathwell_planner_sessions_v2`) are migrated on load by safely dropping legacy `matches` fields.
  - migrated payload is persisted to v3 and legacy key is cleared.
- Planner mock service updates:
  - no template/marketplace matches generation in planner service mock.
  - `sendMessage` now returns only `assistantMessage` and optional `updatedPlannerState`.
- Files changed for Phase 5:
  - `frontend/src/features/planner/types.ts`
  - `frontend/src/features/planner/schemas.ts`
  - `frontend/src/features/planner/utils/storage.ts`
  - `frontend/src/features/planner/PlannerSessionsContext.tsx`
  - `frontend/src/features/planner/services/plannerService.mock.ts`
  - `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx`
  - deleted: `frontend/src/features/planner/components/RelevantMatchesPanel.tsx`

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
  - `frontend/src/features/planner/utils/storage.ts` -> localStorage key `strathwell_planner_sessions_v3`.
  - Payload schema (`version: 3`): `{ version, activeSessionId, sessions }`.
  - Migration: reads legacy `strathwell_planner_sessions_v2`, drops legacy `matches`, validates, and rewrites to v3.
  - Types: `PlannerStoragePayload`, `PlannerSession`, `ChatMessage`, `PlannerState` from `frontend/src/features/planner/types.ts`.
  - Validation: `zPlannerSessionsPayload`, `zPlannerSession`, `zPlannerState` in `frontend/src/features/planner/schemas.ts`.
- Credits (planner gating, frontend-only):
  - `frontend/src/features/planner/credits/storage.ts` -> localStorage key `strathwell_credits_v1` (versioned credits payload).
- Auth/planner intent sessionStorage:
  - `frontend/src/utils/authSession.ts` -> sessionStorage key `currentUser`.
  - `frontend/src/utils/pendingIntent.ts` -> sessionStorage key `pendingPlannerIntent`.


## Historical Notes
- Pre-immersive dashboard implementation notes were intentionally archived to prevent conflicts with the current planner architecture.
- Treat the sections above (`Immersive AI Editor Redesign` and `Current Code Map`) as the authoritative source for active organizer planner behavior.
