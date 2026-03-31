# Agent Run Panel - JcurveIQ Take-Home Assessment

A React component that displays live AI agent research runs in real-time, making complex multi-agent orchestration legible to non-technical analysts.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Viewing the Demo

1. Open `src/App.tsx`
2. Set the `fixture` prop to one of:
   - `"run_success"` - Full successful run with parallel tasks, retry, and cancellation
   - `"run_error"` - Run that encounters an unrecoverable error

```tsx
// Example: View success fixture
<AgentRunPanel fixture="run_success" />

// Example: View error fixture
<AgentRunPanel fixture="run_error" />

// Example: Show empty state
<AgentRunPanel />
```

3. The events will stream in real-time with realistic timing

## 📁 Project Structure

```
src/
├── mock/
│   ├── fixtures/
│   │   ├── run_success.json    # Successful run fixture
│   │   └── run_error.json      # Error run fixture
│   ├── AgentRunPanel.tsx       # Main component
│   ├── useMockEventStream.ts   # Mock event emitter hook
│   ├── RunHeader.tsx           # Query + status header
│   ├── TaskList.tsx            # Task list with parallel grouping
│   ├── TaskCard.tsx            # Individual task card
│   ├── ToolCallList.tsx        # Tool calls within tasks
│   ├── AgentThoughts.tsx       # Coordinator thoughts (collapsible)
│   ├── FinalOutput.tsx         # Final synthesized output
│   └── EmptyState.tsx          # Idle/empty state
├── types.ts                     # TypeScript type definitions
└── App.tsx                      # Entry point
```

## 🎯 Features

### Real-Time Event Streaming
- Events fire with realistic timing (not all at once)
- Console logs show each event as it arrives
- Auto-scrolls to new content while running

### Task Lifecycle Tracking
- **Running** → Task is executing
- **Complete** → Task finished successfully
- **Failed** → Task failed (may retry)
- **Cancelled** → Intentionally stopped (not a failure)

### Parallel Task Visualization
- Tasks with the same `parallel_group` are displayed horizontally
- Visual indicator shows they executed simultaneously
- Grid layout adapts to screen size

### Retry & Recovery
- Failed tasks that retry show the full journey
- Retry count is displayed
- Distinguishes between temporary failures and permanent errors

### Smart Cancellation
- `cancelled` with `reason: "sufficient_data"` shown as neutral (blue)
- Not displayed as an error - it's an optimization
- Shows coordinator's reasoning on hover

### Partial Outputs
- Intermediate results shown as "Streaming Updates"
- Final output highlighted separately with quality score
- Non-final outputs collapse when final arrives

### Agent Thoughts
- Coordinator thoughts shown in collapsible amber section
- Reveals the "plan" before execution
- Hidden by default to avoid clutter

## 🧪 Fixtures

### run_success.json
Complete successful run demonstrating:
- Sequential task (t_001 - Apple filing fetch)
- Parallel tasks (t_002, t_003, t_004 - peer fetches)
- Tool calls and results
- Partial outputs (streaming)
- Retry sequence (t_004 fails, retries, then cancelled)
- Synthesis task with dependencies
- Final output with citations

### run_error.json
Error scenario demonstrating:
- Partial completion (t_001 completes)
- Task failure with retries exhausted
- Run-level error with partial results available
- Clear error messaging

## 🎨 Design Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed reasoning on:
1. Agent thoughts display
2. Parallel task layout
3. Partial outputs handling
4. Cancelled state treatment
5. Task dependency visualization

## 🛠️ Tech Stack

- **React 18** - Functional components with hooks
- **TypeScript** - Full type safety
- **Tailwind CSS** - All styling
- **useReducer** - Complex state management
- **No UI libraries** - Custom components only

## 📝 Event Flow

```
1. run_started       → Initialize run state
2. agent_thought     → Add to thoughts array
3. task_spawned      → Create new task
4. tool_call         → Add pending tool call
5. tool_result       → Complete tool call
6. partial_output    → Add streaming output
7. task_update       → Update task status
8. run_complete      → Show final output
   OR
8. run_error         → Show error message
```

## 🔧 Known Gaps / Future Improvements

1. **WebSocket Integration**: Currently uses mock setTimeout-based streaming. Would replace with real WebSocket or Server-Sent Events for production.

2. **Task Dependency Graph**: Currently shows dependencies as text badges. A visual DAG (directed acyclic graph) would help power users understand complex runs.

3. **Filtering/Searching**: Large runs with 50+ tasks would benefit from filtering by status, agent, or searching within outputs.

4. **Export Functionality**: Analysts might want to export the final report as PDF or copy citations.

5. **Accessibility**: ARIA labels and keyboard navigation could be improved.

6. **Mobile Optimization**: Parallel task grid could be more responsive on small screens.

## 📄 License

Internal use only - JcurveIQ take-home assessment.
