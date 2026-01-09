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
  refetch: (overrideOptions?: UseFetchOptions) => Promise<{ data: T | null; error: any }>;
}

// for createAccount
export interface EmailCheckResponse {
  exists: boolean;
}

export interface SendOTPRequest {
  email: string;
  code: number;
  time: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface SSOUserCheckResponse {
  isNewUser: boolean;
}

// for emailOTP
export interface VerifyOTPRequest {
  email: string;
  code: string;
  purpose: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

// for createUserInfo
export interface UserDetails {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  block: string;
  street: string;
  barangay: string;
  city: string;
}

export interface RegisterUserRequest {
  userDetails: UserDetails;
  token: string;
}

export interface RegisterUserResponse {
  success: boolean;
  email: string;
  message: string;
}
