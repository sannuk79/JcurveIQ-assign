# 🎯 Agent Run Panel - Interview Questions & Answers

## Table of Contents

1. [React Hooks & State Management](#1-react-hooks--state-management)
2. [Data Fetching & API Simulation](#2-data-fetching--api-simulation)
3. [Agent Architecture & Event Stream](#3-agent-architecture--event-stream)
4. [Component Design & Architecture](#4-component-design--architecture)
5. [Edge Cases & Problem Solving](#5-edge-cases--problem-solving)
6. [Performance & Optimization](#6-performance--optimization)
7. [Testing & Debugging](#7-testing--debugging)
8. [System Design & Architecture](#8-system-design--architecture)

---

## 1. React Hooks & State Management

### Q1: Why was `useReducer` chosen over `useState` for managing the run state?

**Answer:**

```typescript
// ❌ With useState - becomes unwieldy with complex state
const [tasks, setTasks] = useState<Task[]>([]);
const [thoughts, setThoughts] = useState<Thought[]>([]);
const [runStatus, setRunStatus] = useState<RunStatus>('idle');
// ... multiple state variables that need to stay in sync

// ✅ With useReducer - centralized state logic
function runReducer(state: RunState, action: Action): RunState {
  switch (action.type) {
    case 'TASK_SPAWNED':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'TASK_UPDATE':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.task_id === action.payload.task_id
            ? { ...task, status: action.payload.status, history: [...task.history, newEvent] }
            : task
        ),
      };
  }
}
```

**Why useReducer is better here:**

| Aspect | useState | useReducer |
|--------|----------|------------|
| **Complex state transitions** | Hard to track | Centralized logic |
| **Multiple sub-values** | Many setters | Single dispatch |
| **State depends on previous** | Risk of stale closures | Previous state passed in |
| **Testing** | Hard to test in isolation | Reducer is pure function |
| **Debugging** | Scattered state updates | Single source of truth |

**Key Insight:** The agent run panel has **interdependent state** - when a task updates, we need to:
1. Update the task status
2. Append to its history array
3. Potentially update run-level metadata (elapsed time, task count)
4. Handle retry logic (failed → running again)

With `useState`, this logic would be scattered across multiple `useEffect` hooks, making it hard to reason about. With `useReducer`, all state transitions are in one place.

**Follow-up:** When would you stick with `useState`?

**Answer:** For simple, independent state values like:
- `isExpanded` toggle
- `selectedTaskId` single value
- `searchQuery` input field

Rule of thumb: If state logic grows beyond a simple setter, reach for `useReducer`.

---

### Q2: Explain the `useMockEventStream` hook. How does it simulate real-time events?

**Answer:**

```typescript
// useMockEventStream.ts
export function useMockEventStream(fixture: AgentRunFixture) {
  const [state, dispatch] = useReducer(runReducer, initialState);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!fixture) return;

    const events = fixture.events;
    const baseTime = Date.now();
    const timeouts: NodeJS.Timeout[] = [];

    // Schedule each event with realistic timing
    events.forEach((event, index) => {
      const delay = event.timestamp - events[0].timestamp;
      
      const timeout = setTimeout(() => {
        dispatch({ type: event.type, payload: event });
        
        // Last event - mark as complete
        if (index === events.length - 1) {
          setIsRunning(false);
        }
      }, delay);

      timeouts.push(timeout);
    });

    setIsRunning(true);

    // Cleanup: clear all timeouts on unmount
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [fixture]);

  return { state, isRunning };
}
```

**How it works:**

1. **Event Scheduling:** Each event has a `timestamp`. We calculate the delay from the first event.
2. **Sequential Firing:** `setTimeout` fires each event at the right moment.
3. **Realistic Timing:** Events don't all arrive at once - they unfold over 20+ seconds.
4. **Cleanup:** All timeouts are cleared on unmount to prevent memory leaks.

**Example Timeline:**

```
Event Stream (run_success.json):
┌────────┬──────────────┬─────────────┐
│ Time   │ Event Type   │ Task ID     │
├────────┼──────────────┼─────────────┤
│ 0s     │ run_started  │ -           │
│ 1s     │ agent_thought│ coordinator │
│ 2s     │ task_spawned │ t_001       │
│ 3s     │ tool_call    │ t_001       │
│ 5s     │ tool_result  │ t_001       │
│ 7s     │ partial_output│ t_001      │
│ 8s     │ task_spawned │ t_002, t_003, t_004 (parallel)
│ ...    │ ...          │ ...         │
│ 21.4s  │ run_complete │ -           │
└────────┴──────────────┴─────────────┘
```

**Why not just set state directly?**

Because in production, this hook would be replaced with:
- **WebSocket** connection streaming events
- **Server-Sent Events (SSE)**
- **HTTP chunked transfer**

The mock preserves the same interface - the component doesn't know the difference.

---

### Q3: How do you handle cleanup in `useEffect` when dealing with timers or subscriptions?

**Answer:**

```typescript
useEffect(() => {
  const timeouts: NodeJS.Timeout[] = [];
  let subscribed = true;

  // Set up timers
  events.forEach(event => {
    const timeout = setTimeout(() => {
      if (subscribed) {
        dispatch(event);
      }
    }, event.delay);
    timeouts.push(timeout);
  });

  // Cleanup function
  return () => {
    subscribed = false;
    timeouts.forEach(clearTimeout);
  };
}, [dependencies]);
```

**Key Points:**

1. **Return a cleanup function** from `useEffect`
2. **Clear all timers** to prevent memory leaks
3. **Guard against state updates** after unmount (`subscribed` flag)
4. **Run cleanup before next effect** AND on unmount

**Common Mistakes:**

```typescript
// ❌ Forgetting cleanup
useEffect(() => {
  setInterval(() => {
    dispatch({ type: 'TICK' });
  }, 1000);
  // Memory leak! Interval keeps running after unmount
});

// ❌ Clearing wrong timer
useEffect(() => {
  const id = setInterval(...);
  return () => {
    clearInterval(wrongId); // Wrong reference!
  };
});
```

**Real-world scenario:** If the user navigates away from the Agent Run Panel while a run is "in progress", all mock timers must be cleared. Otherwise, they'll fire in the background and cause errors.

---

### Q4: What is the purpose of the `history` array in each task? Why not just store the current state?

**Answer:**

```typescript
interface Task {
  task_id: string;
  status: 'running' | 'complete' | 'failed' | 'cancelled';
  history: TaskEvent[]; // ← Full timeline of events
}

interface TaskEvent {
  type: 'status_change' | 'tool_call' | 'tool_result' | 'output';
  timestamp: number;
  details: string;
  status?: TaskStatus;
}
```

**Why history matters:**

| Scenario | Current State Only | With History |
|----------|-------------------|--------------|
| **Retry flow** | Shows "complete" | Shows: failed → retry → complete |
| **Debugging** | "What happened?" | Full audit trail |
| **User trust** | Opaque | Transparent process |
| **Cancelled tasks** | Just "cancelled" | Shows why & when |

**Example - t_004 retry chain:**

```typescript
// Without history (just current state):
task.status = 'cancelled'
// User sees: "Cancelled" - looks like a failure!

// With history:
task.history = [
  { type: 'status_change', status: 'running', timestamp: 8000 },
  { type: 'tool_call', tool: 'sec_edgar_search', timestamp: 9000 },
  { type: 'tool_result', output: 'timeout', timestamp: 11000 },
  { type: 'status_change', status: 'failed', error: 'rate limit', timestamp: 12000 },
  { type: 'status_change', status: 'running', timestamp: 14000, details: 'retry #1' },
  { type: 'tool_call', tool: 'sec_edgar_search', timestamp: 15000 },
  { type: 'status_change', status: 'cancelled', reason: 'sufficient_data', timestamp: 17000 },
]
// User sees: Full journey - failure, retry, then intelligent cancellation
```

**Interview talking point:**

> "I treated the UI as a **projection of an event stream**, not just a state display. The history array preserves the narrative of what happened."

---

## 2. Data Fetching & API Simulation

### Q5: How would you replace the mock event stream with a real WebSocket connection?

**Answer:**

```typescript
// useWebSocketEventStream.ts
export function useWebSocketEventStream(runId: string) {
  const [state, dispatch] = useReducer(runReducer, initialState);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const ws = new WebSocket(`wss://api.jcurveiq.com/runs/${runId}/stream`);

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      const serverEvent = JSON.parse(event.data);
      dispatch({
        type: serverEvent.type,
        payload: serverEvent,
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
      dispatch({ type: 'RUN_ERROR', payload: { message: 'Connection failed' } });
    };

    ws.onclose = () => {
      setConnectionStatus('connecting');
      // Implement reconnection logic
      setTimeout(() => {
        // Reconnect logic here
      }, 3000);
    };

    // Cleanup
    return () => {
      ws.close();
    };
  }, [runId]);

  return { state, connectionStatus };
}
```

**Key Differences from Mock:**

| Aspect | Mock (setTimeout) | WebSocket |
|--------|-------------------|-----------|
| **Event source** | Pre-defined fixture | Server-pushed |
| **Timing** | Fixed delays | Real-time |
| **Error handling** | None | Connection errors, retries |
| **Cleanup** | Clear timeouts | Close connection |
| **Reconnection** | N/A | Exponential backoff |

**Production considerations:**

1. **Heartbeat/Ping-Pong:** Keep connection alive
2. **Message buffering:** Handle bursts of events
3. **Sequence numbers:** Detect missed messages
4. **Authentication:** Token-based WS handshake

---

### Q6: What are the advantages of Server-Sent Events (SSE) over WebSocket for this use case?

**Answer:**

```typescript
// useSSEEventStream.ts
export function useSSEEventStream(runId: string) {
  useEffect(() => {
    const eventSource = new EventSource(`/api/runs/${runId}/stream`);

    eventSource.onmessage = (event) => {
      const serverEvent = JSON.parse(event.data);
      dispatch(serverEvent);
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Handle error
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);
}
```

**SSE Advantages:**

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| **Direction** | Bi-directional | Server → Client only |
| **Protocol** | `ws://` | `http://` (simpler) |
| **Reconnection** | Manual | Built-in |
| **Firewall friendly** | Sometimes blocked | Uses standard HTTP ports |
| **Browser support** | All modern | All modern except IE |
| **Complexity** | Higher | Lower |

**For Agent Run Panel:**

SSE is actually **better suited** because:
1. **One-way communication:** Server pushes events, client just listens
2. **Simpler implementation:** No need for message framing
3. **Automatic reconnection:** Browser handles it
4. **HTTP semantics:** Easier to authenticate with cookies/tokens

**When to use WebSocket instead:**

- Client needs to send messages to server frequently
- Low-latency bidirectional communication (chat, gaming)
- Custom subprotocols needed

---

### Q7: How do you handle loading states and errors when fetching data?

**Answer:**

```typescript
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAgentRun(runId: string): FetchState<RunData> {
  const [state, setState] = useState<FetchState<RunData>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRun() {
      try {
        setState({ data: null, loading: true, error: null });
        
        const response = await fetch(`/api/runs/${runId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    fetchRun();

    return () => {
      cancelled = true;
    };
  }, [runId]);

  return state;
}
```

**UI Rendering:**

```tsx
function AgentRunPanel({ runId }: { runId: string }) {
  const { data, loading, error } = useAgentRun(runId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={() => refetch()} />;
  }

  if (!data) {
    return <EmptyState />;
  }

  return <RunContent run={data} />;
}
```

**Best Practices:**

1. **Optimistic UI:** Show loading state immediately
2. **Error boundaries:** Catch rendering errors
3. **Retry logic:** Let users retry failed requests
4. **Stale-while-revalidate:** Show cached data while fetching fresh data

---

## 3. Agent Architecture & Event Stream

### Q8: Explain the multi-agent architecture. What is a "Coordinator" agent?

**Answer:**

```
┌─────────────────────────────────────────────────────────┐
│                    User Query                           │
│   "Analyse Apple's R&D intensity vs peers (2019-2023)"  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Coordinator Agent (Orchestrator)           │
│  - Breaks query into sub-tasks                          │
│  - Spawns specialized agents                            │
│  - Handles dependencies                                 │
│  - Manages failures & retries                           │
│  - Synthesizes final output                             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────────┐
        │            │            │                │
        ▼            ▼            ▼                ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Filing       │ │ Peer     │ │ Peer     │ │ Peer         │
│ Fetcher      │ │ Fetcher  │ │ Fetcher  │ │ Fetcher      │
│ (t_001)      │ │ (t_002)  │ │ (t_003)  │ │ (t_004)      │
│              │ │ MSFT     │ │ GOOGL    │ │ META         │
└──────────────┘ └──────────┘ └──────────┘ └──────────────┘
        │            │            │                │
        └────────────┴────────────┴────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Synthesis Agent (t_005)                    │
│  - Waits for all peer data                              │
│  - Compares metrics                                     │
│  - Generates final report                               │
└─────────────────────────────────────────────────────────┘
```

**Coordinator Responsibilities:**

1. **Task Decomposition:** Break complex query into parallelizable sub-tasks
2. **Dependency Management:** Know which tasks depend on others
3. **Resource Allocation:** Decide how many parallel tasks to spawn
4. **Error Handling:** Retry failed tasks, cancel redundant ones
5. **Synthesis:** Combine results into coherent output

**Why not a single agent?**

| Single Agent | Multi-Agent |
|--------------|-------------|
| Sequential execution | Parallel execution |
| Single point of failure | Fault-tolerant |
| Hard to debug | Each task traceable |
| No specialization | Specialized agents per task |

---

### Q9: What is the significance of `parallel_group` in the event schema?

**Answer:**

```typescript
interface TaskSpawnedEvent {
  type: 'task_spawned';
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null; // ← Key field
  depends_on: string[];
}
```

**Meaning:**

- `parallel_group: null` → Task runs sequentially
- `parallel_group: "peer_fetches"` → Task runs in parallel with other tasks sharing the same group ID

**Example:**

```json
{
  "task_id": "t_002",
  "label": "Fetch Microsoft 10-K",
  "parallel_group": "peer_fetches"
}
{
  "task_id": "t_003",
  "label": "Fetch Alphabet 10-K",
  "parallel_group": "peer_fetches"
}
{
  "task_id": "t_004",
  "label": "Fetch Meta 10-K",
  "parallel_group": "peer_fetches"
}
```

**All three tasks:**
- Spawned at the same time
- Execute concurrently
- Independent of each other
- Can complete in any order

**UI Impact:**

The `parallel_group` field drives the visual layout:
- Tasks in same group → Horizontal grid
- Visual connector showing simultaneity
- "Parallel Execution" header

---

### Q10: How does `depends_on` affect task execution order?

**Answer:**

```typescript
interface Task {
  task_id: string;
  depends_on: string[]; // Array of task IDs
}
```

**Example:**

```json
{
  "task_id": "t_005",
  "label": "Synthesize R&D analysis",
  "depends_on": ["t_001", "t_002", "t_003"]
}
```

**Execution Order:**

```
t_001 (Apple fetch) ──────┐
                          │
t_002 (MSFT fetch) ───────┼──→ t_005 (Synthesis)
                          │
t_003 (GOOGL fetch) ──────┘

t_004 (META fetch) - Cancelled (not in depends_on)
```

**Key Points:**

1. **t_005 cannot start** until t_001, t_002, and t_003 are complete
2. **Coordinator handles dependencies** - it knows when to spawn t_005
3. **Cancelled tasks excluded** - t_004 was cancelled, so it's not in depends_on

**UI Representation:**

```tsx
// TaskCard.tsx
{task.depends_on.length > 0 && (
  <div className="flex items-center gap-2 text-xs text-slate-500">
    <span>📎</span>
    <span>Depends: {task.depends_on.join(', ')}</span>
  </div>
)}
```

---

### Q11: What is the difference between `partial_output` and final output?

**Answer:**

```typescript
interface PartialOutputEvent {
  type: 'partial_output';
  task_id: string;
  content: string;
  is_final: boolean;      // ← Key field
  quality_score: number | null;
}
```

**Partial Output (`is_final: false`):**

```json
{
  "type": "partial_output",
  "task_id": "t_001",
  "content": "Apple R&D spend: 2019 $16.2B → 2023 $29.9B (+84%)",
  "is_final": false,
  "quality_score": null
}
```

**Final Output (`is_final: true`):**

```json
{
  "type": "partial_output",
  "task_id": "t_001",
  "content": "Apple's R&D intensity grew from 6.3% to 8.0% of revenue...",
  "is_final": true,
  "quality_score": 0.95
}
```

**Key Differences:**

| Aspect | Partial | Final |
|--------|---------|-------|
| **is_final** | `false` | `true` |
| **quality_score** | `null` | `0.0 - 1.0` |
| **Purpose** | Progress indicator | Definitive result |
| **UI Treatment** | Smaller, de-emphasized | Prominent, with score |
| **Count per task** | 0 or more | Exactly 1 (if task completes) |

**Why partial outputs matter:**

1. **User feedback:** Shows work is progressing
2. **Streaming UX:** Users don't wait for full completion
3. **Debugging:** Intermediate state helps understand failures

---

## 4. Component Design & Architecture

### Q12: How is the component hierarchy structured? Why this decomposition?

**Answer:**

```
App.tsx
└── AgentRunPanel.tsx
    ├── RunHeader.tsx          (query, status, elapsed time)
    ├── AgentThoughts.tsx      (coordinator thoughts - collapsible)
    ├── TaskList.tsx
    │   ├── Sequential tasks
    │   └── Parallel groups
    │       └── TaskCard.tsx (multiple)
    │           ├── TaskHistory.tsx
    │           └── ToolCallList.tsx
    └── FinalOutput.tsx        (synthesis result)
```

**Design Principles:**

1. **Single Responsibility:** Each component does one thing well
2. **Composition over Inheritance:** Build complex UIs from simple pieces
3. **Props Down, Events Up:** Data flows down, actions flow up

**Example - TaskCard:**

```tsx
interface TaskCardProps {
  task: Task;
  isParallel?: boolean;
}

function TaskCard({ task, isParallel = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-lg p-4",
      getStatusStyles(task.status),
      isParallel && "shadow-md"
    )}>
      <TaskHeader task={task} />
      <TaskHistory task={task} expanded={expanded} />
      <ToolCallList toolCalls={task.toolCalls} />
      <TaskOutput output={task.output} />
    </div>
  );
}
```

**Benefits:**

- **Testable:** Each component can be tested in isolation
- **Reusable:** TaskCard works for sequential and parallel tasks
- **Maintainable:** Changes to one component don't affect others
- **Performance:** Can memoize individual components

---

### Q13: What is the purpose of the `TaskHistory` component? When would you use it?

**Answer:**

```tsx
// TaskHistory.tsx
function TaskHistory({ task, expanded }: { task: Task; expanded: boolean }) {
  if (!expanded) return null;

  return (
    <div className="mt-3 space-y-2 text-sm">
      <h4 className="font-semibold text-slate-700">Timeline</h4>
      {task.history.map((event, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="text-slate-400 font-mono text-xs">
            {formatTime(event.timestamp)}
          </span>
          <EventIcon type={event.type} />
          <span className={getEventStyles(event)}>{event.details}</span>
        </div>
      ))}
    </div>
  );
}
```

**Purpose:**

1. **Audit Trail:** Shows complete lifecycle of a task
2. **Debugging:** Developers can see exactly what happened
3. **Transparency:** Users understand the process, not just the result
4. **Retry Visibility:** Shows failed → retry → success chain

**When to show:**

- **Expanded by default:** For failed/cancelled tasks (users need to understand why)
- **Collapsed by default:** For successful tasks (reduce clutter)
- **User-controlled:** Power users can expand any task

**Example Timeline:**

```
Timeline:
┌─────────────────────────────────────────────────────┐
│ 00:08  📍 Task spawned: running                     │
│ 00:09  🔧 Calling sec_edgar_search: ticker=META    │
│ 00:11  ✓ sec_edgar_search completed: timeout       │
│ 00:12  ❌ Failed: SEC EDGAR rate limit. Retrying.  │
│ 00:14  🔄 running (retry #1): Retry attempt 1      │
│ 00:15  🔧 Calling sec_edgar_search (retry)         │
│ 00:17  ⊘ Cancelled: 3 of 4 peers fetched           │
└─────────────────────────────────────────────────────┘
```

---

### Q14: How do you handle conditional styling based on task status?

**Answer:**

```tsx
// TaskCard.tsx
function getStatusStyles(status: TaskStatus, cancelReason?: string) {
  // Special case: cancelled with sufficient_data
  if (status === 'cancelled' && cancelReason === 'sufficient_data') {
    return {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-600',
      icon: '⊘',
      label: 'Skipped',
    };
  }

  // Standard statuses
  switch (status) {
    case 'running':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: '⏳',
        label: 'Running',
      };
    case 'complete':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: '✓',
        label: 'Complete',
      };
    case 'failed':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: '⚠️',
        label: 'Failed',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        icon: '•',
        label: status,
      };
  }
}

// Usage in component
function TaskCard({ task }: { task: Task }) {
  const styles = getStatusStyles(task.status, task.cancel_reason);

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4`}>
      <div className={`${styles.text} font-medium`}>
        {styles.icon} {styles.label}
      </div>
      {/* ... rest of card */}
    </div>
  );
}
```

**Why this pattern:**

1. **Centralized logic:** All status styles in one place
2. **Type-safe:** TypeScript ensures all statuses handled
3. **Maintainable:** Change colors in one place
4. **Testable:** Can unit test the style function

---

### Q15: How do you implement the collapsible "Agent Thoughts" section?

**Answer:**

```tsx
// AgentThoughts.tsx
function AgentThoughts({ thoughts }: { thoughts: Thought[] }) {
  const [expanded, setExpanded] = useState(false);

  if (thoughts.length === 0) return null;

  return (
    <div className="mb-6 border border-amber-200 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {expanded ? '▼' : '▶'}
          </span>
          <span className="text-amber-700 font-semibold">
            🧠 Coordinator Plan ({thoughts.length} thought{thoughts.length !== 1 ? 's' : ''})
          </span>
        </div>
        <span className="text-amber-600 text-sm">
          {expanded ? 'Hide' : 'Show'} reasoning
        </span>
      </button>

      {/* Content - conditionally rendered */}
      {expanded && (
        <div className="px-4 py-3 bg-white border-t border-amber-200">
          <ul className="space-y-2">
            {thoughts.map((thought, index) => (
              <li key={index} className="text-slate-700 italic">
                "{thought.thought}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Key Features:**

1. **Controlled state:** `expanded` state managed with `useState`
2. **Accessible:** Button element for keyboard navigation
3. **Visual feedback:** Arrow icon changes direction
4. **Performance:** Content only rendered when expanded

**Why collapsible?**

- **Default collapsed:** Reduces cognitive load for result-focused users
- **Expandable:** Power users can understand the reasoning
- **Trust-building:** Shows the "why" behind actions

---

## 5. Edge Cases & Problem Solving

### Q16: How do you handle a task that fails, retries, and then gets cancelled?

**Answer:**

This is the **t_004 scenario** - the most complex edge case in the assessment.

**State Transitions:**

```
running → failed → running (retry) → cancelled
```

**Implementation:**

```typescript
// runReducer.ts
case 'TASK_UPDATE': {
  const task = state.tasks.find(t => t.task_id === action.payload.task_id);
  
  if (!task) return state;

  const isRetry = 
    action.payload.status === 'running' && 
    task.status === 'failed';

  const historyEntry: TaskEvent = {
    type: 'status_change',
    timestamp: action.payload.timestamp,
    details: isRetry
      ? `running (retry #${task.retryCount + 1})`
      : getStatusLabel(action.payload.status),
    status: action.payload.status,
  };

  return {
    ...state,
    tasks: state.tasks.map(t =>
      t.task_id === action.payload.task_id
        ? {
            ...t,
            status: action.payload.status,
            retryCount: isRetry ? t.retryCount + 1 : t.retryCount,
            history: [...t.history, historyEntry],
          }
        : t
    ),
  };
}
```

**UI Rendering:**

```tsx
// TaskCard.tsx
function TaskCard({ task }: { task: Task }) {
  return (
    <div>
      {/* Status badge shows current state */}
      <StatusBadge status={task.status} retryCount={task.retryCount} />

      {/* History shows full journey */}
      <TaskHistory task={task} />
    </div>
  );
}

// StatusBadge
function StatusBadge({ status, retryCount }: { status: TaskStatus; retryCount: number }) {
  if (status === 'cancelled') {
    return <Badge variant="neutral">⊘ Skipped</Badge>;
  }
  
  if (status === 'running' && retryCount > 0) {
    return <Badge variant="warning">🔄 Running (retry #{retryCount})</Badge>;
  }
  
  return <StatusBadge status={status} />;
}
```

**Key Insight:**

The **history array** preserves every transition, even after the task completes. Users can see:
- When it failed
- That it retried
- Why it was ultimately cancelled

---

### Q17: How do you visually distinguish parallel tasks from sequential tasks?

**Answer:**

**Sequential Tasks:**

```tsx
// TaskList.tsx - Sequential
<div className="space-y-3">
  {sequentialTasks.map(task => (
    <TaskCard key={task.task_id} task={task} />
  ))}
</div>
```

**Parallel Tasks:**

```tsx
// TaskList.tsx - Parallel Groups
{parallelGroups.map(([groupId, groupTasks]) => (
  <div key={groupId} className="mb-6">
    {/* Visual header showing parallelism */}
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 rounded-full border border-blue-300">
        <span>⚡</span>
        <span className="text-xs font-bold text-blue-700 uppercase">
          Parallel Execution
        </span>
        <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
          {groupId}
        </span>
        <span className="text-xs text-blue-600">
          ({groupTasks.length} tasks running simultaneously)
        </span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
    </div>

    {/* Connector lines */}
    <div className="relative">
      <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
        <div className="w-px h-8 bg-gradient-to-b from-blue-300 to-transparent" />
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
        {groupTasks.map(task => (
          <div key={task.task_id} className="relative">
            {/* Connector dot */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full border-2 border-white shadow" />
            <TaskCard task={task} isParallel={true} />
          </div>
        ))}
      </div>
    </div>
  </div>
))}
```

**Visual Comparison:**

```
SEQUENTIAL:
┌─────────────────┐
│ Task t_001      │
└─────────────────┘
┌─────────────────┐
│ Task t_002      │
└─────────────────┘
┌─────────────────┐
│ Task t_003      │
└─────────────────┘

PARALLEL:
         ⚡ Parallel Execution [peer_fetches] (3 tasks)
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────┴─────┐       ┌─────┴─────┐
              │  t_002    │       │  t_003    │
              │  (MSFT)   │       │  (GOOGL)  │
              └───────────┘       └───────────┘
```

---

### Q18: How do you handle the empty/idle state when no run is active?

**Answer:**

```tsx
// EmptyState.tsx
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      {/* Illustration */}
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24">
          {/* Agent/robot icon */}
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        No Active Research Run
      </h2>

      {/* Description */}
      <p className="text-slate-600 max-w-md mb-6">
        Submit a research query to see the AI agent team in action. 
        You'll see tasks being spawned, tools being called, and results 
        synthesized in real-time.
      </p>

      {/* Example queries */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Example Queries:
        </h3>
        <ul className="text-sm text-slate-600 space-y-1 text-left">
          <li>• "Analyse Apple's R&D intensity vs peers (2019-2023)"</li>
          <li>• "Compare cash flow statements for FAANG companies"</li>
          <li>• "Extract ESG metrics from Microsoft's sustainability report"</li>
        </ul>
      </div>

      {/* Demo instructions */}
      <div className="mt-6 text-sm text-slate-500">
        <p>Select a demo run from the dropdown above to see a simulation.</p>
      </div>
    </div>
  );
}
```

**Why this matters:**

1. **First impression:** Empty state is often the first thing users see
2. **Guidance:** Tells users what to do next
3. **Expectation setting:** Explains what the panel does
4. **Examples:** Reduces cognitive load - users can copy examples

---

## 6. Performance & Optimization

### Q19: How would you optimize rendering for a run with 50+ tasks?

**Answer:**

**Problem:** Rendering 50+ task cards with histories can cause performance issues.

**Solutions:**

### 1. Virtual Scrolling (React Window)

```tsx
import { FixedSizeList } from 'react-window';

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={tasks.length}
      itemSize={200} // Height of each task card
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <TaskCard task={tasks[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Benefit:** Only renders visible tasks (e.g., 5-10 instead of 50+)

### 2. Memoization

```tsx
// TaskCard.tsx
const TaskCard = React.memo(function TaskCard({ task, isParallel }: TaskCardProps) {
  // Component logic
});

// TaskList.tsx
const TaskList = React.memo(function TaskList({ tasks }: TaskListProps) {
  return tasks.map(task => <TaskCard key={task.task_id} task={task} />);
});
```

**Benefit:** Prevents re-rendering when props haven't changed

### 3. Lazy Expansion

```tsx
function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  // Only load history when expanded
  const history = useMemo(() => {
    if (!expanded) return null;
    return <TaskHistory task={task} />;
  }, [expanded, task]);

  return (
    <div>
      <TaskHeader task={task} onToggle={() => setExpanded(!expanded)} />
      {expanded && history}
    </div>
  );
}
```

**Benefit:** Defers rendering of heavy content

### 4. Debounced Updates

```tsx
function useDebouncedDispatch(dispatch: Dispatch<Action>, delayMs: number = 100) {
  return useCallback((action: Action) => {
    const timeout = setTimeout(() => {
      dispatch(action);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [dispatch, delayMs]);
}
```

**Benefit:** Batches rapid updates (e.g., streaming outputs)

---

### Q20: How do you prevent memory leaks in long-running components?

**Answer:**

**Common Sources of Memory Leaks:**

1. **Uncleared timers**
2. **Unclosed subscriptions**
3. **State updates after unmount**
4. **Growing arrays without bounds**

**Solutions:**

### 1. Cleanup Timers

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    dispatch({ type: 'TICK' });
  }, 1000);

  return () => {
    clearInterval(interval); // ← Cleanup
  };
}, []);
```

### 2. Abort In-Flight Requests

```tsx
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/run', { signal: controller.signal })
    .then(res => res.json())
    .then(data => dispatch(data))
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

  return () => {
    controller.abort(); // ← Cancel request on unmount
  };
}, []);
```

### 3. Guard State Updates

```tsx
useEffect(() => {
  let mounted = true;

  async function fetchData() {
    const data = await api.fetch();
    if (mounted) {
      dispatch({ type: 'SET_DATA', payload: data });
    }
  }

  fetchData();

  return () => {
    mounted = false; // ← Prevent state update after unmount
  };
}, []);
```

### 4. Bound Growing Arrays

```typescript
// In reducer
case 'ADD_EVENT':
  const MAX_HISTORY = 1000;
  const newHistory = [...state.history, action.payload];
  
  // Trim if exceeds max
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift(); // Remove oldest
  }
  
  return { ...state, history: newHistory };
