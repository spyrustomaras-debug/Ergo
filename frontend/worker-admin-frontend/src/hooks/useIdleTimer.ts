// hooks/useIdleTimer.ts
import { useEffect, useRef } from "react";

interface UseIdleTimerProps {
  timeout: number; // in milliseconds
  onIdle: () => void; // callback when user is idle
  warningTime?: number; // optional: time before idle to show warning
  onWarning?: () => void; // optional: callback when warning triggers
}

export const useIdleTimer = ({ timeout, onIdle, warningTime, onWarning }: UseIdleTimerProps) => {
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Clear previous timers
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    // Setup warning timer
    if (warningTime && onWarning) {
      warningTimer.current = setTimeout(onWarning, timeout - warningTime);
    }

    // Setup idle timer
    idleTimer.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timers on mount

    return () => {
      // Cleanup timers and event listeners
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, warningTime, onIdle, onWarning]);
};
