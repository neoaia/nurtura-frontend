export interface UserInfo {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  email?: string;
  address?: string;
}

export interface UseFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  autoFetch?: boolean;
  withAuth?: boolean;
  params?: Record<string, any>;
}

export interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: (
    overrideOptions?: UseFetchOptions,
  ) => Promise<{ data: T | null; error: any }>;
}
