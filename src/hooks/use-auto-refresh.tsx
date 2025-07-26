import { useEffect, useRef } from "react";

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export function useAutoRefresh(
  callback: () => void,
  { enabled = true, interval = 3000 }: UseAutoRefreshOptions = {}
) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [enabled, interval]);
}