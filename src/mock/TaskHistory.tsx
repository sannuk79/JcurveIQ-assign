// ============================================
// TASK HISTORY COMPONENT
// Shows the full lifecycle of a task (failed → retry → etc.)
// ============================================

import { TaskEvent } from '../types';

interface TaskHistoryProps {
  history: TaskEvent[];
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

function getEventIcon(event: TaskEvent): string {
  switch (event.type) {
    case 'status_change':
      if (event.status === 'failed') return '❌';
      if (event.status === 'cancelled') return '⊘';
      if (event.status === 'complete') return '✅';
      if (event.status === 'running') return '🔄';
      return '📍';
    case 'tool_call':
      return '🔧';
    case 'tool_result':
      return '✓';
    case 'output':
      return '📝';
    default:
      return '•';
  }
}

function getEventStyle(event: TaskEvent): string {
  switch (event.type) {
    case 'status_change':
      if (event.status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
      if (event.status === 'cancelled') return 'bg-slate-50 text-slate-600 border-slate-200';
      if (event.status === 'complete') return 'bg-green-50 text-green-700 border-green-200';
      if (event.details.includes('retry')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'tool_call':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'tool_result':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'output':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default function TaskHistory({ history }: TaskHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
        <span>📜</span> Task Timeline
        <span className="text-gray-400 font-normal">({history.length} events)</span>
      </div>
      
      <div className="space-y-1.5">
        {history.map((event, index) => (
          <div
            key={index}
            className={`text-xs rounded border px-2.5 py-1.5 flex items-start gap-2 ${getEventStyle(event)}`}
          >
            <span className="flex-shrink-0">{getEventIcon(event)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] opacity-60">
                  {formatTime(event.timestamp)}
                </span>
                <span className="font-medium truncate">{event.details}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
