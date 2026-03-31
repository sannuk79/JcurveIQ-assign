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
 * TIMING: Uses fixture timestamps as delays (in milliseconds)
 * - Event at timestamp 5000 = fires 5 seconds after previous event
 * - Creates realistic "live" feel
 */
export function useMockEventStream(
  fixtureName: FixtureName | null,
  { onEvent, onComplete, onError }: UseMockEventStreamOptions
) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunningRef = useRef(false);
  const eventIndexRef = useRef(0);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    isRunningRef.current = false;
  }, []);

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
    eventIndexRef.current = 0;

    console.log(`🎬 Starting mock event stream: ${fixture.name}`);
    console.log(`📦 Total events: ${fixture.events.length}`);
    console.log(`⏱️ Total duration: ${(fixture.events[fixture.events.length - 1].timestamp / 1000).toFixed(1)}s`);

    // Schedule each event at its specified absolute timestamp
    fixture.events.forEach((event: RunEvent, index: number) => {
      const delay = event.timestamp;

      const timeout = setTimeout(() => {
        if (!isRunningRef.current) return;

        eventIndexRef.current = index + 1;
        console.log(`📡 [${(event.timestamp / 1000).toFixed(1)}s] Event ${index + 1}/${fixture.events.length}:`, event.type, event);
        onEvent(event);

        if (index === fixture.events.length - 1) {
          console.log('✅ Event stream complete');
          onComplete?.();
        }

        if (event.type === 'run_error') {
          onError?.(event.message);
        }
      }, delay);

      timeoutsRef.current.push(timeout);
    });
  }, [fixtureName, onEvent, onComplete, onError, clearAllTimeouts]);

  useEffect(() => {
    startStream();
    return () => clearAllTimeouts();
  }, [startStream, clearAllTimeouts]);

  return {
    restart: startStream,
    stop: clearAllTimeouts,
    isRunning: isRunningRef.current,
    currentEventIndex: eventIndexRef.current,
    totalEvents: fixtureName ? FIXTURES[fixtureName].events.length : 0,
  };
}

export function getAvailableFixtures(): FixtureName[] {
  return Object.keys(FIXTURES) as FixtureName[];
}
