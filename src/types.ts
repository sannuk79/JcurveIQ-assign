// ============================================
// TYPE DEFINITIONS FOR AGENT RUN PANEL
// ============================================

// --- Event Types (from mock stream) ---

export interface RunStartedEvent {
  type: 'run_started';
  run_id: string;
  query: string;
  timestamp: number;
}

export interface AgentThoughtEvent {
  type: 'agent_thought';
  task_id: string | null; // "coordinator" or specific task ID or null for system-level
  thought: string;
  timestamp: number;
}

export interface TaskSpawnedEvent {
  type: 'task_spawned';
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
  timestamp: number;
}

export interface ToolCallEvent {
  type: 'tool_call';
  task_id: string;
  tool: string;
  input_summary: string;
  timestamp: number;
}

export interface ToolResultEvent {
  type: 'tool_result';
  task_id: string;
  tool: string;
  output_summary: string;
  timestamp: number;
}

export interface PartialOutputEvent {
  type: 'partial_output';
  task_id: string;
  content: string;
  is_final: boolean;
  quality_score: number | null;
  timestamp: number;
}

export interface TaskUpdateEvent {
  type: 'task_update';
  task_id: string;
  status: 'running' | 'complete' | 'failed' | 'cancelled';
  error: string | null;
  reason: string | null; // For cancelled: "sufficient_data"
  message: string | null;
  timestamp: number;
}

export interface RunCompleteEvent {
  type: 'run_complete';
  run_id: string;
  status: 'complete';
  duration_ms: number;
  task_count: number;
  output: {
    summary: string;
    citations: Array<{
      ref_id: string;
      title: string;
      source: string;
      page: number;
    }>;
  };
  timestamp: number;
}

export interface RunErrorEvent {
  type: 'run_error';
  run_id: string;
  message: string;
  timestamp: number;
}

// Union type for all events
export type RunEvent =
  | RunStartedEvent
  | AgentThoughtEvent
  | TaskSpawnedEvent
  | ToolCallEvent
  | ToolResultEvent
  | PartialOutputEvent
  | TaskUpdateEvent
  | RunCompleteEvent
  | RunErrorEvent;

// --- Internal State Types ---

export interface ToolCall {
  tool: string;
  input_summary: string;
  output_summary?: string;
  status: 'pending' | 'completed';
  timestamp: number;
}

export interface Output {
  content: string;
  is_final: boolean;
  quality_score: number | null;
  timestamp: number;
}

export interface TaskEvent {
  type: 'status_change' | 'tool_call' | 'tool_result' | 'output';
  timestamp: number;
  details: string;
  status?: 'running' | 'complete' | 'failed' | 'cancelled';
}

export interface Task {
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
  status: 'running' | 'complete' | 'failed' | 'cancelled';
  tool_calls: ToolCall[];
  outputs: Output[];
  error?: string;
  cancel_reason?: string;
  cancel_message?: string;
  retry_count: number;
  created_at: number;
  updated_at: number;
  history: TaskEvent[]; // Track full lifecycle for display
}

export type RunStatus = 'idle' | 'running' | 'complete' | 'error';

export interface RunState {
  status: RunStatus;
  run_id: string | null;
  query: string | null;
  tasks: Map<string, Task>;
  thoughts: AgentThoughtEvent[];
  final_output: RunCompleteEvent['output'] | null;
  error_message: string | null;
  start_time: number | null;
  elapsed_ms: number;
}

// --- Fixture Types ---

export interface Fixture {
  name: string;
  description: string;
  events: RunEvent[];
}
