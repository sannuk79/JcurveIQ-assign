import { RunCompleteEvent } from '../types';
import { Sparkles, FileText } from 'lucide-react';

interface FinalOutputProps {
  output?: RunCompleteEvent['output'] | null;
}

export function FinalOutput({ output }: FinalOutputProps) {
  if (!output) return null;

  return (
    <div className="mt-8 bg-slate-800/80 rounded-xl border border-emerald-500/30 overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/5 p-4 border-b border-emerald-500/20 flex items-center gap-3">
        <div className="bg-emerald-500/20 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-emerald-100">Final Synthesis Complete</h2>
      </div>
      
      <div className="p-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-200 leading-relaxed text-lg">
            {output.summary}
          </p>
        </div>

        {output.citations && output.citations.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4" />
              Source Citations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {output.citations.map((cite, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-700 p-3 rounded-lg flex flex-col">
                  <span className="text-xs text-emerald-400 mb-1 font-mono">[{cite.ref_id}] {cite.source}</span>
                  <span className="text-sm text-slate-300 font-medium truncate">{cite.title}</span>
                  {cite.page && <span className="text-xs text-slate-500 mt-1">Page {cite.page}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
