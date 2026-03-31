import { TaskState } from '../types';
import { CheckCircle2, AlertCircle, FastForward, Activity, Loader2 } from 'lucide-react';

interface TaskItemProps {
  task: TaskState;
}

export function TaskItem({ task }: TaskItemProps) {

  // Status mapping
  const statusConfig = {
    running: { 
      icon: Activity, 
      color: 'text-cyan-400', 
      bg: 'bg-[#050505]', 
      headerBg: 'bg-cyan-600/5',
      border: 'border-cyan-500/30', 
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.1)]',
      animate: 'animate-pulse' 
    },
    complete: { 
      icon: CheckCircle2, 
      color: 'text-emerald-400', 
      bg: 'bg-[#050505]', 
      headerBg: 'bg-emerald-600/5',
      border: 'border-emerald-500/30', 
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      animate: '' 
    },
    failed: { 
      icon: AlertCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-950/5', 
      headerBg: 'bg-red-600/10',
      border: 'border-red-500/50', 
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.2)]',
      animate: '' 
    },
    cancelled: { 
      icon: FastForward, 
      color: 'text-slate-500', 
      bg: 'bg-slate-900/40', 
      headerBg: 'bg-slate-800/10',
      border: 'border-slate-700/50', 
      glow: 'shadow-none',
      animate: '' 
    }
  };

  const currentConf = statusConfig[task.status] || statusConfig.running;
  const Icon = currentConf.icon;

  const getCancelMessage = () => {
    if (task.cancelReason === 'sufficient_data') return 'Skipped (Sufficient Data)';
    return 'Cancelled';
  };

  return (
    <div className={`flex flex-col rounded-3xl overflow-hidden border transition-all duration-700 ${currentConf.border} ${currentConf.bg} ${currentConf.glow} hover:border-white/20 group`}>
      {/* Task Header */}
      <div className={`p-5 ${currentConf.headerBg} flex items-center justify-between border-b ${currentConf.border}`}>
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl bg-black/40 border ${currentConf.border}`}>
            <Icon className={`w-5 h-5 ${currentConf.color} ${currentConf.animate}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight transition-colors group-hover:text-white">{task.label}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-slate-800 rounded-md">
                {task.agent}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {task.status === 'cancelled' ? (
            <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-tighter border border-slate-700">
               {getCancelMessage()}
            </span>
          ) : (
            <div className="flex items-center gap-2">
               {task.retryCount > 0 && (
                 <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase tracking-tighter border border-amber-500/30 animate-pulse">
                   RETRY {task.retryCount}
                 </span>
               )}
               <span className={`text-[10px] font-black uppercase tracking-widest ${currentConf.color} bg-black/40 px-2 py-0.5 rounded-md border ${currentConf.border}`}>
                 {task.status}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Task Body */}
      <div className="p-6 flex flex-col gap-5 text-sm">
        
        {task.error && task.status === 'failed' && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-200 text-[11px] leading-relaxed font-mono italic">
            Error: {task.error}
          </div>
        )}

        {/* Intelligence Log (Thoughts) */}
        {task.thoughts.length > 0 && (
          <div className="flex flex-col bg-black/30 rounded-2xl p-4 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Intelligence Logs</span>
            </div>
            <div className="space-y-3 pl-3 border-l-2 border-blue-500/10">
              {task.thoughts.map((t, idx) => (
                <div key={idx} className="group/thought">
                  <p className="text-[12px] font-mono italic text-slate-400 leading-relaxed translate-x-0 transition-transform group-hover/thought:translate-x-1">
                    <span className="text-blue-500/30 mr-2">»</span>
                    {t.thought}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.toolCalls.map((tc, idx) => (
          <div key={idx} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 shadow-inner group/tool">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-[0.3em] bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">{tc.tool}()</span>
              {!tc.output && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
            </div>
            <div className="text-[11px] text-slate-500 mb-4 bg-black/40 p-3 rounded-xl border border-slate-800/50 font-mono overflow-x-auto whitespace-pre-wrap">
               <span className="text-slate-600 mr-2">INPUT:</span>{tc.input}
            </div>
            {tc.output && (
              <div className="text-[12px] text-emerald-400/90 border-t border-slate-800 pt-4 leading-relaxed font-mono">
                 <span className="text-emerald-500/30 mr-2">OUTPUT:</span>{tc.output}
              </div>
            )}
          </div>
        ))}

        {task.outputs.map((out, idx) => {
          const outWithScore = out as { content: string; isFinal: boolean; timestamp: number; qualityScore?: number | null };
          return (
          <div key={idx} className={`p-5 rounded-2xl border text-[13px] leading-relaxed transition-all ${outWithScore.isFinal ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-500/5' : 'bg-slate-900/30 border-slate-800 text-slate-400'}`}>
            <div className="flex justify-between items-start mb-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Task Summary</span>
               {outWithScore.qualityScore != null && (
                 <span className="text-[9px] font-mono font-black text-emerald-500/60 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                   RELIABILITY: {(outWithScore.qualityScore * 100).toFixed(0)}%
                 </span>
               )}
            </div>
            <p className="whitespace-pre-wrap">{outWithScore.content}</p>
          </div>
          );
        })}

      </div>
    </div>
  );
}
