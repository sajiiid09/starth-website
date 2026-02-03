# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

## Phase Checklist
- [x] Phase 1 - Foundations, routing switch, and documentation scaffolding
- [ ] Phase 2 - Chat-first workspace body and right-side planning context panel
- [ ] Phase 3 - Connected workflows, persistence, and UX refinement

## Current Route Behavior (After Phase 1)
- `/dashboard` (user role): renders `OrganizerAIWorkspace` as the default landing page.
- `/dashboard/plan-with-ai` (user role): remains available and now renders `OrganizerAIWorkspace` as the dashboard AI workspace shell.
- `/ai-planner` (public website): unchanged and still uses the existing public AI planner implementation.
- `/vendor` and `/admin`: unchanged behavior and routing.

## Notes
- Phase 1 intentionally ships a lightweight shell only; interactive chat/planning panels are planned for the next phase.
