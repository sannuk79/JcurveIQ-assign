// ============================================
// TOOL CALL LIST COMPONENT
// Shows tool calls and their results within a task
// ============================================

import { ToolCall } from '../types';

interface ToolCallListProps {
  toolCalls: ToolCall[];
}

export default function ToolCallList({ toolCalls }: ToolCallListProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase">
        Tool Calls
      </div>
      <div className="space-y-2">
        {toolCalls.map((tc, index) => (
          <div
            key={index}
            className="text-xs bg-white rounded border border-gray-200 overflow-hidden"
          >
            {/* Tool Call Header */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <span className="font-mono text-gray-700">
                {tc.tool}
              </span>
              {tc.status === 'completed' ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-blue-500 animate-pulse">⏳</span>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-2">
              <div className="text-gray-500 text-xs mb-1">Input:</div>
              <div className="text-gray-700 font-mono text-xs">
                {tc.input_summary}
              </div>
            </div>

            {/* Output (if completed) */}
            {tc.output_summary && (
              <div className="px-3 py-2 bg-green-50 border-t border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Output:</div>
                <div className="text-gray-700 text-xs">
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
