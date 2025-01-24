import { useCallback, useRef } from "react";

export const useDebounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
};
