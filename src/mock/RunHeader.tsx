// ============================================
// RUN HEADER COMPONENT
// Shows query, status badge, and elapsed time
// ============================================

import { RunStatus } from '../types';

interface RunHeaderProps {
  query: string | null;
  status: RunStatus;
  elapsedMs: number;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function getStatusBadge(status: RunStatus) {
  switch (status) {
    case 'idle':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          Idle
        </span>
      );
    case 'running':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Running
        </span>
      );
    case 'complete':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Complete
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Failed
        </span>
      );
  }
}

export default function RunHeader({ query, status, elapsedMs }: RunHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Research Query
          </h1>
          <p className="text-gray-700 leading-relaxed">
            {query || 'No query specified'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(status)}
          {status === 'running' && (
            <span className="text-sm text-gray-500 font-mono">
              ⏱️ {formatElapsed(elapsedMs)}
            </span>
          )}
          {status === 'complete' && (
            <span className="text-sm text-gray-500 font-mono">
              ⏱️ {formatElapsed(elapsedMs)} total
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
