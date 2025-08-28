// hooks/useIdleTimer.ts
import { useEffect, useRef } from "react";

interface UseIdleTimerProps {
  timeout: number; // in milliseconds
  onIdle: () => void; // callback when user is idle
}

export const useIdleTimer = ({ timeout, onIdle }: UseIdleTimerProps) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onIdle]);
};
