# Frontend Agent Notes

## User Dashboard Redesign

### Current Status
- Phase 3 is complete.
- Organizer/User dashboard default landing now uses `OrganizerAIWorkspace`.
- Organizer AI workspace now includes a premium front-end chat experience in the center panel.
- Required documentation is updated in `docs/USERDASHBOARD_DEVELOPMENT_DOCUMENTATION.md`.

### Next Phase To Do
- Implement Phase 4: improve conversation quality, add session controls, and connect right-panel insights to chat context.

### Key Decisions
- Public website AI planner remains unchanged.
- Dashboard AI entry points no longer reuse the public AI planner page.
- Vendor and admin dashboards remain unchanged.
- Tablet behavior uses `Chat | Matches` segmented tabs (single panel visible at a time).
- Mobile behavior uses a `Sheet` drawer to open matches while keeping chat as the default view.
- Chat bubbles use role-based styles: assistant left/light bubble with icon, user right/teal bubble with `You` badge.
- Auto-scroll currently follows new messages to the bottom by default.
- Empty-state chips use click-to-send behavior for faster first prompt entry.
