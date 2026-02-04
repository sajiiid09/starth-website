# Frontend Agent Notes

## Immersive AI Editor Redesign (Rail + Co-pilot + Canvas)

### Status
- Phase 7 complete.
- Phase 8 next.

### Key Decisions
- Rail icon strip (5%), Co-pilot persistent chat (25%), Canvas read-only preview (70%).
- Global nav is a floating overlay drawer (no workspace layout shift).
- No Matches tab, no matches session state, and no matches service payloads in organizer planner.
- Zero state stays strict: centered prompt + 3-card starter template grid only.
- Canvas is hidden in zero state; outside zero state it is a passive read-only viewport and stays blank until `planData` exists.
- Scratch mode delays canvas generation: AI collects required brief fields before blueprint creation.
- Template mode loads canvas immediately and starts with a change-request prompt.
- Rail + drawer behavior is scoped to organizer/user dashboard surfaces; vendor/admin and public pages remain unchanged.
- Planner sessions persist in `strathwell_planner_sessions_v4` with migration from legacy v3/v2 payloads.
- Canvas is a pure renderer (`PlanPreviewCanvas`); all planning edits flow through chat/service updates only.
