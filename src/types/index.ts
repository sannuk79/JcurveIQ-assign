export type EventType =
  | 'run_started'
  | 'agent_thought'
  | 'task_spawned'
  | 'tool_call'
  | 'tool_result'
  | 'partial_output'
  | 'task_update'
  | 'run_complete'
  | 'run_error';

export type TaskStatus = 'running' | 'complete' | 'failed' | 'cancelled';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
}

export interface RunStartedEvent extends BaseEvent {
  type: 'run_started';
  run_id: string;
  query: string;
}

export interface AgentThoughtEvent extends BaseEvent {
  type: 'agent_thought';
  task_id: string | null;
  thought: string;
}

export interface TaskSpawnedEvent extends BaseEvent {
  type: 'task_spawned';
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
}

export interface ToolCallEvent extends BaseEvent {
  type: 'tool_call';
  task_id: string;
  tool: string;
  input_summary: string;
}

export interface ToolResultEvent extends BaseEvent {
  type: 'tool_result';
  task_id: string;
  tool: string;
  output_summary: string;
}

export interface PartialOutputEvent extends BaseEvent {
  type: 'partial_output';
  task_id: string;
  content: string;
  is_final: boolean;
  quality_score: number | null;
}

export interface TaskUpdateEvent extends BaseEvent {
  type: 'task_update';
  task_id: string;
  status: TaskStatus;
  error?: string | null;
  reason?: string | null;
  message?: string | null;
}

export interface RunCompleteEvent extends BaseEvent {
  type: 'run_complete';
  run_id: string;
  status: 'complete';
  duration_ms: number;
  task_count: number;
  output: {
    summary: string;
    citations: { ref_id: string; title: string; source: string; page: number }[];
  };
}

export interface RunErrorEvent extends BaseEvent {
  type: 'run_error';
  run_id: string;
  message: string;
}

export type AgentEvent =
  | RunStartedEvent
  | AgentThoughtEvent
  | TaskSpawnedEvent
  | ToolCallEvent
  | ToolResultEvent
  | PartialOutputEvent
  | TaskUpdateEvent
  | RunCompleteEvent
  | RunErrorEvent;

export interface TaskState {
  id: string;
  label: string;
  agent: string;
  status: TaskStatus;
  parallelGroup: string | null;
  dependsOn: string[];
  toolCalls: { tool: string; input: string; output?: string; timestamp: number }[];
  outputs: { content: string; isFinal: boolean; timestamp: number }[];
  thoughts: { thought: string; timestamp: number }[];
  error?: string | null;
  cancelReason?: string | null;
  cancelMessage?: string | null;
  retryCount: number;
}

export interface RunState {
  status: 'idle' | 'running' | 'complete' | 'error';
  query: string;
  runId: string | null;
  startTime: number | null;
  elapsedTime: number;
  tasks: Map<string, TaskState>;
  events: AgentEvent[];
  globalThoughts: { thought: string; timestamp: number }[];
  finalOutput?: RunCompleteEvent['output'] | null;
  errorMessage?: string | null;
}
