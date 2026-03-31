# Roadmap: Agent Run Panel

**Defined:** 2026-03-31

## Phase 1: Project Setup & Mock Engine
**Goal:** Initialize a React+Vite project and implement the event stream fixture playback.
**Requirements:** UI-01, MOCK-01, MOCK-02, MOCK-03
**Success Criteria:**
1. Vite React project running successfully with Tailwind CSS.
2. The custom `useMockEventStream` hook correctly parses the JSON fixtures.
3. The hook emits events asynchronously mimicking real-time data arrival.
4. Empty state is appropriately handled before the run begins.

## Phase 2: Core Layout & Headers
**Goal:** Create the main layout and top-level run metadata.
**Requirements:** UI-02, UI-03
**Success Criteria:**
1. Run status updates and timer increments appropriately.
2. The final query and result display prominent data when complete.

## Phase 3: Task Visualization & Progress
**Goal:** Render task items and properly manage task state transitions over time.
**Requirements:** TSK-01, LIFE-01, LIFE-02, LIFE-03
**Success Criteria:**
1. New task events dynamically append to the TaskList UI.
2. Status correctly tracks from running -> failed -> retrying inline.
3. The cancelled (sufficient_data) case is neutral blue.

## Phase 4: Parallelization & Dependencies
**Goal:** Properly group parallel sub-tasks and demonstrate dependency relationships via UI layout/badges.
**Requirements:** TSK-02, TSK-03
**Success Criteria:**
1. Group tasks with the same `parallel_group` ID horizontally or bounded in a container.
2. Badges or text render `depends_on` relationships legibly without needing graphs.

## Phase 5: Drill-Down Events (Thoughts & Tools & Outputs)
**Goal:** Complete the feature set by wiring up partial strings, tool calls, and agent thoughts safely.
**Requirements:** EVT-01, EVT-02, EVT-03
**Success Criteria:**
1. Thought logs render correctly but don't overwhelm the user view.
2. Tool calls are rendered within their corresponding tasks.
3. `is_final: false` partial texts replace/animate realistically until the final text comes through.
