# Frontend Agent Notes

## Immersive AI Editor Redesign (Rail + Co-pilot + Canvas)

### Status
- Phase 5 complete.
- Phase 6 next.

### Key Decisions
- Rail icon strip (5%), Co-pilot persistent chat (25%), Canvas read-only preview (70%).
- Global nav is a floating overlay drawer (no workspace layout shift).
- No Matches tab, no matches session state, and no matches service payloads in organizer planner.
- Zero state stays strict: centered prompt + 3-card starter template grid only.
- Canvas is hidden in zero state; scratch prompt path keeps canvas deferred, template path shows canvas immediately.
- Rail + drawer behavior is scoped to organizer/user dashboard surfaces; vendor/admin and public pages remain unchanged.
- Planner sessions persist in `strathwell_planner_sessions_v3` with migration from legacy v2 payloads that dropped `matches`.
