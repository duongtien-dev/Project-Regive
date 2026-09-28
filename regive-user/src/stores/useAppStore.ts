import { create } from "zustand";

type AppState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (sidebarCollapsed: boolean) => void;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
