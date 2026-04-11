import { useEffect, useRef } from "react";

/**
 * Hook to track if component is mounted
 * Prevents state updates on unmounted components
 * @returns boolean indicating if component is currently mounted
 */
export function useIsMounted(): boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef.current;
}

/**
 * Hook that returns a safe setState function
 * Only sets state if component is still mounted
 * @returns function to check if safe to update state
 */
export function useSafeState() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isMounted: isMountedRef.current,
    canUpdate: () => isMountedRef.current,
  };
}
