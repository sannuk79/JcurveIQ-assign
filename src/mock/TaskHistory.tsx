// ============================================
// TASK HISTORY COMPONENT
// Shows the full lifecycle of a task (failed → retry → etc.)
// ============================================

import { History, CheckCircle2, XCircle, Slash, RefreshCw, Terminal, FileText, Activity, Clock } from 'lucide-react';
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

function getEventIcon(event: TaskEvent) {
  switch (event.type) {
    case 'status_change':
      if (event.status === 'failed') return <XCircle size={10} />;
      if (event.status === 'cancelled') return <Slash size={10} />;
      if (event.status === 'complete') return <CheckCircle2 size={10} />;
      if (event.status === 'running') return <RefreshCw size={10} className="animate-spin-slow" />;
      return <Activity size={10} />;
    case 'tool_call':
      return <Terminal size={10} />;
    case 'tool_result':
      return <CheckCircle2 size={10} />;
    case 'output':
      return <FileText size={10} />;
    default:
      return <Activity size={10} />;
  }
}

function getEventStyles(event: TaskEvent): string {
  switch (event.type) {
    case 'status_change':
      if (event.status === 'failed') return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      if (event.status === 'cancelled') return 'text-slate-400 border-slate-500/20 bg-white/5';
      if (event.status === 'complete') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      if (event.details.includes('retry')) return 'text-amber-400 border-amber-500/40 bg-amber-500/5';
      return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/5';
    case 'tool_call':
      return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
    case 'tool_result':
      return 'text-emerald-50 border-white/20 bg-white/5';
    case 'output':
      return 'text-slate-50 border-white/20 bg-white/5';
    default:
      return 'text-slate-200 border-white/20 bg-white/5';
  }
}

export default function TaskHistory({ history }: TaskHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pl-1">
        <History size={10} className="text-slate-500" />
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Lifecycle Log
        </div>
      </div>
      
      <div className="space-y-1">
        {history.map((event, index) => (
          <div
            key={index}
            className={`text-[10px] rounded border px-3 py-2 flex items-start gap-4 transition-colors ${getEventStyles(event)}`}
          >
            <span className="flex-shrink-0 opacity-60 mt-0.5">{getEventIcon(event)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono opacity-50 tabular-nums flex items-center gap-1">
                  <Clock size={8} />
                  {formatTime(event.timestamp)}
                </span>
                <span className="font-medium leading-relaxed">{event.details}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
