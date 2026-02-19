import { getFirebaseIdToken } from "@/lib/firebaseAuth";
import axios, { AxiosRequestConfig } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFetchOptions, UseFetchResult } from "../types/interface";

function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  const fetchData = useCallback(
    async (overrideOptions?: UseFetchOptions) => {
      // Cancel any in-flight request before starting a new one
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setData(null); // clear stale data from previous fetch

      try {
        const currentOptions = { ...optionsRef.current, ...overrideOptions };
        const { method = "GET", body, headers, withAuth, params } = currentOptions;

        const token = withAuth ? await getFirebaseIdToken() : null;

        const config: AxiosRequestConfig = {
          url: fullUrl,
          method,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          ...(method === "GET" ? { params } : { data: body }),
        };

        const response = await axios(config);
        setData(response.data);
        return { data: response.data, error: null, status: response.status };
      } catch (err: any) {
        if (axios.isCancel(err)) return { data: null, error: null, status: 0 };

        const errorObj = {
          message: err.response?.data?.message || err.message || "Request failed",
          status: err.response?.status,
        };
        setError(errorObj);
        setData(null);
        return { data: null, error: errorObj, status: err.response?.status };
      } finally {
        setLoading(false);
      }
    },
    [fullUrl],
  );

  useEffect(() => {
    if (optionsRef.current.autoFetch) {
      fetchData();
    }
    // Cleanup: cancel if the component unmounts mid-fetch
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

export default useFetch;