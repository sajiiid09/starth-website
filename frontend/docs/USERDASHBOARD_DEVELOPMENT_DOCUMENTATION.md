# User Dashboard Development Documentation

## Overview
The Organizer/User dashboard is being redesigned so the post-login landing experience is a dedicated AI workspace shell. This decouples dashboard planning UX from the public website AI planner and sets a clean foundation for phased feature delivery.

## Phase Checklist
- [x] Phase 1 - Foundations, routing switch, and documentation scaffolding
- [x] Phase 2 - 3-panel responsive workspace layout (chat + matches placeholders)
- [ ] Phase 3 - Connected workflows, persistence, and UX refinement

## Current Route Behavior (After Phase 2)
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
- Phase 2 is placeholder-first: chat thread/composer and match cards are scaffolded for Phase 3 data integration.
