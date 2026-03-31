import { RunCompleteEvent } from '../types';
import { Sparkles } from 'lucide-react';

interface FinalOutputProps {
  output?: RunCompleteEvent['output'] | null;
}

export function FinalOutput({ output }: FinalOutputProps) {
  if (!output) return null;

  return (
    <div className="relative group overflow-hidden animate-in fade-in slide-in-from-right duration-1000">
      {/* Outer Glow / Gradient Border */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[2.5rem] opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-[#080808] rounded-[2.25rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-xl">
        <div className="bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mb-1">Status: Finalized</h3>
                <h2 className="text-2xl font-black text-white tracking-tight">Synthesized Intelligence</h2>
              </div>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-slate-200 leading-relaxed font-medium">
              {output.summary}
            </p>
          </div>
        </div>
        
        {output.citations && output.citations.length > 0 && (
          <div className="p-8 bg-black/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3 mb-6">
              <div className="w-4 h-[1px] bg-slate-800" />
              Source Material
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {output.citations.map((cite, idx) => (
                <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-all hover:-translate-y-1 cursor-default group/cite">
                  <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 text-[10px] font-mono font-bold text-emerald-500/40 uppercase group-hover/cite:text-emerald-400 transition-colors">
                    {cite.ref_id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">{cite.source}</span>
                      {cite.page && <span className="text-[9px] font-mono text-slate-600">P. {cite.page}</span>}
                    </div>
                    <p className="text-sm text-slate-200 font-bold truncate mt-0.5">{cite.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
