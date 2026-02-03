# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

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

## Current Route Behavior (After Phase 10)
- `/dashboard` (user role): renders `OrganizerAIWorkspace` as the default landing page.
- `/dashboard/plan-with-ai` (user role): remains available and now renders `OrganizerAIWorkspace` as the dashboard AI workspace shell.
- `/ai-planner` (public website): unchanged and still uses the existing public AI planner implementation.
- `/vendor` and `/admin`: unchanged behavior and routing.

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
  - collapsible `Chat History` subsection
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

## How to Demo
- Reset credits:
  - use the out-of-credits `Upgrade` dialog and click `Reset to default`, or clear `strathwell_credits_v1` in localStorage.
- Show out-of-credits state:
  - set `strathwell_credits_v1` to `0` in localStorage or repeatedly send messages until credits reach zero.
- Show blueprint updates:
  - send inventory or budget prompts (for example: `need 250 chairs and 30 tables under $28k`) and observe KPI/inventory/budget updates in the Blueprint panel.
