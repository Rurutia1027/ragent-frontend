import { create } from "zustand";

import { storage } from "@/utils/storage";

interface ThemeState {
  theme: string | null;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: null,
  initialize: () => {
    set({ theme: storage.getTheme() });
  }
}));
