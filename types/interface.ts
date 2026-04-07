export interface UserDetails {
  id?: string;
  firebaseUid?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  email?: string;
  address?: string;
  block?: string;
  street?: string;
  barangay?: string;
  city?: string;
  expoPushToken?: string;
  completedPages?: string[];
  hasCompletedOnboarding?: boolean;
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
