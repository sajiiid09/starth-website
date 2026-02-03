# Frontend Agent Notes

## User Dashboard Redesign

### Current Status
- Phase 7 is complete.
- Organizer/User dashboard default landing now uses `OrganizerAIWorkspace`.
- Organizer AI workspace now conditionally renders `BlueprintDetailPanel` from session `plannerState`, with right-panel mode switching.
- Required documentation is updated in `docs/USERDASHBOARD_DEVELOPMENT_DOCUMENTATION.md`.

### Next Phase To Do
- Implement Phase 8: wire blueprint actions (`Approve layout`) and connect deeper orchestration flows.

### Key Decisions
- Public website AI planner remains unchanged.
- Dashboard AI entry points no longer reuse the public AI planner page.
- Vendor and admin dashboards remain unchanged.
- Tablet behavior uses `Chat | Matches` segmented tabs (single panel visible at a time).
- Mobile behavior uses a `Sheet` drawer to open matches while keeping chat as the default view.
- Chat bubbles use role-based styles: assistant left/light bubble with icon, user right/teal bubble with `You` badge.
- Auto-scroll currently follows new messages to the bottom by default.
- Empty-state chips use click-to-send behavior for faster first prompt entry.
- Chat history renders only for organizer/user role under the `AI Planner` sidebar item as an independent collapsible section.
- Planner sessions persist in localStorage (`strathwell_planner_sessions_v2`) with active session tracking.
- UI now consumes `plannerService`; dummy mode is default (`VITE_DUMMY_PLANNER_MODE` defaults true), and API stub is ready for drop-in replacement.
- Runtime validation uses Zod schemas for planner model + storage payload hydration safety.
- Right panel rendering is now componentized in `RelevantMatchesPanel`, including tab persistence and card-level open actions.
- Blueprint detail rendering is strictly driven by `PlannerState` JSON (no freeform text parsing), with `rightPanelView` toggle behavior (`Matches | Blueprint`).
