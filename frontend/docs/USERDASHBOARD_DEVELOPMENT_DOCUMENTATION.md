# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

## Phase Checklist
- [x] Phase 1 - Foundations, routing switch, and documentation scaffolding
- [x] Phase 2 - 3-panel responsive workspace layout (chat + matches placeholders)
- [x] Phase 3 - Premium chat UI (dummy message loop, chips, sticky composer)
- [x] Phase 4 - Multi-session chat history in sidebar + local persistence
- [ ] Phase 5 - Conversation quality pass, richer right-panel intelligence, and service extraction

## Current Route Behavior (After Phase 4)
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
  - sessions key: `strathwell_planner_sessions_v1`
  - active session key: `strathwell_planner_active_session_v1`
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
