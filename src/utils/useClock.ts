import { useEffect, useRef, useState } from 'react';
export function useClock(running: boolean, resetKey: string | number = 0) {
  const [elapsed, setElapsed] = useState(0);
  const accumulated = useRef(0);
  const started = useRef(Date.now());
  const previousKey = useRef(resetKey);
  useEffect(() => {
    if (previousKey.current !== resetKey) {
      previousKey.current = resetKey;
      accumulated.current = 0;
      setElapsed(0);
    }
    if (!running) return;
    started.current = Date.now();
    const tick = () =>
      setElapsed(
        Math.floor((accumulated.current + Date.now() - started.current) / 1000),
      );
    tick();
    const timer = setInterval(tick, 200);
    return () => {
      accumulated.current += Date.now() - started.current;
      clearInterval(timer);
    };
  }, [running, resetKey]);
  return previousKey.current === resetKey ? elapsed : 0;
}
