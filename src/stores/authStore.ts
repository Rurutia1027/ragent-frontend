import { create } from "zustand";

import type { User } from "@/types";
import { storage } from "@/utils/storage";

interface AuthState {
  user: User | null;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checkAuth: () => {
    set({ user: storage.getUser() });
  }
}));
