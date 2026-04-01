# Design Decisions - Agent Run Panel

This document explains the reasoning behind key design decisions for the Agent Run Panel. Each section covers what I decided, why I chose that approach, and what signals or data would cause me to reconsider.

---

## 1. Agent Thoughts Display

**Decision:** Show only coordinator thoughts in a collapsible amber section at the top of the panel. Task-level thoughts are not displayed. The section is collapsed by default with an expand toggle.

**Why:**

The primary users are financial analysts, not developers debugging the system. They care about *what* the system is doing and *what result* it produced—not the internal monologue of every agent. However, showing the coordinator's initial plan serves an important trust-building function: it lets users understand the strategy before execution begins.

The collapsible design respects both user types:
- **Analysts** can glance at the summary or keep it collapsed
- **Developers/Power users** can expand to see the reasoning

The amber color visually distinguishes thoughts from actual outputs (green) and running tasks (blue), creating a clear information hierarchy.

**Would Reconsider If:**

User research shows that analysts want deeper visibility into individual agent reasoning during execution—for example, if they frequently ask "why did the filing_fetcher choose that search query?" Or if we add an internal "debug mode" for the engineering team, task-level thoughts could be exposed there with a toggle.

---

## 2. Parallel Task Layout

**Decision:** Display parallel tasks (tasks with the same `parallel_group`) in a horizontal grid layout (1-3 columns depending on screen size) with a visual group header showing "⚡ Parallel Group: [name] (N tasks)".

**Why:**

A vertical list would make parallel tasks look sequential, which contradicts the actual execution model. The horizontal grid immediately communicates simultaneity—users can see at a glance that these tasks are "happening together."

The group header serves two purposes:
1. Explicitly labels the parallelism (no ambiguity)
2. Shows the count, so users know how many tasks to expect

The responsive grid (1 → 2 → 3 columns) ensures readability across screen sizes without horizontal scrolling.

**Would Reconsider If:**

We have runs with many parallel tasks (e.g., 10+ peer fetches). In that case, a scrollable horizontal carousel or a "show N more" expandable pattern would be better. Alternatively, if users need to compare parallel task outputs side-by-side frequently, a dedicated comparison view might be warranted.

---

## 3. Partial Outputs (Streaming)

**Decision:** Show partial outputs (`is_final: false`) inline under each task as "Streaming Updates" in a dedicated section. When a final output arrives, it's displayed prominently with a quality score, and partial outputs remain visible but visually de-emphasized.

**Why:**

Partial outputs serve a real-time feedback function—they tell users "work is happening, here's what we've found so far." Hiding them would make the UI feel unresponsive during long-running tasks.

However, they shouldn't compete with the final output. The design separates them:
- **Streaming Updates** - Smaller text, gray background, shows progress
- **Final Output** - Larger text, white background, quality score badge

This gives users the best of both worlds: real-time visibility during execution, and a clear "hero" output when the task completes.

**Would Reconsider If:**

Analytics show that users never read partial outputs, or if partial outputs are frequently incorrect/misleading (causing confusion). In that case, we could collapse them into a "View updates (N)" dropdown that only shows when clicked, or display only the latest partial output and discard previous ones.

---

## 4. Cancelled State Treatment (sufficient_data)

**Decision:** Display `cancelled` with `reason: "sufficient_data"` as a **neutral** state using slate/gray colors (not red), the label "Skipped" (not "Cancelled"), and the ⊘ icon. The cancel message is shown inline as informational text.

**Why:**

This is critically important: `sufficient_data` cancellation is **not a failure**. It's an intelligent optimization where the coordinator decided it had enough data from other parallel tasks and stopped redundant work. Treating this as an error would:
1. Alarm users unnecessarily
2. Undermine trust in the system's decision-making
3. Misrepresent what actually happened

The neutral slate color and "Skipped" label communicate "this was intentionally not done" without negative connotations. The ⊘ symbol (circled slash) is universally understood as "not applicable" rather than "error."

**Would Reconsider If:**

User testing shows that analysts don't understand why a task was "Skipped" and interpret it as incomplete work. In that case, we might use a more positive framing like "Optimized Out ✓" with a checkmark, or add an explainer tooltip: "Coordinator had enough data from other tasks—this skip saved 15 seconds."

---

## 5. Task Dependency Visualization

**Decision:** Show dependencies as small text badges on each task card: "📎 Depends: t_001, t_002, t_003". Do not draw a dependency graph. If a dependency was cancelled (e.g., t_004), it is not shown in the dependency list—the synthesis task simply lists its completed dependencies.

**Why:**

The target users (analysts) care about *what* was done, not the graph structure. A visual DAG would:
1. Add significant implementation complexity
2. Consume valuable screen space
3. Potentially confuse non-technical users

The text badge approach is minimal and sufficient: it shows which tasks fed into the synthesis without requiring users to trace lines across a diagram.

Regarding cancelled dependencies: the coordinator already handled this decision. If t_004 was cancelled but synthesis proceeded, that means the coordinator determined t_004 wasn't essential. Showing it in the dependency list would create confusion ("why is this greyed out?"). The UI reflects the coordinator's resolved state, not the original plan.

**Would Reconsider If:**

We start handling runs with complex dependency chains (20+ tasks with interdependencies). In that case, a mini-map or expandable graph view would help users understand the execution structure. Alternatively, if power users request it for debugging purposes, a "Show dependency graph" toggle could be added without cluttering the default view.

---

## 6. Project Setup Using Custom CLI Tool

**Decision:** Used a custom CLI tool to scaffold the project with React, Vite, and Tailwind CSS instead of manual setup commands.

**Why:**

The CLI tool automates the initial project setup in a single command, handling:
- Vite + React + TypeScript template initialization
- Tailwind CSS configuration
- Clean folder structure setup
- Removal of boilerplate files

This approach ensures consistency across projects and reduces setup time from 10-15 minutes to a single command. The tool handles all the repetitive configuration steps, letting me focus on building the actual component logic rather than wrestling with config files.

**Would Reconsider If:**

The CLI tool becomes unavailable or the standard Vite/CRA templates add better defaults out of the box. For teams without access to this CLI, the manual setup process (`npm create vite@latest`, `npm install -D tailwindcss`, etc.) works equally well—it's just slower.

---

## Summary Table

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Agent Thoughts | Coordinator only, collapsible | Trust-building without clutter |
| Parallel Layout | Horizontal grid + header | Visual simultaneity |
| Partial Outputs | Inline, separate from final | Real-time feedback + clear hero |
| Cancelled State | Neutral (slate), "Skipped" | Not an error—optimization |
| Dependencies | Text badges, no graph | Simplicity for target users |
| Project Setup | Custom CLI tool | Fast, consistent scaffolding |
