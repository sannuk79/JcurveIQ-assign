
import { useReducer, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, RotateCcw, Activity } from 'lucide-react';
import { RunState, RunEvent, Task } from '../types';
import { useMockEventStream, FixtureName } from './useMockEventStream';
import RunHeader from './RunHeader';
import LiveProgress from './LiveProgress';
import TaskList from './TaskList';
import FinalOutput from './FinalOutput';
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
  last_event_type: null,
};

// --- Reducer (State Machine) ---

type Action =
  | { type: 'RUN_STARTED'; payload: RunEvent & { type: 'run_started' } }
  | { type: 'AGENT_THOUGHT'; payload: RunEvent & { type: 'agent_thought' } }
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
        last_event_type: 'run_started',
      };
    }

    case 'AGENT_THOUGHT': {
      return {
        ...state,
        thoughts: [...state.thoughts, action.payload],
        last_event_type: 'agent_thought',
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
        history: [{
          type: 'status_change',
          timestamp: payload.timestamp,
          details: 'Task spawned',
          status: 'running',
        }],
      };
      const newTasks = new Map(state.tasks);
      newTasks.set(payload.task_id, newTask);
      return { ...state, tasks: newTasks, last_event_type: 'task_spawned' };
    }

    case 'TOOL_CALL': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const updatedTask: Task = {
        ...task,
        tool_calls: [...task.tool_calls, { ...action.payload, status: 'pending' }],
        history: [...task.history, {
          type: 'tool_call',
          timestamp: action.payload.timestamp,
          details: `Calling tool: ${action.payload.tool}`,
        }],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks, last_event_type: 'tool_call' };
    }

    case 'TOOL_RESULT': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const updatedToolCalls = task.tool_calls.map((tc) =>
        tc.tool === action.payload.tool && tc.status === 'pending'
          ? { ...tc, status: 'completed' as const, output_summary: action.payload.output_summary }
          : tc
      );

      const updatedTask: Task = {
        ...task,
        tool_calls: updatedToolCalls,
        history: [...task.history, {
          type: 'tool_result',
          timestamp: action.payload.timestamp,
          details: `Tool result received: ${action.payload.tool}`,
        }],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks, last_event_type: 'tool_result' };
    }

    case 'PARTIAL_OUTPUT': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const updatedTask: Task = {
        ...task,
        status: action.payload.is_final ? 'complete' : 'running',
        outputs: [...task.outputs, action.payload],
        history: [...task.history, {
          type: 'output',
          timestamp: action.payload.timestamp,
          details: action.payload.is_final ? 'Final output received' : 'Partial output update',
        }],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks, last_event_type: 'partial_output' };
    }

    case 'TASK_UPDATE': {
      const task = state.tasks.get(action.payload.task_id);
      if (!task) return state;

      const isRetry = action.payload.status === 'running' && task.status === 'failed';

      const updatedTask: Task = {
        ...task,
        status: action.payload.status,
        error: action.payload.error || undefined,
        cancel_reason: action.payload.reason || undefined,
        cancel_message: action.payload.message || undefined,
        retry_count: isRetry ? task.retry_count + 1 : task.retry_count,
        history: [...task.history, {
          type: 'status_change',
          timestamp: action.payload.timestamp,
          details: action.payload.message || `Status changed to ${action.payload.status}`,
          status: action.payload.status,
        }],
        updated_at: action.payload.timestamp,
      };

      const newTasks = new Map(state.tasks);
      newTasks.set(action.payload.task_id, updatedTask);
      return { ...state, tasks: newTasks, last_event_type: 'task_update' };
    }

    case 'RUN_COMPLETE': {
      return {
        ...state,
        status: 'complete',
        final_output: action.payload.output,
        elapsed_ms: action.payload.duration_ms,
        last_event_type: 'run_complete',
      };
    }

    case 'RUN_ERROR': {
      return {
        ...state,
        status: 'error',
        error_message: action.payload.message,
        last_event_type: 'run_error',
      };
    }

    case 'TICK': {
      if (state.status !== 'running' || !state.start_time) return state;
      return {
        ...state,
        elapsed_ms: action.payload,
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
  fixtureName?: FixtureName;
}

export default function AgentRunPanel({ fixtureName = 'run_success' }: AgentRunPanelProps) {
  const [state, dispatch] = useReducer(runReducer, initialState);
  const panelRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useReducer((s) => !s, false);

  // Simulation Logic (Memoized to prevent restart loop)
  const onEvent = useCallback((event: RunEvent) => {
    const typeMapping: Record<string, Action['type']> = {
      'run_started': 'RUN_STARTED',
      'agent_thought': 'AGENT_THOUGHT',
      'task_spawned': 'TASK_SPAWNED',
      'tool_call': 'TOOL_CALL',
      'tool_result': 'TOOL_RESULT',
      'partial_output': 'PARTIAL_OUTPUT',
      'task_update': 'TASK_UPDATE',
      'run_complete': 'RUN_COMPLETE',
      'run_error': 'RUN_ERROR'
    };
    const actionType = typeMapping[event.type];
    if (actionType) {
      // @ts-ignore
      dispatch({ type: actionType, payload: event });
    }
  }, []);

  const onComplete = useCallback(() => console.log('Run finished'), []);
  const onError = useCallback((err: string) => console.error('Run failed:', err), []);

  const { restart, stop, isRunning } = useMockEventStream(
    hasStarted ? fixtureName : null,
    { onEvent, onComplete, onError }
  );

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted();
    } else {
      restart();
    }
  };

  const handleReset = () => {
    stop();
    dispatch({ type: 'RESET' });
    // Soft reset doesn't always clear mock timeouts correctly, hard reload is safer for demo
    window.location.reload();
  };

  // Timer Tick
  useEffect(() => {
    if (state.status !== 'running' || !state.start_time) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK', payload: Date.now() - (state.start_time || 0) });
    }, 100);
    return () => clearInterval(interval);
  }, [state.status, state.start_time]);

  // Derived Values
  const tasksComplete = Array.from(state.tasks.values()).filter(t => t.status === 'complete').length;

  const currentActivity = useMemo(() => {
    if (state.status === 'idle') return 'System Initialized';
    if (state.status === 'complete') return 'Research Synthesis Finalized';
    if (state.status === 'error') return 'Process Terminated';

    const runningTasks = Array.from(state.tasks.values()).filter(t => t.status === 'running');
    const lastEvent = state.last_event_type;

    if (lastEvent === 'run_started') return 'Initializing Workspace...';
    if (lastEvent === 'agent_thought') return 'Reasoning Strategy Formulated';
    if (lastEvent === 'task_spawned' || lastEvent === 'task_update') {
      if (runningTasks.length > 0) return `Dispatched: ${runningTasks[runningTasks.length - 1].label}`;
      return 'Planning Sequential Steps...';
    }
    if (lastEvent === 'tool_call' && runningTasks.length > 0) {
      const task = runningTasks[runningTasks.length - 1];
      const lastTool = task.tool_calls[task.tool_calls.length - 1]?.tool;
      return `Executing ${lastTool || 'Tool'} Call...`;
    }
    if (lastEvent === 'tool_result') return 'Analyzing Result Summary...';
    if (lastEvent === 'partial_output') return 'Streaming Research Stream...';

    if (runningTasks.length > 0) return runningTasks[runningTasks.length - 1].label;
    return 'Processing Synthesis Loop...';
  }, [state.tasks, state.thoughts, state.status, state.last_event_type]);

  // Auto-scroll logic
  useEffect(() => {
    if (state.status === 'running' && panelRef.current) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [state.tasks.size, state.thoughts.length, state.status]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto pb-20">

        {/* Control Bar */}
        <div className="sticky top-0 z-50 px-4 py-3 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isRunning ? 'Simulation Active' : 'System Standby'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all outline-none"
              title="Reset Process"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleStart}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all outline-none ${isRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 shadow-none'
                  : 'bg-cyan-500 text-black hover:bg-cyan-400 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                }`}
            >
              <Play size={14} fill={isRunning ? 'none' : 'currentColor'} />
              {state.status === 'complete' ? 'Re-Run' : 'Start Process'}
            </button>
          </div>
        </div>

        {/* Header */}
        <RunHeader
          query={state.query || 'Initializing Synthesis...'}
          status={state.status}
          elapsedMs={state.elapsed_ms}
        />

        {/* Live Progress Bar */}
        <LiveProgress
          status={state.status}
          currentEvent={currentActivity}
          elapsedMs={state.elapsed_ms}
          tasksTotal={5}
          tasksComplete={tasksComplete}
        />

        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Empty State before start */}
            {state.status === 'idle' && (
              <div className="py-24 text-center glass-panel bg-white/[0.01] border-white/5">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-slate-100/20">
                  <Activity size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Ready to Initialize</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                  Click the start button above to begin the agentic research synthesis process.
                </p>
              </div>
            )}

            {/* Agent Thoughts (Coordinator) */}
            {state.thoughts.length > 0 && (
              <AgentThoughts thoughts={state.thoughts} />
            )}

            {/* Task List */}
            {state.tasks.size > 0 && (
              <div ref={panelRef} className="scroll-smooth">
                <TaskList tasks={state.tasks} status={state.status} />
              </div>
            )}

            {/* Final Output (only when complete) */}
            {state.status === 'complete' && state.final_output && (
              <FinalOutput output={state.final_output} />
            )}

            {/* Error Message */}
            {state.status === 'error' && state.error_message && (
              <div className="glass-panel border-rose-500/20 bg-rose-500/5 p-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-start gap-4">
                  <span className="text-rose-500">⚠️</span>
                  <div>
                    <h3 className="font-bold text-rose-400 tracking-tight">Execution Halted</h3>
                    <p className="text-rose-300 text-sm mt-1 opacity-80 leading-relaxed">{state.error_message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
