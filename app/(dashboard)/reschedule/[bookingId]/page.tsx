import Link from "next/link";
import { RescheduleFlow } from "@/components/bookings/RescheduleFlow";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import type { BookingWithDetails, Flight } from "@/types";

interface ReschedulePageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase.from("bookings").select("*, flights(*), seats(*), passengers(*)").eq("id", bookingId).single();
  const typedBooking = booking as BookingWithDetails | null;
  const oldFlight = typedBooking?.flights;
  const { data: alternatives } = oldFlight
    ? await supabase.from("flights").select("*").eq("origin", oldFlight.origin).eq("destination", oldFlight.destination).neq("id", oldFlight.id).gte("departs_at", new Date().toISOString()).order("departs_at")
    : { data: [] };

  if (!typedBooking || !oldFlight) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFF] p-6">
        <section className="sky-card rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-[#0C1445]">Booking not found</h1>
          <Link href="/my-bookings"><Button className="mt-5">Back to bookings</Button></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#0369A1]">Change flights</p>
          <h1 className="font-display text-4xl font-extrabold text-[#0C1445]">Reschedule booking</h1>
        </div>
        {(alternatives ?? []).length > 0 ? (
          <RescheduleFlow booking={typedBooking} alternatives={(alternatives ?? []) as Flight[]} />
        ) : (
          <section className="sky-card rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-[#0C1445]">No alternatives available</h2>
            <p className="mt-2 text-slate-600">Seed data has one future flight per direction, so add more flights for richer rescheduling demos.</p>
          </section>
        )}
      </div>
    </main>
  );
}
