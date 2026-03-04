import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, PermissionKey, Role } from "@/types";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import type { Permission } from "@/constants/permissions";
import { UserRole } from "@/types";
// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
interface AuthState {
  user: AppUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /**
   * Derived convenience flag — true when an accessToken is present.
   * Kept in state (not computed) so route guards can read it synchronously
   * via `useAuthStore.getState().isAuthenticated` without subscribing.
   */
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
interface AuthActions {
  /**
   * Called after a successful login + session fetch.
   * Stores both tokens and the resolved app-level user.
   */
  setAuth: (user: AppUser, accessToken: string, refreshToken: string) => void;

  /** Wipes all auth state — call on logout or after a failed token refresh. */
  clearAuth: () => void;

  /**
   * Returns true if the current user holds the given permission.
   * super_admin short-circuits to true for every key.
   * Returns false when no user is loaded.
   */
  hasPermission: (key: PermissionKey) => boolean;
}

type AuthStore = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const INITIAL_STATE: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

// ---------------------------------------------------------------------------
// Store
// Tokens are persisted to localStorage so they survive a page refresh.
// The user object is intentionally NOT persisted — it is always re-fetched
// from /api/auth/session on load so it stays fresh.
// ---------------------------------------------------------------------------
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      clearAuth: () => set(INITIAL_STATE),

      hasPermission: (key: PermissionKey): boolean => {
        const { user } = get();
        if (!user) return false;
        if (user.roles.includes(UserRole.SUPER_ADMIN)) return true;
        return user.roles.some((r) =>
          ROLE_PERMISSIONS[r as Role]?.includes(key as Permission),
        );
      },
    }),
    {
      name: "trusst-auth",
      // SECURITY: accessToken is intentionally NOT persisted — it is memory-only and
      // short-lived. On page refresh, the interceptor will use the persisted refreshToken
      // to obtain a new accessToken on the first authenticated request.
      //
      // refreshToken is persisted to localStorage. Known risk: XSS-accessible.
      // Migration to HttpOnly cookie is pending backend support (tracked: DEV-backend-cookies).
      partialize: (state): Pick<AuthState, "refreshToken"> => ({
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = false;
          state.accessToken = null;
          state.user = null;
        }
      },
    },
  ),
);

// ---------------------------------------------------------------------------
// Granular selectors — use these in components to avoid unnecessary re-renders
// ---------------------------------------------------------------------------
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
