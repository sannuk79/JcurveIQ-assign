import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';
import { RunStatus } from '../types';

interface LiveProgressProps {
  status: RunStatus;
  currentEvent: string;
  elapsedMs: number;
  tasksTotal: number;
  tasksComplete: number;
}

export default function LiveProgress({ 
  status, 
  currentEvent, 
  elapsedMs, 
  tasksTotal, 
  tasksComplete 
}: LiveProgressProps) {
  const progressPercent = status === 'complete' 
    ? 100 
    : Math.min(((tasksComplete / (tasksTotal || 1)) * 90) + 5, 95);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-6 py-4 glass-panel bg-white/[0.01] border-white/5 sticky top-[57px] z-40 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
             <div className="relative">
               {status === 'running' ? (
                 <Loader2 size={16} className="text-cyan-400 animate-spin" />
               ) : status === 'complete' ? (
                 <CheckCircle2 size={16} className="text-emerald-400" />
               ) : (
                 <Clock size={16} className="text-slate-500" />
               )}
             </div>
             
             <AnimatePresence mode="wait">
               <motion.span 
                 key={currentEvent}
                 initial={{ opacity: 0, y: 5 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -5 }}
                 className="text-xs font-bold text-slate-100 tracking-tight"
               >
                 {currentEvent}
               </motion.span>
             </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              STEP {tasksComplete + 1 < tasksTotal ? tasksComplete + 1 : tasksTotal} OF {tasksTotal}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80 font-bold bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-400/10">
              {formatTime(elapsedMs)}
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          {/* Background stripe */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
          
          {/* Actual Progress */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute top-0 left-0 h-full rounded-full ${
              status === 'complete' 
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                : 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
            }`}
          >
             {status === 'running' && (
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
             )}
          </motion.div>
        </div>

        {/* Sub-label indicators / Timeline Dot Strip */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Timeline</span>
             <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-full px-3 border border-white/5">
               {/* Timeline Dot Strip rendering logic */}
               {[...Array(tasksTotal)].map((_, i) => {
                 const isPassed = status === 'complete' || i < tasksComplete;
                 const isActive = status !== 'complete' && i === tasksComplete;
                 
                 return (
                   <motion.div 
                     key={i}
                     animate={{ 
                       opacity: isPassed ? 1 : 0.3,
                       scale: isActive ? [0.9, 1.2, 0.9] : 1,
                       backgroundColor: isPassed ? '#10b981' : 
                                        isActive ? '#22d3ee' : '#334155',
                       boxShadow: isActive ? '0 0 12px rgba(34,211,238,0.5)' : 'none'
                     }}
                     transition={isActive ? { 
                       repeat: Infinity, 
                       duration: 1.5,
                       ease: 'easeInOut' 
                     } : { duration: 0.4 }}
                     className="w-2 h-2 rounded-full"
                   />
                 );
               })}
             </div>
           </div>
           
           <AnimatePresence mode="wait">
             {status === 'running' && (
               <motion.span 
                 initial={{ opacity: 0, x: 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="text-[9px] text-cyan-400 uppercase tracking-[0.2em] font-black animate-pulse"
               >
                 Awaiting Vector Sync...
               </motion.span>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
