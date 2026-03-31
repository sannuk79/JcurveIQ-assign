import { useEffect, useRef, useState, useCallback } from 'react';
import { AgentEvent } from '../types';

import successFixture from './fixtures/run_success.json';
import errorFixture from './fixtures/run_error.json';

type FixtureType = 'success' | 'error';

interface UseMockEventStreamProps {
  onEvent: (event: AgentEvent) => void;
  fixtureType?: FixtureType;
  autoPlay?: boolean;
}

export function useMockEventStream({
  onEvent,
  fixtureType = 'success',
  autoPlay = false
}: UseMockEventStreamProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRefs = useRef<number[]>([]);

  // Cleanup all timeouts on unmount or reset
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(window.clearTimeout);
    timeoutRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  const startStream = useCallback(() => {
    // Prevent double starts
    if (isPlaying) return;
    setIsPlaying(true);
    clearTimeouts();

    const fixture: AgentEvent[] = fixtureType === 'success' 
      ? (successFixture as AgentEvent[]) 
      : (errorFixture as AgentEvent[]);

    if (!fixture || fixture.length === 0) return;

    // We use the first event's timestamp as relative time 0
    const baseTimestamp = fixture[0].timestamp;
    
    // Optional speed multiplier if we want to watch it faster for dev testing
    const SPEED_MULTIPLIER = 1; 

    fixture.forEach((event) => {
      // Calculate delay in real MS from start of stream
      const delayMs = (event.timestamp - baseTimestamp) / SPEED_MULTIPLIER;
      
      const timeoutId = window.setTimeout(() => {
        onEvent(event);
        
        // Auto reset playing state when done
        if (event.type === 'run_complete' || event.type === 'run_error') {
          setIsPlaying(false);
        }
      }, delayMs);
      
      timeoutRefs.current.push(timeoutId);
    });

  }, [fixtureType, isPlaying, onEvent, clearTimeouts]);

  const stopStream = useCallback(() => {
    clearTimeouts();
    setIsPlaying(false);
  }, [clearTimeouts]);

  // Handle autoplay
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      startStream();
    }
  }, [autoPlay, isPlaying, startStream]);

  return { startStream, stopStream, isPlaying };
}
