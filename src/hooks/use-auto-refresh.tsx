import { useEffect, useRef, useState } from "react";

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  maxRefreshCount?: number; // maximum number of refreshes
}

export function useAutoRefresh(
  callback: () => void,
  { enabled = true, interval = 5000, maxRefreshCount = 2 }: UseAutoRefreshOptions = {}
) {
  const savedCallback = useRef<() => void>();
  const [refreshCount, setRefreshCount] = useState(0);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled || refreshCount >= maxRefreshCount) return;

    function tick() {
      if (savedCallback.current && refreshCount < maxRefreshCount) {
        savedCallback.current();
        setRefreshCount(prev => prev + 1);
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [enabled, interval, refreshCount, maxRefreshCount]);

  // Reset refresh count when needed
  const resetRefreshCount = () => setRefreshCount(0);

  return { refreshCount, resetRefreshCount };
}