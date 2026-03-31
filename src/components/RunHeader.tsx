import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RunHeaderProps {
  query: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  elapsedTimeMs: number | null;
}

export function RunHeader({ query, status, elapsedTimeMs }: RunHeaderProps) {
  // We use string padding and floor to format MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Determine visual style based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'complete':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 mr-2 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 mr-2" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  const statusLabels = {
    idle: 'Idle',
    running: 'Running',
    complete: 'Complete',
    error: 'Failed'
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-900 border-b border-slate-800">
      <div className="flex-1">
        <h2 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Research Query</h2>
        <div className="text-xl font-medium text-slate-100">
          {query || "Waiting for query..."}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4 md:mt-0">
        <div className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium ${getStatusStyles()}`}>
          {getStatusIcon()}
          {statusLabels[status]}
        </div>
        
        {(elapsedTimeMs !== null || status === 'running') && (
          <div className="font-mono text-slate-400 px-4 py-2 bg-slate-800/50 rounded-md border border-slate-800 tabular-nums">
            {formatTime(elapsedTimeMs || 0)}
          </div>
        )}
      </div>
    </div>
  );
}
