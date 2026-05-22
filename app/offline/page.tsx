"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookingCard } from "@/components/bookings/BookingCard";
import { useUserStore } from "@/lib/store/userStore";

export default function OfflinePage() {
  const cachedBookings = useUserStore((state) => state.cachedBookings);

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="sky-card overflow-hidden rounded-2xl p-8 text-center">
          <svg className="mx-auto h-32 w-32" viewBox="0 0 200 200" role="img" aria-label="Plane flying offline">
            <circle cx="100" cy="100" r="88" fill="#DBEAFE" />
            <path d="M42 106l112-50c8-4 15 5 9 12l-33 39 22 30c4 5-2 12-8 9l-34-17-25 30c-4 5-12 2-12-4v-39l-31-10z" fill="#0EA5E9" />
            <path d="M64 143h72" stroke="#0C1445" strokeWidth="8" strokeLinecap="round" strokeDasharray="10 12" />
          </svg>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-[#0C1445]">You&apos;re offline</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">Your saved bookings are still available below. New searches and booking changes will work again once the network returns.</p>
          <Link href="/"><Button className="mt-6"><Plane className="h-4 w-4" /> Back home</Button></Link>
        </section>
        <section className="mt-8">
          <h2 className="mb-4 font-display text-2xl font-bold text-[#0C1445]">Saved bookings</h2>
          <div className="space-y-4">
            {cachedBookings.length > 0 ? cachedBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onCancelled={() => undefined} />) : <p className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">No cached bookings yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
