import { useCallback, useRef, useState } from "react";

type AsyncState<T> = { data: T; loading: boolean };

export function useAsyncState<T>(initialData: T) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: true,
  });

  const hasLoadedRef = useRef(false);

  const setData = useCallback((data: T) => {
    hasLoadedRef.current = true;
    setState({ data, loading: false });
  }, []);

  const setLoading = useCallback(() => {
    if (!hasLoadedRef.current) {
      setState((prev) => ({ ...prev, loading: true }));
    }
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    hasLoaded: hasLoadedRef.current,
    setData,
    setLoading,
  };
}
