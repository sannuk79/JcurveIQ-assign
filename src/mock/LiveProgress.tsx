// ============================================
// LIVE PROGRESS COMPONENT
// Shows real-time execution status
// ============================================

import { RunStatus } from '../types';

interface LiveProgressProps {
  status: RunStatus;
  currentEvent: string;
  elapsedMs: number;
  tasksTotal: number;
  tasksComplete: number;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}.${Math.floor((ms % 1000) / 100)}s`;
}

export default function LiveProgress({
  status,
  currentEvent,
  elapsedMs,
  tasksTotal,
  tasksComplete,
}: LiveProgressProps) {
  if (status === 'idle') return null;

  const progress = tasksTotal > 0 ? Math.round((tasksComplete / tasksTotal) * 100) : 0;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-3">
        {/* Top row: Status + Time */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            {status === 'running' && (
              <div className="flex items-center gap-2 text-blue-600">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-sm font-semibold">LIVE</span>
              </div>
            )}
            
            {status === 'complete' && (
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-lg">✅</span>
                <span className="text-sm font-semibold">Complete</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-lg">⚠️</span>
                <span className="text-sm font-semibold">Failed</span>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="font-mono text-sm text-gray-600">
            ⏱️ {formatTime(elapsedMs)}
          </div>
        </div>

        {/* Progress bar */}
        {status === 'running' && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress: {tasksComplete}/{tasksTotal} tasks</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current activity */}
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-700">Current:</span> {currentEvent}
        </div>
      </div>
    </div>
  );
}
