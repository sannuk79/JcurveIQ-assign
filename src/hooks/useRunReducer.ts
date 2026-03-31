import { useReducer, useCallback } from 'react';
import { AgentEvent, RunState } from '../types';

export type RunAction = 
  | { type: 'PROCESS_EVENT'; payload: AgentEvent }
  | { type: 'RESET_RUN' };

const initialState: RunState = {
  status: 'idle',
  query: '',
  runId: null,
  startTime: null,
  elapsedTime: 0,
  tasks: new Map(),
  events: [],
  globalThoughts: [],
};

function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'RESET_RUN':
      return { ...initialState, tasks: new Map() };

    case 'PROCESS_EVENT': {
      const event = action.payload;
      
      // Keep a linear log of all events for debugging / timeline
      const newEvents = [...state.events, event];

      switch (event.type) {
        case 'run_started':
          return {
            ...state,
            status: 'running',
            query: event.query,
            runId: event.run_id,
            startTime: event.timestamp,
            events: newEvents,
          };

        case 'agent_thought': {
          if (!event.task_id || event.task_id === 'coordinator') {
            return {
              ...state,
              globalThoughts: [...state.globalThoughts, { thought: event.thought, timestamp: event.timestamp }],
              events: newEvents,
            };
          }
          
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(event.task_id);
          if (task) {
            newTasks.set(event.task_id, {
              ...task,
              thoughts: [...task.thoughts, { thought: event.thought, timestamp: event.timestamp }]
            });
          }
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'task_spawned': {
          const newTasks = new Map(state.tasks);
          newTasks.set(event.task_id, {
            id: event.task_id,
            label: event.label,
            agent: event.agent,
            status: 'running',
            parallelGroup: event.parallel_group,
            dependsOn: event.depends_on,
            toolCalls: [],
            outputs: [],
            thoughts: [],
            retryCount: 0,
          });
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'tool_call': {
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(event.task_id);
          if (task) {
            newTasks.set(event.task_id, {
              ...task,
              toolCalls: [...task.toolCalls, { tool: event.tool, input: event.input_summary, timestamp: event.timestamp }]
            });
          }
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'tool_result': {
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(event.task_id);
          if (task && task.toolCalls.length > 0) {
            // Update the last tool call
            const updatedToolCalls = [...task.toolCalls];
            updatedToolCalls[updatedToolCalls.length - 1] = {
              ...updatedToolCalls[updatedToolCalls.length - 1],
              output: event.output_summary
            };
            newTasks.set(event.task_id, { ...task, toolCalls: updatedToolCalls });
          }
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'partial_output': {
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(event.task_id);
          if (task) {
            newTasks.set(event.task_id, {
              ...task,
              outputs: [...task.outputs, { content: event.content, isFinal: event.is_final, timestamp: event.timestamp }]
            });
          }
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'task_update': {
          const newTasks = new Map(state.tasks);
          const task = newTasks.get(event.task_id);
          if (task) {
            let retryCount = task.retryCount;
            // If going from failed -> running, it's a retry
            if (task.status === 'failed' && event.status === 'running') {
              retryCount += 1;
            }

            newTasks.set(event.task_id, {
              ...task,
              status: event.status,
              error: event.error || task.error,
              cancelReason: event.reason || null,
              cancelMessage: event.message || null,
              retryCount
            });
          }
          return { ...state, tasks: newTasks, events: newEvents };
        }

        case 'run_complete':
          return {
            ...state,
            status: 'complete',
            finalOutput: event.output,
            elapsedTime: event.duration_ms, // sync final timer
            events: newEvents,
          };

        case 'run_error':
          return {
            ...state,
            status: 'error',
            errorMessage: event.message,
            events: newEvents,
          };

        default:
          return state;
      }
    }
  }
}

export function useRunReducer() {
  const [state, dispatch] = useReducer(runReducer, initialState);
  
  const processEvent = useCallback((event: AgentEvent) => {
    dispatch({ type: 'PROCESS_EVENT', payload: event });
  }, []);

  const resetRun = useCallback(() => {
    dispatch({ type: 'RESET_RUN' });
  }, []);

  return { state, processEvent, resetRun };
}
