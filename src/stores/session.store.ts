import { create } from "zustand";

// ---------------------------------------------------------------------------
// Session Store — client-side UI state only.
//
// This store holds ONLY the one piece of global client state that cannot live
// in TanStack Query: whether the stale session banner has been dismissed
// for the current browser session.
//
// Everything else (session state, logs, timers) is server state that lives
// in TanStack Query or component-local state.
// ---------------------------------------------------------------------------
interface SessionState {
  staleBannerDismissed: boolean;
  dismissStaleBanner: () => void;
  resetStaleBanner: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  staleBannerDismissed: false,
  dismissStaleBanner: () => set({ staleBannerDismissed: true }),
  resetStaleBanner: () => set({ staleBannerDismissed: false }),
}));
