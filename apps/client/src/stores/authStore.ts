import { create } from "zustand";
import type { AuthResponse, MembershipSummary, UserSummary } from "@zexn/shared";

interface AuthState {
  accessToken: string | null;
  user: UserSummary | null;
  memberships: MembershipSummary[];
  currentMembership: MembershipSummary | null;
  setSession: (data: AuthResponse) => void;
  setCurrentMembership: (membership: MembershipSummary | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  memberships: [],
  currentMembership: null,
  setSession: (data: AuthResponse) =>
    set({
      accessToken: data.accessToken,
      user: data.user,
      memberships: data.memberships,
      currentMembership: data.currentMembership,
    }),
  setCurrentMembership: (currentMembership: MembershipSummary | null) => set({ currentMembership }),
  clear: () =>
    set({
      accessToken: null,
      user: null,
      memberships: [],
      currentMembership: null,
    }),
}));
