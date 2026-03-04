import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import type { ApiResponse, LoginTokens } from "@/types";
import { useAuthStore } from "@/stores/auth.store";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _toast?: boolean;
  }
  interface AxiosRequestConfig {
    _toast?: boolean;
  }
}

// ---------------------------------------------------------------------------
// Raw Axios instance — internal use only. Never import this directly.
// ---------------------------------------------------------------------------
const _http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token from the auth store on every call.
// ---------------------------------------------------------------------------
_http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Flag used to prevent an infinite retry loop if the refresh endpoint itself
// returns 401/403.
// ---------------------------------------------------------------------------
let isRefreshing = false;

// Queue of requests that arrived while a refresh was already in-flight.
// They are all retried (or rejected) together once the refresh resolves.
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
const failedQueue: QueueEntry[] = [];

function processQueue(err: unknown, token: string | null): void {
  for (const entry of failedQueue) {
    if (err !== null || token === null) {
      entry.reject(err);
    } else {
      entry.resolve(token);
    }
  }
  failedQueue.length = 0;
}

// ---------------------------------------------------------------------------
// Response interceptor — handle success toasts, 401 with token refresh + retry,
// and error toasts.
// ---------------------------------------------------------------------------
_http.interceptors.response.use(
  (response) => {
    const cfg = response.config as InternalAxiosRequestConfig;
    const shouldToast = cfg._toast !== false;
    const isWrite = ["post", "put", "patch", "delete"].includes(
      response.config.method?.toLowerCase() ?? "",
    );
    const apiData = response.data as ApiResponse<unknown>;

    if (shouldToast && isWrite && apiData?.message) {
      toast.success(apiData.message);
    }

    return response;
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const originalRequest = axiosError.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const shouldToast = originalRequest?._toast !== false;

    // Only handle 401 that is NOT already a retry and NOT the refresh call itself.
    if (
      axiosError.response?.status !== 401 ||
      originalRequest === undefined ||
      originalRequest._retry === true ||
      originalRequest.url === "/api/auth/refresh"
    ) {
      const statusCode = axiosError.response?.status;
      const apiData = axiosError.response?.data as
        | ApiResponse<unknown>
        | undefined;

      if (shouldToast && apiData?.message && statusCode !== 401) {
        toast.error(apiData.message);
      }

      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();

    // No refresh token stored — clear auth and redirect immediately.
    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      // NOTE: window.location.replace is intentional here — do NOT change to router.navigate().
      // This interceptor lives outside the React tree and cannot access the router instance.
      // A router.navigate() call here would create an infinite interceptor loop.
      // window.location.replace("/login");
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request until it resolves.
    if (isRefreshing) {
      return new Promise<unknown>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
            }
            resolve(_http(originalRequest));
          },
          reject,
        });
      });
    }

    // Mark as retry to prevent looping.
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data: refreshResponse } = await axios.post<
        ApiResponse<LoginTokens>
      >(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );

      if (
        refreshResponse.status !== "success" ||
        refreshResponse.data === null
      ) {
        throw new Error("Refresh response indicated failure");
      }

      const { accessToken: newAccess, refreshToken: newRefresh } =
        refreshResponse.data;

      // Persist the new tokens.  User object stays unchanged.
      const currentUser = useAuthStore.getState().user;
      if (currentUser !== null) {
        useAuthStore.getState().setAuth(currentUser, newAccess, newRefresh);
      } else {
        // Edge case: user was wiped but tokens were still present.
        // Store tokens minimally so queued requests can proceed, then
        // the app will re-fetch the session on next navigation.
        useAuthStore.setState({
          accessToken: newAccess,
          refreshToken: newRefresh,
        });
      }

      // Drain the queue with the new token.
      processQueue(null, newAccess);

      // Retry the original request.
      originalRequest.headers.set("Authorization", `Bearer ${newAccess}`);
      return _http(originalRequest);
    } catch (refreshError: unknown) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      // NOTE: window.location.replace is intentional here — do NOT change to router.navigate().
      // This interceptor lives outside the React tree and cannot access the router instance.
      // A router.navigate() call here would create an infinite interceptor loop.
      window.location.replace("/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---------------------------------------------------------------------------
// Typed API client — the backend always returns ApiResponse<T>.
// Callers only specify the inner T; ApiResponse is implicit.
// ---------------------------------------------------------------------------
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    _http.get<ApiResponse<T>>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    _http.post<ApiResponse<T>>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    _http.put<ApiResponse<T>>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    _http.patch<ApiResponse<T>>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    _http.delete<ApiResponse<T>>(url, config),
};
