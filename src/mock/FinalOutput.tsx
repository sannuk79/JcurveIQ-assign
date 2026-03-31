// ============================================
// FINAL OUTPUT COMPONENT
// Prominent display of the synthesized research output
// ============================================

import { RunCompleteEvent } from '../types';

interface FinalOutputProps {
  output: RunCompleteEvent['output'];
}

export default function FinalOutput({ output }: FinalOutputProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">✅</span>
        <div>
          <h2 className="text-xl font-bold text-green-900">
            Research Complete
          </h2>
          <p className="text-green-700 text-sm">
            Synthesized analysis ready for review
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-green-200 p-5 mb-4">
        <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
          Analysis Summary
        </h3>
        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
          {output.summary}
        </div>
      </div>

      {/* Citations */}
      {output.citations.length > 0 && (
        <div className="bg-white/70 rounded-lg border border-green-200 p-4">
          <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
            📚 Sources & Citations
          </h3>
          <div className="space-y-2">
            {output.citations.map((citation) => (
              <div
                key={citation.ref_id}
                className="flex items-start gap-3 text-sm text-gray-700"
              >
                <span className="font-mono text-green-600 bg-green-100 px-2 py-0.5 rounded">
                  [{citation.ref_id}]
                </span>
                <div className="flex-1">
                  <span className="font-medium">{citation.title}</span>
                  <span className="text-gray-500"> — {citation.source}</span>
                  {citation.page && (
                    <span className="text-gray-400 text-xs ml-2">
                      (p. {citation.page})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
