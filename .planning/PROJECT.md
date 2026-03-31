# Agent Run Panel

## What This Is

A standalone React component that shows a live agent run unfolding in real time. It makes the complex process of a multi-agent orchestrated pipeline (tools calls, partial outputs, failures, retries) legible to non-technical financial analysts, giving them enough visibility to trust the final system output.

## Core Value

Legibly visualize complex parallel agent execution to establish analyst trust without overwhelming them with debug information.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Build standalone React component AgentRunPanel
- [ ] Render RunHeader with query, top-level status, and elapsed time
- [ ] Render TaskList with grouped/indent-clustered Parallel Tasks
- [ ] Show Task state changes (running -> failed -> running -> cancelled)
- [ ] Visualize Tool Calls made within tasks
- [ ] Render Agent Thoughts (collapsible/subtle)
- [ ] Render streaming Partial Outputs
- [ ] Prominent display for Final Output
- [ ] Handle Mock Event Stream correctly with timeouts for realistic timing

### Out of Scope

- Backend Implementation — purely a frontend assessment, mocked backend.
- Complex graph visualisations — use simple indentation/flex instead of node graphs.
- Use of pre-built UI components — shadcn, MUI, Ant Design are forbidden. Use Tailwind CSS.

## Context

- Take-Home Assessment for JcurveIQ Frontend Engineer role.
- Time budget: 5-9 hours. 
- Must use standard React & Tailwind.
- The state machine must handle events over time using fixture playback.

## Constraints

- **Tech Stack**: React + Tailwind CSS — explicitly forbidden to use component libraries.
- **Data Source**: Mock local fixture data only — no real backend.
- **Timing**: Real-time evaluation — mock emitter must use `setTimeout` to unfold events realistically, not all at once.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Parallel Layout | Visual indentation + horizontal flex | — Pending |
| Dependency Display | Badges/Text references only, no graph | — Pending |
| Partial Output | Collapsible blocks, replaces with final | — Pending |
| Thoughts | Hidden by default, accessible via toggle | — Pending |
| Cancelled Status | Neutral Blue, "Skipped (Sufficient Data)" | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
