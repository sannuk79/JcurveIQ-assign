// ============================================
// TOOL CALL LIST COMPONENT
// Shows tool calls and their results within a task
// ============================================

import { Terminal, CheckCircle2, Clock } from 'lucide-react';
import { ToolCall } from '../types';

interface ToolCallListProps {
  toolCalls: ToolCall[];
}

export default function ToolCallList({ toolCalls }: ToolCallListProps) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
        Tool Calls
      </div>
      <div className="space-y-2">
        {toolCalls.map((tc, index) => (
          <div
            key={index}
            className={`text-xs glass-panel overflow-hidden border-white/5 bg-white/[0.02] ${
              tc.status === 'completed' ? 'border-emerald-500/20' : 'border-cyan-500/20'
            }`}
          >
            {/* Tool Call Header */}
            <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal size={12} className="text-slate-500" />
                <span className="font-mono text-[10px] font-bold text-slate-300 tracking-tight uppercase">
                  {tc.tool}
                </span>
              </div>
              {tc.status === 'completed' ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 size={10} />
                  <span>Success</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 animate-pulse">
                   <Clock size={10} />
                   <span>Active</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-2">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">Parameters:</div>
              <div className="text-slate-400 font-mono text-[10px] leading-relaxed break-all bg-black/20 p-1.5 rounded">
                {tc.input_summary}
              </div>
            </div>

            {/* Output (if completed) */}
            {tc.output_summary && (
              <div className="px-3 py-2 bg-emerald-500/[0.02] border-t border-white/5">
                <div className="text-[9px] font-bold text-emerald-900/60 uppercase tracking-wider mb-1">Result Summary:</div>
                <div className="text-emerald-100/70 text-[10px] leading-relaxed italic">
                  {tc.output_summary}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