```

---

## 7. Testing & Debugging

### Q21: How would you test the AgentRunPanel component?

**Answer:**

### Unit Tests (Jest + React Testing Library)

```tsx
// AgentRunPanel.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AgentRunPanel } from './AgentRunPanel';
import { runSuccessFixture } from './mock/fixtures/run_success';

describe('AgentRunPanel', () => {
  it('shows run header with query', () => {
    render(<AgentRunPanel fixture="run_success" />);
    
    expect(screen.getByText(/Analyse Apple/i)).toBeInTheDocument();
  });

  it('displays tasks as they spawn', async () => {
    render(<AgentRunPanel fixture="run_success" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fetch Apple 10-K/i)).toBeInTheDocument();
    });
  });

  it('shows parallel group header', async () => {
    render(<AgentRunPanel fixture="run_success" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Parallel Execution/i)).toBeInTheDocument();
    });
  });

  it('handles task failure and retry', async () => {
    render(<AgentRunPanel fixture="run_success" />);
    
    // Wait for failure
    await waitFor(() => {
      expect(screen.getByText(/Failed: SEC EDGAR rate limit/i)).toBeInTheDocument();
    });
    
    // Wait for retry
    await waitFor(() => {
      expect(screen.getByText(/retry #1/i)).toBeInTheDocument();
    });
  });

  it('shows final output on completion', async () => {
    render(<AgentRunPanel fixture="run_success" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Apple's R&D intensity/i)).toBeInTheDocument();
    }, { timeout: 25000 });
  });
});
```

### Integration Tests

```tsx
// Test with custom mock
function createMockEventStream(events: Event[]) {
  return jest.fn().mockImplementation(({ dispatch }) => {
    events.forEach((event, index) => {
      setTimeout(() => dispatch(event), event.timestamp);
    });
  });
}

