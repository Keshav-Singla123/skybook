import { BookingsList } from "@/components/bookings/BookingsList";
import { createClient } from "@/lib/supabase/server";
import type { BookingWithDetails } from "@/types";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(*)")
    .order("booked_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#0369A1]">Your trips</p>
          <h1 className="font-display text-4xl font-extrabold text-[#0C1445]">My Bookings</h1>
        </div>
        <BookingsList bookings={(data ?? []) as BookingWithDetails[]} />
      </div>
    </main>
  );
}
