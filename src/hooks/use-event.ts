import { useCallback, useRef } from "react";

/**
 * A hook to have an always memoized function
 */
export function useEvent<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T
): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback((...args: Parameters<T>) => {
    return fnRef.current(...args);
  }, []) as T;
}
