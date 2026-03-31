import { useState } from 'react';
import AgentRunPanel from './mock/AgentRunPanel';
import { FixtureName, getAvailableFixtures } from './mock/useMockEventStream';

function App() {
  const [selectedFixture, setSelectedFixture] = useState<FixtureName | ''>('');

  const fixtures = getAvailableFixtures();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixture Selector (for demo purposes) */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">
              🤖 Agent Run Panel
            </h1>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Select Fixture:</label>
              <select
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value as FixtureName | '')}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- None (Empty State) --</option>
                {fixtures.map((fixture) => (
                  <option key={fixture} value={fixture}>
                    {fixture}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {selectedFixture ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Running: {selectedFixture}
              </span>
            ) : (
              <span>Idle - Select a fixture to start</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <AgentRunPanel fixture={selectedFixture || null} />
    </div>
  );
}

export default App;
