import axios from "axios";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse, AppUser, LoginTokens, SessionUser } from "@/types";

async function bootstrapSession(): Promise<void> {
  const { refreshToken, accessToken } = useAuthStore.getState();

  // Already have an access token in memory (same-tab navigation) — nothing to do.
  if (accessToken !== null) return;

  // No refresh token either — user is genuinely unauthenticated.
  if (refreshToken === null) return;

  try {
    const { data: refreshResponse } = await axios.post<
      ApiResponse<LoginTokens>
    >(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    if (refreshResponse.status !== "success" || refreshResponse.data === null) {
      useAuthStore.getState().clearAuth();
      return;
    }

    const { accessToken: newAccess, refreshToken: newRefresh } =
      refreshResponse.data;

    // Fetch session to restore the full user object.
    const { data: sessionResponse } = await axios.get<ApiResponse<SessionUser>>(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/session`,
      {
        headers: {
          Authorization: `Bearer ${newAccess}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (
      sessionResponse.status !== "success" ||
      sessionResponse.data === null ||
      !sessionResponse.data.isActive
    ) {
      useAuthStore.getState().clearAuth();
      return;
    }

    useAuthStore
      .getState()
      .setAuth(sessionResponse.data as AppUser, newAccess, newRefresh);
  } catch {
    // Any error during bootstrap = treat as unauthenticated. Don't throw.
    useAuthStore.getState().clearAuth();
  }
}

const RootLayout = () => (
  <>
    <Outlet />
    {import.meta.env.DEV && <TanStackRouterDevtools />}
    {import.meta.env.DEV && <ReactQueryDevtools />}
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: bootstrapSession,
});
