# Frontend Agent Notes

## Immersive AI Editor Redesign (Rail + Co-pilot + Canvas)

### Status
- Phase 8 complete.
- Next: RAG integration (backend) with existing planner service contract.

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

### Key Files Across Phases
- `frontend/src/components/dashboard/DashboardShell.tsx` (organizer shell scope, rail/drawer wiring, focus-return handling)
- `frontend/src/features/immersive/RailNav.tsx` (icon rail + tooltips + menu trigger behavior)
- `frontend/src/features/immersive/NavDrawerOverlay.tsx` (overlay drawer, scrim, esc/click-close, focus management, scroll lock)
- `frontend/src/features/immersive/OrganizerImmersiveShell.tsx` (co-pilot/canvas layout + mobile preview sheet)
- `frontend/src/features/immersive/ZeroStateLanding.tsx` (strict prompt + 3-card zero state)
- `frontend/src/components/planner/PlanPreviewCanvas.tsx` (read-only canvas renderer)
- `frontend/src/pages/dashboard/OrganizerAIWorkspace.tsx` (scratch/template flow orchestration + service integration)
- `frontend/src/features/planner/services/plannerService.mock.ts` (scratch brief state machine + deferred generation)
- `frontend/src/features/planner/types.ts`, `frontend/src/features/planner/schemas.ts`, `frontend/src/features/planner/utils/storage.ts` (session model, validation, v4 migration/persistence)
