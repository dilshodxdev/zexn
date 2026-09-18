import { create } from "zustand";

/**
 * Sessiya holati (client state). 2-bosqichda to'ldiriladi: login -> setSession, logout -> clear.
 * Access token xotirada (Zustand), refresh token httpOnly cookie'da - localStorage'da token yo'q.
 */
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ accessToken: null }),
}));
