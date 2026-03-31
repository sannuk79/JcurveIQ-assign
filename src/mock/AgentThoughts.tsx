// ============================================
// AGENT THOUGHTS COMPONENT
// Shows coordinator thoughts (collapsible)
// ============================================

import { useState } from 'react';
import { AgentThoughtEvent } from '../types';

interface AgentThoughtsProps {
  thoughts: AgentThoughtEvent[];
}

export default function AgentThoughts({ thoughts }: AgentThoughtsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show coordinator thoughts (not task-level)
  const coordinatorThoughts = thoughts.filter((t) => t.task_id === 'coordinator');

  if (coordinatorThoughts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-amber-800 font-medium hover:text-amber-900 transition-colors"
      >
        <span className="text-lg">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span>🧠 Coordinator Plan</span>
        <span className="text-amber-600 text-sm font-normal">
          ({coordinatorThoughts.length} thought{coordinatorThoughts.length !== 1 ? 's' : ''})
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {coordinatorThoughts.map((thought, index) => (
            <div
              key={index}
              className="text-amber-900 text-sm italic pl-4 border-l-2 border-amber-300"
            >
              "{thought.thought}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
