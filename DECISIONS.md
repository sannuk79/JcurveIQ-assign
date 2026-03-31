# Design Decisions

Here is my rationale for addressing the ambiguous requirements and UX goals of the Agent Run Panel.

### 1. How to show that `t_002`, `t_003`, and `t_004` are running in parallel, while `t_001` ran sequentially?
**Decision:** I used a combination of chronological ordering and visual grouping. Inside the `TaskList` component, a memoized derivation function parses the `parallel_group` attribute. If tasks share a group, they are encapsulated in a distinct, uniquely bordered Flex/Grid container that breaks the vertical rhythm, rendering them horizontally across desktop viewports. This makes parallelism immediately legible without complex node graph libraries.

### 2. How to handle `t_004` transitioning from running -> failed -> running -> cancelled?
**Decision:** The UI needs to accurately reflect recoverable state. The `TaskItem` component stores a `retryCount`. When a `task_update` event transitions from `failed` back to `running`, the reducer increments this count. The UI badges the task with `(Retry X)` so analysts know it isn't hanging. When it is finally cancelled due to `sufficient_data`, the styling flips to a neutral indigo/gray (rather than red) to convey that the skip was an optimization, not a system failure.

### 3. Where do `agent_thought` logs go? 
**Decision:** Financial analysts care about outputs, not debugging details. Therefore, `agent_thought` entries inside specific tasks are collected behind a generic "X Agent Thoughts" collapsible toggle. However, thoughts from the `coordinator` agent are placed at the top level in a distinct, subtly styled Coordinator feed, as they act as the "narrator" for the entire run.

### 4. How to represent `depends_on` relationships without a node graph?
**Decision:** Simplicity over complexity. Rather than drawing bezier curves between components, any task containing a `depends_on` array renders small "Depends: t_001" badges directly below the agent name. Because the UI unfolds temporally downwards, the analyst implicitly understands that newer tasks depend on the completed results above them.

### 5. `is_final: false` partial output handling
**Decision:** Partial strings are rendered inline but heavily styled using Tailwind's `animate-pulse` and a faded grey border to indicate "fluid" state. When a `partial_output` with `is_final: true` arrives, the block crystallises into a solid emerald background, pulsing stops, and the final quality score renders below it.
