"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Luggage } from "lucide-react";
import type { BookingWithDetails } from "@/types";
import { useUserStore } from "@/lib/store/userStore";
import { BookingCard } from "@/components/bookings/BookingCard";
import { Button } from "@/components/ui/Button";

export function BookingsList({ bookings }: { bookings: BookingWithDetails[] }) {
  const [items, setItems] = useState(bookings);
  const setCachedBookings = useUserStore((state) => state.setCachedBookings);

  useEffect(() => {
    setCachedBookings(bookings);
  }, [bookings, setCachedBookings]);

  // TODO: add pagination here if bookings list gets long
  if (items.length === 0) {
    return (
      <section className="sky-card rounded-2xl p-10 text-center">
        <Luggage className="mx-auto h-16 w-16 text-[#0EA5E9]" />
        <h2 className="mt-4 font-display text-2xl font-bold text-[#0C1445]">No bookings yet</h2>
        <p className="mt-2 text-slate-600">Your upcoming flights will appear here after confirmation.</p>
        <Link href="/search"><Button className="mt-6">Book a flight</Button></Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancelled={(bookingId) => {
            setItems((current) => current.map((item) => (item.id === bookingId ? { ...item, status: "cancelled" } : item)));
          }}
        />
      ))}
    </div>
  );
}
