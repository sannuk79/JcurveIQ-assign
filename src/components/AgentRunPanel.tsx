import { useRunReducer } from '../hooks/useRunReducer';
import { useMockEventStream } from '../mock/useMockEventStream';
import { RunHeader } from './RunHeader';
import { TaskList } from './TaskList';
import { FinalOutput } from './FinalOutput';
import { Play, RotateCcw, AlertTriangle, Activity } from 'lucide-react';

export function AgentRunPanel() {
  const { state, processEvent, resetRun } = useRunReducer();
  
  const { startStream, isPlaying } = useMockEventStream({
    onEvent: processEvent,
    fixtureType: 'success',
  });

  const currentElapsed = state.startTime ? (Date.now() - state.startTime) : 0; 

  const handleStartSuccess = () => {
    resetRun();
    startStream();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-200 font-sans dotted-canvas overflow-x-hidden">
      
      {/* Top Header Controls (Fixed) */}
      <div className="sticky top-0 z-50 flex items-center gap-4 bg-[#000000]/80 backdrop-blur-md border-b border-slate-800 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
             <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            JcurveIQ Agent Run
          </h1>
        </div>
        <div className="flex-1" />
        <button 
          disabled={isPlaying}
          onClick={handleStartSuccess}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg ${isPlaying ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50'}`}
        >
          {isPlaying ? <RotateCcw className="w-4 h-4 animate-spin text-blue-400" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Running Pipeline...' : 'Launch Pipeline'}
        </button>
      </div>

      <div className="w-full flex flex-col min-h-screen">
        
        {state.status === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center">
            <ActivityIndicator />
            <h3 className="text-xl font-semibold mt-8 text-slate-200">System Ready for Analysis</h3>
            <p className="text-base mt-3 text-slate-500 max-w-md">The agentic pipeline is waiting for instructions. Click "Launch Pipeline" above to visualize the SEC research workflow.</p>
          </div>
        ) : (
          <>
            <RunHeader 
              query={state.query} 
              status={state.status} 
              elapsedTimeMs={state.status === 'complete' ? state.elapsedTime : currentElapsed} 
            />
            
            <div className="flex-1 relative pb-24">
              {state.errorMessage && (
                <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-4 text-red-200 shadow-2xl">
                  <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
                  <p className="text-sm font-medium leading-relaxed">{state.errorMessage}</p>
                </div>
              )}
              
              <TaskList tasks={state.tasks} globalThoughts={state.globalThoughts} />

              {/* Final Output if complete */}
              {state.finalOutput && (
                <div className="max-w-4xl mx-auto px-6">
                  <FinalOutput output={state.finalOutput} />
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function ActivityIndicator() {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-[3px] border-slate-800 rounded-full"></div>
      <div className="absolute inset-0 border-[3px] border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      <div className="absolute inset-4 border-[2px] border-blue-400/30 rounded-full border-b-transparent animate-spin-slow"></div>
    </div>
  );
}
