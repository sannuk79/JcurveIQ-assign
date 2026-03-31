import { useState } from 'react';
import { TaskState } from '../types';
import { Loader2, CheckCircle2, AlertCircle, FastForward, Activity, ChevronDown, ChevronRight, Link } from 'lucide-react';

interface TaskItemProps {
  task: TaskState;
}

export function TaskItem({ task }: TaskItemProps) {
  const [showThoughts, setShowThoughts] = useState(false);

  // Status mapping
  const statusConfig = {
    running: { 
      icon: Loader2, 
      color: 'text-blue-400', 
      bg: 'bg-[#0A0A0A]', 
      headerBg: 'bg-blue-600/10',
      border: 'border-blue-500/40', 
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      animate: 'animate-spin' 
    },
    complete: { 
      icon: CheckCircle2, 
      color: 'text-emerald-400', 
      bg: 'bg-[#0A0A0A]', 
      headerBg: 'bg-emerald-600/10',
      border: 'border-emerald-500/40', 
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      animate: '' 
    },
    failed: { 
      icon: AlertCircle, 
      color: 'text-red-400', 
      bg: 'bg-[#0A0A0A]', 
      headerBg: 'bg-red-600/10',
      border: 'border-red-500/40', 
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      animate: '' 
    },
    cancelled: { 
      icon: FastForward, 
      color: 'text-indigo-400', 
      bg: 'bg-[#0A0A0A]', 
      headerBg: 'bg-indigo-600/10',
      border: 'border-indigo-500/40', 
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
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
    <div className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-500 ${currentConf.border} ${currentConf.bg} ${currentConf.glow} hover:bg-[#0F0F0F]`}>
      {/* Task Header */}
      <div className={`p-4 ${currentConf.headerBg} flex items-center justify-between border-b ${currentConf.border}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${currentConf.color} ${currentConf.animate}`} />
          <div>
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{task.label}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full">
                <Activity className="w-2.5 h-2.5" />
                {task.agent}
              </span>
              
              {task.dependsOn.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center gap-1.5 uppercase">
                  <Link className="w-2.5 h-2.5" />
                  Dep: {task.dependsOn.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          {task.status === 'cancelled' ? (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${currentConf.border} ${currentConf.color} uppercase tracking-tighter shadow-sm bg-indigo-950/20`} title={task.cancelMessage || ''}>
              {getCancelMessage()}
            </span>
          ) : (
            <span className={`text-[10px] uppercase tracking-widest font-black ${currentConf.color}`}>
              {task.status} {task.retryCount > 0 && task.status === 'running' && `• RETRY ${task.retryCount}`}
            </span>
          )}
          
          {task.retryCount > 0 && task.status === 'complete' && (
             <div className="text-[9px] text-amber-500 font-bold mt-1 uppercase tracking-tighter">Automatic Recovery ✓</div>
          )}
        </div>
      </div>

      {/* Task Body */}
      <div className="p-5 flex flex-col gap-4 text-sm">
        
        {task.error && task.status === 'failed' && (
          <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-300 text-[11px] leading-relaxed">
            {task.error}
          </div>
        )}

        {task.thoughts.length > 0 && (
          <div className="flex flex-col">
            <button 
              onClick={() => setShowThoughts(!showThoughts)}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-indigo-400 w-fit transition-all uppercase tracking-widest"
            >
              <div className="w-4 h-4 bg-slate-900 rounded flex items-center justify-center border border-slate-800">
                {showThoughts ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </div>
              {task.thoughts.length} Thoughts
            </button>
            {showThoughts && (
              <div className="mt-3 pl-4 border-l border-indigo-500/30 space-y-2.5">
                {task.thoughts.map((t, idx) => (
                  <p key={idx} className="text-[12px] italic text-slate-400 leading-snug">{t.thought}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {task.toolCalls.map((tc, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest">{tc.tool}()</span>
              {!tc.output && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
            </div>
            <div className="text-[12px] text-slate-400 mb-3 bg-[#000]/30 p-2 rounded-lg border border-slate-800 font-mono">Input: {tc.input}</div>
            {tc.output && (
              <div className="text-[12px] text-emerald-300 border-t border-slate-800 pt-3 break-words leading-relaxed">
                 Result: {tc.output}
              </div>
            )}
          </div>
        ))}

        {task.outputs.map((out, idx) => {
          const outWithScore = out as { content: string; isFinal: boolean; timestamp: number; qualityScore?: number | null };
          return (
          <div key={idx} className={`p-4 rounded-xl border text-[13px] leading-relaxed ${outWithScore.isFinal ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-50' : 'bg-slate-900/50 border-slate-800 text-slate-400 animate-pulse'}`}>
            <p className="whitespace-pre-wrap">{outWithScore.content}</p>
            {outWithScore.qualityScore != null && (
               <div className="mt-3 text-[10px] font-mono font-bold text-emerald-500/50 uppercase tracking-widest">
                 Reliability: {(outWithScore.qualityScore * 100).toFixed(0)}%
               </div>
            )}
          </div>
          );
        })}

      </div>
    </div>
  );
}
