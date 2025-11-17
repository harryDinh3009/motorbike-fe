import { useRef } from "react";

export function useDebouncedApi<T extends (...args: any[]) => void>(fn: T, delay = 600) {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  return (...args: Parameters<T>) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
