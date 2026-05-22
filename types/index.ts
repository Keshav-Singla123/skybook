import type { Session, User } from "@supabase/supabase-js";

export type SeatClass = "economy" | "business" | "first";
export type FlightStatus = "scheduled" | "delayed" | "boarding" | "departed" | "landed" | "cancelled";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";
export type BookingStep = "search" | "results" | "seats" | "passenger" | "confirmation";
export type SortOption = "price" | "duration" | "departure";

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
}

export interface BookingWithDetails extends Booking {
  flights: Flight | null;
  seats: Seat | null;
  passengers: Passenger[] | null;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
}

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  class: SeatClass;
}

export interface PassengerForm {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

export interface FlightStoreState {
  searchQuery: SearchQuery;
  recentSearches: SearchQuery[];
  searchResults: Flight[];
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  optimisticSeatId: string | null;
  currentStep: BookingStep;
  passengerForm: PassengerForm;
  setSearchQuery: (query: SearchQuery) => void;
  setSearchResults: (flights: Flight[]) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setOptimisticSeat: (seatId: string | null) => void;
  setCurrentStep: (step: BookingStep) => void;
  setPassengerForm: (form: Partial<PassengerForm>) => void;
  resetBooking: () => void;
}

export interface UserStoreState {
  user: User | null;
  session: Session | null;
  cachedBookings: BookingWithDetails[];
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setCachedBookings: (bookings: BookingWithDetails[]) => void;
  clearUser: () => void;
}

export interface RpcSuccess {
  success: true;
  booking_id?: string;
  pnr_code?: string;
}

export interface RpcFailure {
  success: false;
  error: string;
}

export type RpcResult = RpcSuccess | RpcFailure;

export interface City {
  code: string;
  name: string;
  airport: string;
}

export const INDIAN_CITIES: City[] = [
  { code: "DEL", name: "Delhi", airport: "Indira Gandhi International" },
  { code: "BOM", name: "Mumbai", airport: "Chhatrapati Shivaji Maharaj International" },
  { code: "BLR", name: "Bangalore", airport: "Kempegowda International" },
  { code: "HYD", name: "Hyderabad", airport: "Rajiv Gandhi International" },
  { code: "GOI", name: "Goa", airport: "Dabolim Airport" },
];

export interface Database {
  public: {
    Tables: {
      flights: { Row: Flight; Insert: Omit<Flight, "id"> & { id?: string }; Update: Partial<Flight>; Relationships: [] };
      seats: { Row: Seat; Insert: Omit<Seat, "id"> & { id?: string }; Update: Partial<Seat>; Relationships: [] };
      bookings: { Row: Booking; Insert: Omit<Booking, "id" | "booked_at" | "pnr_code"> & { id?: string; booked_at?: string; pnr_code?: string }; Update: Partial<Booking>; Relationships: [] };
      passengers: { Row: Passenger; Insert: Omit<Passenger, "id"> & { id?: string }; Update: Partial<Passenger>; Relationships: [] };
      reschedules: { Row: Reschedule; Insert: Omit<Reschedule, "id" | "requested_at"> & { id?: string; requested_at?: string }; Update: Partial<Reschedule>; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_seat: { Args: { p_flight_id: string; p_seat_id: string; p_user_id: string; p_total_price: number; p_pnr_code: string; p_full_name: string; p_passport_no: string; p_nationality: string; p_dob: string }; Returns: RpcResult };
      cancel_booking: { Args: { p_booking_id: string; p_user_id: string }; Returns: RpcResult };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
