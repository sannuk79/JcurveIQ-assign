// ============================================
// MOCK EVENT STREAM EMITTER
// Simulates real-time event streaming with realistic timing
// ============================================

import { useEffect, useCallback, useRef } from 'react';
import { RunEvent, Fixture } from '../types';

// Import fixtures
import runSuccessFixture from './fixtures/run_success.json';
import runErrorFixture from './fixtures/run_error.json';

export type FixtureName = 'run_success' | 'run_error';

export const FIXTURES: Record<FixtureName, Fixture> = {
  run_success: runSuccessFixture as Fixture,
  run_error: runErrorFixture as Fixture,
};

interface UseMockEventStreamOptions {
  onEvent: (event: RunEvent) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook that simulates real-time event streaming from a mock backend.
 * 
 * How it works:
 * 1. Takes a fixture (JSON file with pre-defined events)
 * 2. Replays events one by one using setTimeout for realistic timing
 * 3. Calls onEvent callback for each event as it "arrives"
 * 4. Cleans up all timeouts on unmount or when fixture changes
 * 
 * @param fixtureName - Which fixture to use ('run_success' or 'run_error')
 * @param options - Callbacks for event handling
 */
export function useMockEventStream(
  fixtureName: FixtureName | null,
  { onEvent, onComplete, onError }: UseMockEventStreamOptions
) {
  // Store timeouts so we can clean them up
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunningRef = useRef(false);

  // Clear all pending timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    isRunningRef.current = false;
  }, []);

  // Start streaming events from the fixture
  const startStream = useCallback(() => {
    if (!fixtureName) {
      clearAllTimeouts();
      return;
    }

    const fixture = FIXTURES[fixtureName];
    if (!fixture) {
      console.error(`Fixture not found: ${fixtureName}`);
      return;
    }

    clearAllTimeouts();
    isRunningRef.current = true;

    console.log(`🎬 Starting mock event stream: ${fixture.name}`);
    console.log(`📦 Total events to stream: ${fixture.events.length}`);

    // Schedule each event with realistic timing
    fixture.events.forEach((event: RunEvent, index: number) => {
      // Calculate delay from previous event (or from start for first event)
      const previousTimestamp = index === 0 ? 0 : fixture.events[index - 1].timestamp;
      const delay = event.timestamp - previousTimestamp;

      const timeout = setTimeout(() => {
        if (!isRunningRef.current) {
          console.log(`⏹️ Event ${index + 1} skipped (stream stopped)`);
          return;
        }

        console.log(`📡 Event ${index + 1}/${fixture.events.length}: ${event.type}`, event);
        onEvent(event);

        // Check if this is the last event
        if (index === fixture.events.length - 1) {
          console.log('✅ Event stream complete');
          onComplete?.();
        }

        // Handle error events
        if (event.type === 'run_error') {
          onError?.(event.message);
        }
      }, delay);

      timeoutsRef.current.push(timeout);
    });
  }, [fixtureName, onEvent, onComplete, onError, clearAllTimeouts]);

  // Auto-start when fixture changes
  useEffect(() => {
    startStream();
    return () => clearAllTimeouts();
  }, [startStream, clearAllTimeouts]);

  // Expose control functions
  return {
    restart: startStream,
    stop: clearAllTimeouts,
    isRunning: isRunningRef.current,
  };
}

/**
 * Utility to get all available fixtures for a selector UI
 */
export function getAvailableFixtures(): FixtureName[] {
  return Object.keys(FIXTURES) as FixtureName[];
}