it('handles run_error fixture', async () => {
  render(<AgentRunPanel fixture="run_error" />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

```tsx
// Using Storybook + Chromatic
export const SuccessRun = {
  render: () => <AgentRunPanel fixture="run_success" />,
};

export const ErrorRun = {
  render: () => <AgentRunPanel fixture="run_error" />,
};

export const EmptyState = {
  render: () => <AgentRunPanel />,
};
```

---

### Q22: How do you debug a race condition in the event stream?

**Answer:**

**Scenario:** Events arrive out of order, causing state inconsistencies.

**Debugging Steps:**

### 1. Add Logging

```typescript
// useMockEventStream.ts
events.forEach((event, index) => {
  const timeout = setTimeout(() => {
    console.log('[EventStream] Firing event:', {
      index,
      type: event.type,
      task_id: event.task_id,
      timestamp: event.timestamp,
      currentTime: Date.now(),
    });
    dispatch({ type: event.type, payload: event });
  }, delay);
});
```

### 2. Track Event Order

```typescript
// In reducer
let eventCounter = 0;

case 'TASK_UPDATE':
  eventCounter++;
  console.log('[Reducer] Processing TASK_UPDATE:', {
    order: eventCounter,
    task_id: action.payload.task_id,
    status: action.payload.status,
    currentState: state.tasks.find(t => t.task_id === action.payload.task_id)?.status,
  });
```

### 3. Use Sequence Numbers

```typescript
interface SequencedEvent {
  sequence: number;
  // ... other fields
}

let lastProcessedSequence = 0;

events.forEach(event => {
  if (event.sequence <= lastProcessedSequence) {
    console.warn('Out-of-order event:', event);
    return; // Skip
  }
  lastProcessedSequence = event.sequence;
  dispatch(event);
});
```

### 4. React DevTools

- Use **Components tab** to inspect state
- Use **Profiler tab** to find re-render issues
- Check **hook dependencies** in useEffect

### 5. Time-Travel Debugging

```typescript
// Record all events for replay
const eventLog: Action[] = [];

function debugReducer(state: RunState, action: Action) {
  eventLog.push(action);
  console.log('[Debug] State transition:', {
    action,
    before: state,
    after: runReducer(state, action),
  });
  return runReducer(state, action);
}

// Replay function
function replayEvents(events: Action[]) {
  let state = initialState;
  events.forEach(event => {
    state = runReducer(state, event);
    console.log('[Replay] State after event:', state);
  });
}
```

---

## 8. System Design & Architecture

### Q23: How would you design the backend API for streaming agent events?

**Answer:**

### API Design

```
GET /api/runs/:runId/stream
```

### Response (SSE Format)

```
event: run_started
data: {"run_id": "r_001", "query": "...", "timestamp": 1700000000000}

event: task_spawned
data: {"task_id": "t_001", "label": "...", "agent": "filing_fetcher"}

event: tool_call
data: {"task_id": "t_001", "tool": "sec_edgar_search", "input_summary": "..."}
```

### WebSocket Alternative

```typescript
// Client connects
ws = new WebSocket('wss://api.jcurveiq.com/runs/r_001/stream');

// Server pushes events
ws.onmessage = (event) => {
  const serverEvent = JSON.parse(event.data);
  // Handle event
};
```

### Backend Implementation (Node.js + Express)

```typescript
// routes/runs.ts
app.get('/runs/:runId/stream', async (req, res) => {
  const { runId } = req.params;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Subscribe to Redis pub/sub for this run
  const channel = `run:${runId}:events`;
  const subscriber = redis.subscribe(channel);

  subscriber.on('message', (channel, message) => {
    res.write(`data: ${message}\n\n`);
  });

  // Cleanup on client disconnect
  req.socket.on('close', () => {
    subscriber.unsubscribe(channel);
  });
});
```

### Event Publishing (from Agent System)

```python
# Python agent system
def publish_event(run_id: str, event: dict):
    redis.publish(
        f"run:{run_id}:events",
        json.dumps(event)
    )

# Agent emits events
publish_event("r_001", {
    "type": "task_spawned",
    "task_id": "t_001",
    "label": "Fetch Apple 10-K",
    "agent": "filing_fetcher"
})
```

---

### Q24: How would you add real-time collaboration (multiple users watching the same run)?

**Answer:**

### Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User A    │────▶│             │◀────│   User B    │
│   Browser   │     │             │     │   Browser   │
└─────────────┘     │   WebSocket │     └─────────────┘
                    │   Server    │
┌─────────────┐     │             │     ┌─────────────┐
│   User C    │────▶│             │◀────│   Agent     │
│   Browser   │     │             │     │   System    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Implementation

```typescript
// Frontend - Join run room
function useCollaborativeRun(runId: string, userId: string) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`wss://api.jcurveiq.com/runs/${runId}/collab`);

    ws.current.onopen = () => {
      // Join the room
      ws.current?.send(JSON.stringify({
        type: 'join_room',
        run_id: runId,
        user_id: userId,
      }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'event':
          // Agent event (same as before)
          dispatch(message.payload);
          break;
        case 'user_joined':
          // Show notification
          toast(`${message.user_name} joined the run`);
          break;
        case 'user_left':
          toast(`${message.user_name} left the run`);
          break;
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [runId, userId]);
}
```

### Backend (WebSocket Server)

```typescript
// Track users per run
const runRooms = new Map<string, Set<string>>();

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    if (message.type === 'join_room') {
      const roomId = message.run_id;
      
      if (!runRooms.has(roomId)) {
        runRooms.set(roomId, new Set());
      }
      runRooms.get(roomId)!.add(ws);
      
      // Broadcast to others
      broadcast(roomId, {
        type: 'user_joined',
        user_id: message.user_id,
        user_name: message.user_name,
      }, ws); // Exclude sender
    }
  });

  ws.on('close', () => {
    // Remove from all rooms
    runRooms.forEach((users, roomId) => {
      if (users.has(ws)) {
        users.delete(ws);
        broadcast(roomId, { type: 'user_left', user_id: ws.userId });
      }
    });
  });
});

