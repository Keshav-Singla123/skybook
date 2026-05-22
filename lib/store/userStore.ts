"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserStoreState } from "@/types";

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      cachedBookings: [],
      accessToken: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, accessToken: session?.access_token ?? null }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      clearUser: () => set({ user: null, session: null, accessToken: null, cachedBookings: [] }),
    }),
    {
      name: "skybook-user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.session?.access_token ?? state.accessToken,
        cachedBookings: state.cachedBookings,
      }),
    },
  ),
);
