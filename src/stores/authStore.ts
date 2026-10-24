import { create } from "zustand";

import type { User } from "@/types";
import { storage } from "@/utils/storage";

import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@/services/authService";
import { setAuthToken } from "@/services/api";
import { useChatStore } from "@/stores/chatStore";


interface AuthState {
  user: User | null;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checkAuth: () => {
    set({ user: storage.getUser() });
  },
}));
