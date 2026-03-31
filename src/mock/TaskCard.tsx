import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import { Task } from '../types';
import ToolCallList from './ToolCallList';
import TaskHistory from './TaskHistory';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusIcon = () => {
    switch (task.status) {
      case 'complete': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'failed': return <XCircle size={16} className="text-rose-400" />;
      case 'cancelled': return <AlertCircle size={16} className="text-slate-500" />;
      default: return <Clock size={16} className="text-cyan-400 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'complete': return 'border-emerald-500/50 bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]';
      case 'failed': return 'border-rose-500/50 bg-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]';
      case 'cancelled': return 'border-slate-500/50 bg-slate-500/10';
      default: return 'border-cyan-500/50 bg-cyan-500/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]';
    }
  };

  return (
    <motion.div 
      layout
      className={`glass-panel border ${getStatusColor()} group transition-all duration-300 hover:border-white/40`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 p-1.5 rounded-lg bg-black/40 border border-white/10`}>
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-100 leading-tight tracking-tight">{task.label}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  <Cpu size={10} />
                  {task.agent}
                </span>
                {task.retry_count > 0 && (
                  <span className="text-[10px] font-bold text-amber-500/80 bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase tracking-tighter">
                    Retry {task.retry_count}
                  </span>
                )}
                {task.status === 'cancelled' && (
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {task.cancel_reason || 'Stopped'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition-colors outline-none"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Current Content Preview (if running/streaming) */}
        {task.status === 'running' && task.outputs.length > 0 && (
          <div className="mt-4 pl-11">
             <div className="text-[11px] text-slate-400 font-mono leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5 italic">
               {task.outputs[task.outputs.length - 1].content}
               <span className="inline-block w-1 h-3 ml-1 bg-cyan-400 animate-pulse align-middle" />
             </div>
          </div>
        )}

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between gap-4 pl-11">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: task.status === 'complete' ? '100%' : '60%' }}
              className={`h-full transition-all duration-700 rounded-full ${
                task.status === 'complete' ? 'bg-emerald-500' : 
                task.status === 'failed' ? 'bg-rose-500' :
                task.status === 'cancelled' ? 'bg-slate-600' :
                'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
              }`}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest min-w-[70px] text-right">
            {task.status}
          </span>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-white/5 space-y-6">
                
                {/* Final Result Section */}
                {task.status === 'complete' && task.outputs.length > 0 && (
                  <div className="pl-11 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={12} />
                      Execution Output
                    </div>
                    <div className="text-xs text-slate-200 bg-white/[0.02] p-4 rounded-xl border border-white/5 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
                      {task.outputs.find(o => o.is_final)?.content || task.outputs[task.outputs.length-1].content}
                    </div>
                  </div>
                )}

                {/* Agent Activity History */}
                <div className="pl-11">
                  <TaskHistory history={task.history} />
                </div>

                {/* Tool Calls */}
                {task.tool_calls.length > 0 && (
                  <div className="pl-11">
                    <ToolCallList toolCalls={task.tool_calls} />
                  </div>
                )}

                {/* Error/Cancellation context */}
                {(task.error || task.cancel_message) && (
                  <div className={`mx-4 p-4 rounded-xl border ${task.status === 'failed' ? 'bg-rose-500/5 border-rose-500/10 text-rose-300' : 'bg-slate-500/5 border-slate-500/10 text-slate-300'} text-xs italic leading-relaxed`}>
                     {task.error || task.cancel_message}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
