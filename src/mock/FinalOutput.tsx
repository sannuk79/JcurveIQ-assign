import { motion } from 'framer-motion';
import { Zap, FileText, Quote } from 'lucide-react';
import { RunCompleteEvent } from '../types';

interface FinalOutputProps {
  output: RunCompleteEvent['output'];
}

export default function FinalOutput({ output }: FinalOutputProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="glass-panel border-cyan-500/20 bg-cyan-500/[0.03] overflow-hidden mt-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
      
      <div className="p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Zap size={24} fill="currentColor" className="opacity-80" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Research Synthesis Complete</h2>
            <p className="text-[10px] text-cyan-500/60 uppercase tracking-[0.2em] font-bold">Comprehensive Analysis Generated</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Summary Section */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-slate-400">
               <FileText size={16} />
               <h3 className="text-xs font-bold uppercase tracking-widest italic">Core Synthesis</h3>
             </div>
             <div className="text-base text-slate-200 leading-relaxed font-medium selection:bg-cyan-500/30">
               {output.summary.split('\n\n').map((paragraph, i) => (
                 <p key={i} className={i > 0 ? 'mt-4' : ''}>
                   {paragraph}
                 </p>
               ))}
             </div>
          </div>

          {/* Citations Grid */}
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-slate-400">
              <Quote size={16} />
              <h3 className="text-xs font-bold uppercase tracking-widest italic">Key Sources</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {output.citations.map((cite) => (
                <motion.div 
                  key={cite.ref_id}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.01] group cursor-default transition-all"
                >
                  <div className="text-[10px] text-cyan-500/60 font-bold mb-1 uppercase tracking-tight">{cite.source}</div>
                  <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{cite.title}</div>
                  <div className="text-[10px] text-slate-600 mt-2 font-mono">Page {cite.page} • REF_{cite.ref_id}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
