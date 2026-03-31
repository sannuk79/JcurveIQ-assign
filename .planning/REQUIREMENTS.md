# Requirements: Agent Run Panel

**Defined:** 2026-03-31
**Core Value:** Legibly visualize complex parallel agent execution to establish analyst trust without overwhelming them.

## v1 Requirements

### Core UI
- [ ] **UI-01**: Build AgentRunPanel (main container) with empty state handling
- [ ] **UI-02**: Build RunHeader showing query, status (running, complete, error), and elapsed time
- [ ] **UI-03**: Render prominent Final Output block when run is complete

### Task Visualization
- [ ] **TSK-01**: Render TaskItem showing label, agent, and status
- [ ] **TSK-02**: Implement parallel task grouping layout (horizontal clustering/visual indent)
- [ ] **TSK-03**: Render task dependency awareness (show "depends_on" text/badges)

### Event & Output Display
- [ ] **EVT-01**: Render Tool Call executions inside tasks
- [ ] **EVT-02**: Render Agent Thoughts (collapsible/de-emphasized)
- [ ] **EVT-03**: Render inline Partial Outputs (streaming effect)

### Lifecycle & Status Mapping
- [ ] **LIFE-01**: Map task_update events to status changes legibly
- [ ] **LIFE-02**: Render failed-to-retry transitions (show recovery inline)
- [ ] **LIFE-03**: Render "cancelled: sufficient_data" as neutral optimization, not failure

### Mocking Engine
- [ ] **MOCK-01**: Implement useMockEventStream hook/emitter
- [ ] **MOCK-02**: Replay run_success.json fixture with realistic setTimeout
- [ ] **MOCK-03**: Support swapping to run_error.json fixture

## v2 Requirements

(None - Fixed scope assessment)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend API | Assessment constraint |
| Node Graphs | Too complex, simple text/flex layout preferred |
| Component Libraries | Assessment constraint (use Tailwind only) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| MOCK-01 | Phase 2 | Pending |
| MOCK-02 | Phase 2 | Pending |
| MOCK-03 | Phase 2 | Pending |
| TSK-01 | Phase 3 | Pending |
| TSK-02 | Phase 3 | Pending |
| TSK-03 | Phase 3 | Pending |
| EVT-01 | Phase 4 | Pending |
| EVT-02 | Phase 4 | Pending |
| EVT-03 | Phase 4 | Pending |
| LIFE-01 | Phase 5 | Pending |
| LIFE-02 | Phase 5 | Pending |
| LIFE-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
