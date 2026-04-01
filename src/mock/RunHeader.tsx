

import { CheckCircle2, XCircle, Activity, Circle, Timer, Search } from 'lucide-react';
import { RunStatus } from '../types';

interface RunHeaderProps {
  query: string | null;
  status: RunStatus;
  elapsedMs: number;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function getStatusBadge(status: RunStatus) {
  switch (status) {
    case 'idle':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/5 text-slate-500 border border-white/10">
          <Circle size={10} />
          Standby
        </span>
      );
    case 'running':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
          <Activity size={10} className="animate-pulse" />
          Live
        </span>
      );
    case 'complete':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 size={10} />
          Synthesized
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle size={10} />
          Failed
        </span>
      );
  }
}

export default function RunHeader({ query, status, elapsedMs }: RunHeaderProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
              <Search size={20} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5 leading-none">
                Research Vector
              </p>
              <h1 className="text-base font-semibold text-slate-100 leading-tight truncate">
                {query || 'Initializing Synthesis...'}
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
            <div className="flex items-center gap-4">
              {(status === 'running' || status === 'complete') && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 tabular-nums uppercase tracking-wider">
                  <Timer size={12} className="opacity-60" />
                  <span>{formatElapsed(elapsedMs)}{status === 'complete' ? ' elapsed' : ''}</span>
                </div>
              )}
              {getStatusBadge(status)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