function broadcast(roomId: string, message: any, exclude?: WebSocket) {
  const users = runRooms.get(roomId);
  if (!users) return;
  
  users.forEach(ws => {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}
```

---

### Q25: What metrics would you track to measure the success of this feature?

**Answer:**

### User Engagement Metrics

| Metric | Why It Matters | Target |
|--------|----------------|--------|
| **Time watching runs** | Indicates engagement | > 60% of run duration |
| **Task expansion rate** | Shows curiosity/debugging | > 30% of tasks expanded |
| **Thought section expansion** | Trust-building indicator | > 50% of runs |
| **Return rate** | Feature stickiness | > 40% weekly retention |

### Performance Metrics

| Metric | Why It Matters | Target |
|--------|----------------|--------|
| **Time to first event** | Perceived responsiveness | < 100ms |
| **Event lag** | Real-time fidelity | < 500ms behind server |
| **Frame rate during updates** | Smooth UX | > 50 FPS |
| **Memory usage** | Prevents crashes | < 100MB after 5 min |

### Trust & Understanding Metrics

| Metric | How to Measure |
|--------|----------------|
| **User confidence** | Post-run survey: "How confident are you in this result?" (1-5) |
| **Task comprehension** | Survey: "Do you understand why each task was run?" |
| **Error tolerance** | Do users abandon on errors, or watch retries? |
| **Support tickets** | Reduction in "why did this fail?" tickets |

### Technical Metrics

```typescript
// Track in analytics
function trackRunMetrics(run: Run) {
  analytics.track('run_viewed', {
    run_id: run.id,
    duration_ms: run.duration_ms,
    task_count: run.tasks.length,
    parallel_groups: countParallelGroups(run.tasks),
    failures: countFailures(run.tasks),
    retries: countRetries(run.tasks),
    cancellations: countCancellations(run.tasks),
    tasks_expanded: run.tasks.filter(t => t.expanded).length,
    thoughts_viewed: run.thoughtsExpanded,
    time_to_final_output_ms: run.completedAt - run.startedAt,
  });
}
```

---

## Bonus: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   AgentRunPanel.tsx                       │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │  RunHeader  │  │   TaskList  │  │ FinalOutput │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  │         │                │                │               │  │
│  │         └────────────────┼────────────────┘               │  │
│  │                          │                                │  │
│  │              ┌───────────▼───────────┐                    │  │
│  │              │     useReducer        │                    │  │
│  │              │   (RunState, Action)  │                    │  │
│  │              └───────────┬───────────┘                    │  │
│  │                          │                                │  │
│  │              ┌───────────▼───────────┐                    │  │
│  │              │ useMockEventStream    │                    │  │
│  │              │  (or WebSocket hook)  │                    │  │
│  │              └───────────┬───────────┘                    │  │
│  └──────────────────────────┼────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              │ Event Stream
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      Backend (Node.js/Python)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   WebSocket / SSE Server                   │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Redis      │  │   Agent      │  │   Event      │    │ │
│  │  │   Pub/Sub    │◀─┤   System     │─▶│   Store      │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Summary: Key Interview Talking Points

> 1. **"I treated the UI as a projection of an event stream, not just state display."**

> 2. **"Each task is a state machine with transitions tracked in a history array."**

> 3. **"Parallel groups are rendered as logical clusters with visual connectors to emphasize simultaneity."**

> 4. **"Cancelled is modeled as a non-error terminal state - it's an optimization, not a failure."**

> 5. **"The retry chain (failed → running → cancelled) is preserved even after completion."**

> 6. **"useReducer centralizes complex state logic that would be scattered with useState."**

> 7. **"The mock event stream preserves the same interface as a real WebSocket - easy to swap."**

> 8. **"Information hierarchy matters: final output is the hero, but the journey is visible on demand."**

---

## Files to Reference During Interview

| File | Purpose |
|------|---------|
| `src/types.ts` | Type definitions for events, tasks, state |
| `src/mock/AgentRunPanel.tsx` | Main component with useReducer |
| `src/mock/useMockEventStream.ts` | Event streaming hook |
| `src/mock/TaskCard.tsx` | Task rendering with history |
| `src/mock/TaskList.tsx` | Parallel group visualization |
| `DECISIONS.md` | Design reasoning for ambiguous requirements |
| `src/mock/fixtures/run_success.json` | Complete event sequence |

---

**Good luck with your interview! 🚀**
