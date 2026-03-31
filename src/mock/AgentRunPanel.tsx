// ============================================
// AGENT RUN PANEL - MAIN COMPONENT
// ============================================

import { useReducer, useEffect, useRef, useCallback } from 'react';
import {
  RunState,
  RunEvent,
  Task,
  ToolCall,
  AgentThoughtEvent,
} from '../types';
import { useMockEventStream, FixtureName } from './useMockEventStream';
import RunHeader from './RunHeader';
import TaskList from './TaskList';
import FinalOutput from './FinalOutput';
import EmptyState from './EmptyState';
import AgentThoughts from './AgentThoughts';

// --- Initial State ---

const initialState: RunState = {
  status: 'idle',
  run_id: null,
  query: null,
  tasks: new Map(),
  thoughts: [],
  final_output: null,
  error_message: null,
  start_time: null,
  elapsed_ms: 0,
};

// --- Reducer (State Machine) ---

type Action =
  | { type: 'RUN_STARTED'; payload: RunEvent & { type: 'run_started' } }
  | { type: 'AGENT_THOUGHT'; payload: AgentThoughtEvent }
  | { type: 'TASK_SPAWNED'; payload: RunEvent & { type: 'task_spawned' } }
  | { type: 'TOOL_CALL'; payload: RunEvent & { type: 'tool_call' } }
  | { type: 'TOOL_RESULT'; payload: RunEvent & { type: 'tool_result' } }
  | { type: 'PARTIAL_OUTPUT'; payload: RunEvent & { type: 'partial_output' } }
  | { type: 'TASK_UPDATE'; payload: RunEvent & { type: 'task_update' } }
  | { type: 'RUN_COMPLETE'; payload: RunEvent & { type: 'run_complete' } }
  | { type: 'RUN_ERROR'; payload: RunEvent & { type: 'run_error' } }
  | { type: 'TICK'; payload: number }
  | { type: 'RESET' };

function runReducer(state: RunState, action: Action): RunState {
  switch (action.type) {
    case 'RUN_STARTED': {
      return {
        ...initialState,
        status: 'running',
        run_id: action.payload.run_id,
        query: action.payload.query,
        start_time: Date.now(),
      };
    }

    case 'AGENT_THOUGHT': {
      return {
        ...state,
        thoughts: [...state.thoughts, action.payload],
      };
    }

    case 'TASK_SPAWNED': {
      const payload = action.payload;
      const newTask: Task = {
        task_id: payload.task_id,
        label: payload.label,
        agent: payload.agent,
        spawned_by: payload.spawned_by,
        parallel_group: payload.parallel_group,
        depends_on: payload.depends_on,
        status: 'running',
        tool_calls: [],
        outputs: [],
        retry_count: 0,
        created_at: payload.timestamp,
        updated_at: payload.timestamp,
      };
      const newTasks = new Map(state.tasks);
      newTasks.set(payload.task_id, newTask);
      return { ...state, tasks: newTasks };
    }

    case 'TOOL_CALL': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const newToolCall: ToolCall = {
        tool: action.payload.tool,
        input_summary: action.payload.input_summary,
        status: 'pending',
        timestamp: action.payload.timestamp,
      };

      const updatedTask: Task = {
        ...task,
        tool_calls: [...task.tool_calls, newToolCall],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks };
    }

    case 'TOOL_RESULT': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      // Find the pending tool call and mark it completed
      const updatedToolCalls = task.tool_calls.map((tc) =>
        tc.tool === action.payload.tool && tc.status === 'pending'
          ? { ...tc, status: 'completed' as const, output_summary: action.payload.output_summary }
          : tc
      );

      const updatedTask: Task = {
        ...task,
        tool_calls: updatedToolCalls,
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks };
    }

    case 'PARTIAL_OUTPUT': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const updatedTask: Task = {
        ...task,
        outputs: [...task.outputs, action.payload],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks };
    }

    case 'TASK_UPDATE': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const updatedTask: Task = {
        ...task,
        status: action.payload.status,
        error: action.payload.error ?? undefined,
        cancel_reason: action.payload.reason ?? undefined,
        cancel_message: action.payload.message ?? undefined,
        retry_count: action.payload.status === 'running' && task.status === 'failed'
          ? task.retry_count + 1
          : task.retry_count,
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks };
    }

    case 'RUN_COMPLETE': {
      return {
        ...state,
        status: 'complete',
        final_output: action.payload.output,
        elapsed_ms: action.payload.duration_ms,
      };
    }

    case 'RUN_ERROR': {
      return {
        ...state,
        status: 'error',
        error_message: action.payload.message,
      };
    }

    case 'TICK': {
      if (state.status !== 'running' || !state.start_time) return state;
      return {
        ...state,
        elapsed_ms: Date.now() - state.start_time,
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

// --- Main Component ---

interface AgentRunPanelProps {
  fixture?: FixtureName | null;
}

export default function AgentRunPanel({ fixture }: AgentRunPanelProps) {
  const [state, dispatch] = useReducer(runReducer, initialState);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive (while running)
  useEffect(() => {
    if (state.status === 'running' && panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [state.tasks.size, state.thoughts.length, state.status]);

  // Timer tick while running
  useEffect(() => {
    if (state.status !== 'running') return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', payload: Date.now() });
    }, 100);
    return () => clearInterval(interval);
  }, [state.status]);

  // Handle incoming events from mock stream
  const handleEvent = useCallback((event: RunEvent) => {
    switch (event.type) {
      case 'run_started':
        dispatch({ type: 'RUN_STARTED', payload: event });
        break;
      case 'agent_thought':
        dispatch({ type: 'AGENT_THOUGHT', payload: event });
        break;
      case 'task_spawned':
        dispatch({ type: 'TASK_SPAWNED', payload: event });
        break;
      case 'tool_call':
        dispatch({ type: 'TOOL_CALL', payload: event });
        break;
      case 'tool_result':
        dispatch({ type: 'TOOL_RESULT', payload: event });
        break;
      case 'partial_output':
        dispatch({ type: 'PARTIAL_OUTPUT', payload: event });
        break;
      case 'task_update':
        dispatch({ type: 'TASK_UPDATE', payload: event });
        break;
      case 'run_complete':
        dispatch({ type: 'RUN_COMPLETE', payload: event });
        break;
      case 'run_error':
        dispatch({ type: 'RUN_ERROR', payload: event });
        break;
    }
  }, []);

  // Start mock event stream
  useMockEventStream(fixture ?? null, {
    onEvent: handleEvent,
  });

  // Render based on state
  if (state.status === 'idle' && !fixture) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <RunHeader
          query={state.query}
          status={state.status}
          elapsedMs={state.elapsed_ms}
        />

        {/* Agent Thoughts (Coordinator) */}
        {state.thoughts.length > 0 && (
          <AgentThoughts thoughts={state.thoughts} />
        )}

        {/* Main Content */}
        <div ref={panelRef} className="space-y-4">
          {/* Task List */}
          <TaskList tasks={state.tasks} status={state.status} />

          {/* Final Output (only when complete) */}
          {state.status === 'complete' && state.final_output && (
            <FinalOutput output={state.final_output} />
          )}

          {/* Error Message */}
          {state.status === 'error' && state.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-800">Run Failed</h3>
                  <p className="text-red-700 text-sm mt-1">{state.error_message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
