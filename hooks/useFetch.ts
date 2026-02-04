import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import axios, { AxiosRequestConfig } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { UseFetchOptions, UseFetchResult } from '../types/interface';

function useFetch<T = any>(url: string, options: UseFetchOptions = {}): UseFetchResult<T> {
    const { 
        method = 'GET', 
        body = null, 
        headers = {}, 
        autoFetch = true, 
        withAuth = false,
        params = {}
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const apiUrl = process.env.EXPO_PUBLIC_URL ? `http://${process.env.EXPO_PUBLIC_URL}` : `http://${process.env.EXPO_PUBLIC_LOCAL_IP_ADDRESS}:3000`;
    const fullUrl = `${apiUrl}${url}`;

    const fetchData = useCallback(
        async (overrideOptions?: UseFetchOptions) => {
            setLoading(true);
            setError(null);

            try {
                const token = withAuth ? await getFirebaseIdToken() : null;
                const resolvedMethod = overrideOptions?.method || method;
                const finalParams = overrideOptions?.params !== undefined ? overrideOptions.params : params;
                const finalBody = overrideOptions?.body !== undefined ? overrideOptions.body : body;

                const config: AxiosRequestConfig = {
                    url: fullUrl,
                    method: resolvedMethod,
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers,
                        ...overrideOptions?.headers,
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    // Apply params for GET requests ONLY
                    ...(resolvedMethod === "GET" && { params: finalParams }),
                    // Apply data for POST/PUT/PATCH requests
                    ...(resolvedMethod !== "GET" && { data: finalBody })
                };

                const response = await axios(config);
                setData(response.data);
                
                return { data: response.data, error: null, status: response.status };
            } catch (err: any) {
                const errorObj = {
                    message: err.response?.data?.message || err.message || 'Request failed',
                    status: err.response?.status,
                    data: err.response?.data
                };
                setError(errorObj);
                setData(null);
                
                return { data: null, error: errorObj, status: err.response?.status };
            } finally {
                setLoading(false);
            }
        }, [method, body, headers, withAuth, params, fullUrl]
    );

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [fetchData, autoFetch]);

    return { data, error, loading, refetch: fetchData };
}

export default useFetch;