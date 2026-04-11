import { getFirebaseIdToken } from "@/lib/firebaseAuth";
import { NormalizedApiError } from "@/types/interface";
import { isRequestCancelled, normalizeError } from "@/utils/apiError";
import { API_TIMEOUT_MS } from "@/utils/constants";
import axios, { AxiosRequestConfig } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFetchOptions, UseFetchResult } from "../types/interface";

function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<NormalizedApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Track if component is still mounted to prevent state updates on unmounted components
  const isMountedRef = useRef(true);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fullUrl = useMemo(() => {
    const apiUrl = process.env.EXPO_PUBLIC_URL
      ? `https://${process.env.EXPO_PUBLIC_URL}`
      : `http://${process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS}:3000`;
    return `${apiUrl}${url}`;
  }, [url]);

  // Held in a ref so fetchData can cancel the in-flight request on overlap
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Safe setState wrapper - only updates if component is still mounted
   */
  const safeSetData = useCallback((newData: T | null) => {
    if (isMountedRef.current) {
      setData(newData);
    }
  }, []);

  const safeSetError = useCallback((newError: NormalizedApiError | null) => {
    if (isMountedRef.current) {
      setError(newError);
    }
  }, []);

  const safeSetLoading = useCallback((isLoading: boolean) => {
    if (isMountedRef.current) {
      setLoading(isLoading);
    }
  }, []);

  const fetchData = useCallback(
    async (overrideOptions?: UseFetchOptions) => {
      // Cancel any in-flight request before starting a new one
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      safeSetLoading(true);
      safeSetError(null);
      safeSetData(null); // clear stale data from previous fetch

      try {
        const currentOptions = { ...optionsRef.current, ...overrideOptions };
        const {
          method = "GET",
          body,
          headers,
          withAuth,
          params,
        } = currentOptions;

        const token = withAuth ? await getFirebaseIdToken() : null;

        const config: AxiosRequestConfig = {
          url: fullUrl,
          method,
          timeout: API_TIMEOUT_MS, // 15 second timeout
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          ...(method === "GET" ? { params } : { data: body }),
        };

        const response = await axios(config);

        // Only update state if request wasn't cancelled and component is mounted
        if (!controller.signal.aborted && isMountedRef.current) {
          safeSetData(response.data);
          safeSetLoading(false);
        }

        return { data: response.data, error: null, status: response.status };
      } catch (err: any) {
        // Check if request was cancelled - don't treat as error
        if (isRequestCancelled(err)) {
          if (isMountedRef.current) {
            safeSetLoading(false);
          }
          const normalizedCancelError = normalizeError(err);
          return { data: null, error: normalizedCancelError, status: 0 };
        }

        // For real errors, normalize and set state
        const normalizedError = normalizeError(err);
        safeSetError(normalizedError);
        safeSetData(null);
        safeSetLoading(false);

        return {
          data: null,
          error: normalizedError,
          status: err.response?.status,
        };
      }
    },
    [fullUrl, safeSetData, safeSetError, safeSetLoading],
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (optionsRef.current.autoFetch) {
      fetchData();
    }

    // Cleanup: mark as unmounted and cancel if the component unmounts mid-fetch
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

export default useFetch;
