// ============================================
// TASK CARD COMPONENT
// Shows individual task details with status, tools, outputs
// ============================================

import { useState } from 'react';
import { Task } from '../types';
import ToolCallList from './ToolCallList';

interface TaskCardProps {
  task: Task;
  isParallel: boolean;
}

function getStatusDisplay(task: Task) {
  // Handle retry scenarios
  if (task.retry_count > 0 && task.status === 'running') {
    return {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      label: `↻ Retry #${task.retry_count}`,
      icon: '🔄',
    };
  }

  switch (task.status) {
    case 'running':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        label: 'Running',
        icon: '⏳',
      };
    case 'complete':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        label: 'Complete',
        icon: '✓',
      };
    case 'failed':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        label: 'Failed',
        icon: '✗',
      };
    case 'cancelled':
      // Cancelled with "sufficient_data" is NOT an error - it's neutral/informational
      if (task.cancel_reason === 'sufficient_data') {
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          label: 'Skipped',
          icon: '⊘',
        };
      }
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        label: 'Cancelled',
        icon: '⊘',
      };
  }
}

export default function TaskCard({ task, isParallel }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const status = getStatusDisplay(task);

  // Get the latest output (final if available, otherwise latest partial)
  const finalOutput = task.outputs.find((o) => o.is_final);
  const latestOutput = task.outputs[task.outputs.length - 1];

  // Get non-final outputs for history
  const partialOutputs = task.outputs.filter((o) => !o.is_final);

  return (
    <div
      className={`${status.bg} ${status.border} border rounded-lg overflow-hidden transition-all ${isParallel ? 'text-sm' : ''
        }`}
    >
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-black/5 transition-colors text-left"
      >
        {/* Status Icon */}
        <span className={`text-lg flex-shrink-0 ${status.text}`}>
          {status.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${status.text}`}>
              {task.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>🤖 {task.agent}</span>
            {task.depends_on.length > 0 && (
              <span className="flex items-center gap-1">
                📎 Depends: {task.depends_on.join(', ')}
              </span>
            )}
          </div>

          {/* Cancel reason message */}
          {task.status === 'cancelled' && task.cancel_message && (
            <div className="mt-2 text-xs text-slate-600 italic">
              ℹ️ {task.cancel_message}
            </div>
          )}

          {/* Error message */}
          {task.status === 'failed' && task.error && (
            <div className="mt-2 text-xs text-red-600">
              ⚠️ {task.error}
            </div>
          )}
        </div>

        {/* Expand/Collapse Arrow */}
        <span className="text-gray-400 text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Tool Calls */}
          {task.tool_calls.length > 0 && (
            <ToolCallList toolCalls={task.tool_calls} />
          )}

          {/* Partial Outputs (Streaming) */}
          {partialOutputs.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase">
                Streaming Updates
              </div>
              {partialOutputs.map((output, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-white/50 rounded px-3 py-2 border border-gray-200"
                >
                  {output.content}
                </div>
              ))}
            </div>
          )}

          {/* Final Output */}
          {finalOutput && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Final Output
                </span>
                {finalOutput.quality_score && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Score: {(finalOutput.quality_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200">
                {finalOutput.content}
              </div>
            </div>
          )}

          {/* Show latest non-final output if no final yet */}
          {!finalOutput && latestOutput && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                <span className="animate-pulse">●</span> Current Output
              </div>
              <div className="text-sm text-gray-700 bg-white/70 rounded px-3 py-2 border border-gray-200">
                {latestOutput.content}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
