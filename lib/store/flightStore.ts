"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FlightStoreState, PassengerForm, SearchQuery } from "@/types";
import { todayIsoDate } from "@/lib/utils";

const defaultSearchQuery: SearchQuery = {
  origin: "DEL",
  destination: "BOM",
  date: todayIsoDate(),
  passengers: 1,
  class: "economy",
};

const defaultPassengerForm: PassengerForm = {
  full_name: "",
  passport_no: "",
  nationality: "Indian",
  dob: "",
};

export const useFlightStore = create<FlightStoreState>()(
  persist(
    (set) => ({
      searchQuery: defaultSearchQuery,
      recentSearches: [],
      searchResults: [],
      selectedFlight: null,
      selectedSeat: null,
      optimisticSeatId: null,
      currentStep: "search",
      passengerForm: defaultPassengerForm,
      setSearchQuery: (query) =>
        set((state) => ({
          searchQuery: query,
          recentSearches: [query, ...state.recentSearches.filter((item) => JSON.stringify(item) !== JSON.stringify(query))].slice(0, 4),
        })),
      setSearchResults: (flights) => set({ searchResults: flights }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat, optimisticSeatId: seat?.id ?? null }),
      setOptimisticSeat: (seatId) => set({ optimisticSeatId: seatId }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPassengerForm: (form) => set((state) => ({ passengerForm: { ...state.passengerForm, ...form } })),
      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          optimisticSeatId: null,
          currentStep: "search",
          passengerForm: defaultPassengerForm,
        }),
    }),
    {
      name: "skybook-flight-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        recentSearches: state.recentSearches,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        currentStep: state.currentStep,
        passengerForm: { ...state.passengerForm, passport_no: "" },
      }),
    },
  ),
);
