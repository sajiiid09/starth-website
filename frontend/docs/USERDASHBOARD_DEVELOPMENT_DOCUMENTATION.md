# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

## Phase Checklist
- [x] Phase 1 - Foundations, routing switch, and documentation scaffolding
- [x] Phase 2 - 3-panel responsive workspace layout (chat + matches placeholders)
- [x] Phase 3 - Premium chat UI (dummy message loop, chips, sticky composer)
- [x] Phase 4 - Multi-session chat history in sidebar + local persistence
- [x] Phase 5 - Planner model + Zod validation + service boundary
- [ ] Phase 6 - RAG API implementation and right-panel intelligence orchestration

## Current Route Behavior (After Phase 5)
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
