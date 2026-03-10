import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// useSessionTimer
//
// Drives the live elapsed time counter for the session active state.
//
// Inputs:
//   startTime — ISO-8601 string from E1 (start_time field). null when no session.
//
// Returns:
//   elapsedSeconds — number of seconds since startTime (updates every second)
//
// Timer is fully derived from the server-returned startTime.
// No localStorage. No persistence. On page refresh, E1 is re-fetched and the
// timer restarts from the current elapsed time automatically.
// ---------------------------------------------------------------------------
export function useSessionTimer(startTime: string | null): number {
  const computeElapsed = useCallback((fromIso: string): number => {
    const start = new Date(fromIso).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 1000));
  }, []);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    startTime !== null ? computeElapsed(startTime) : 0,
  );

  useEffect(() => {
    if (startTime === null) {
      setElapsedSeconds(0);
      return;
    }

    setElapsedSeconds(computeElapsed(startTime));

    const interval = setInterval(() => {
      setElapsedSeconds(computeElapsed(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, computeElapsed]);

  return elapsedSeconds;
}
