import { create } from "zustand";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
type UIState = {
  sidebarOpen: boolean;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
type UIActions = {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

type UIStore = UIState & UIActions;

// ---------------------------------------------------------------------------
// Store
// UI state is intentionally NOT persisted — layout resets on page load.
// ---------------------------------------------------------------------------
export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: true,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
