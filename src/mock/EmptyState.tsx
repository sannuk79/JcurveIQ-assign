// ============================================
// EMPTY STATE COMPONENT
// Shown when no run is active
// ============================================

export default function EmptyState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-5xl">🤖</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Agent Run Panel
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Watch AI research agents analyze SEC filings, annual reports, and
          market data in real-time. See every task, tool call, and insight
          as it unfolds.
        </p>

        {/* Instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">
            📋 How to view a demo:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">1</span>
              <span>Open <code className="bg-gray-100 px-1 rounded">src/App.tsx</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">2</span>
              <span>Set the <code className="bg-gray-100 px-1 rounded">fixture</code> prop to:</span>
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <code className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-xs font-mono border border-blue-200">
              "run_success"
            </code>
            <code className="bg-red-50 text-red-700 px-3 py-1.5 rounded text-xs font-mono border border-red-200">
              "run_error"
            </code>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Events will stream in real-time with realistic timing, showing
            tasks spawning, tools executing, and results emerging.
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <span className="text-2xl block mb-1">⚡</span>
            <span className="font-medium text-gray-900">Parallel Tasks</span>
            <span className="text-gray-500 text-xs block mt-1">
              See simultaneous execution
            </span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <span className="text-2xl block mb-1">🔄</span>
            <span className="font-medium text-gray-900">Retry Logic</span>
            <span className="text-gray-500 text-xs block mt-1">
              Watch failures & recovery
            </span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <span className="text-2xl block mb-1">📝</span>
            <span className="font-medium text-gray-900">Live Output</span>
            <span className="text-gray-500 text-xs block mt-1">
              Streaming intermediate results
            </span>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <span className="text-2xl block mb-1">🎯</span>
            <span className="font-medium text-gray-900">Final Synthesis</span>
            <span className="text-gray-500 text-xs block mt-1">
              Complete research output
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
