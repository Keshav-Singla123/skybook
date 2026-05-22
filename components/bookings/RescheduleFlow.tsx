"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BookingWithDetails, Flight } from "@/types";
import { toast } from "@/components/ui/Toast";

interface RescheduleFlowProps {
  booking: BookingWithDetails;
  alternatives: Flight[];
}

export function RescheduleFlow({ booking, alternatives }: RescheduleFlowProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(false);
  const oldFlight = booking.flights;

  async function confirm() {
    if (!selected || !oldFlight) return;
    setLoading(true);
    const fee = Math.max(0, selected.base_price - oldFlight.base_price);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("bookings").update({ flight_id: selected.id, status: "rescheduled" }).eq("id", booking.id);
    const { error: insertError } = await supabase.from("reschedules").insert({ booking_id: booking.id, old_flight_id: oldFlight.id, new_flight_id: selected.id, fee_charged: fee });
    setLoading(false);
    if (updateError || insertError) {
      toast(updateError?.message ?? insertError?.message ?? "Couldn't move this booking to the new flight.", "error");
      return;
    }
    toast("Flight moved. Check My Bookings for the new timing.", "success");
    router.push("/my-bookings");
  }

  return (
    <div className="space-y-5">
      <section className="sky-card rounded-2xl p-5">
        <Badge tone="sky">Original booking</Badge>
        <h2 className="mt-3 font-display text-2xl font-bold text-[#0C1445]">{oldFlight?.flight_no} · {oldFlight?.origin} to {oldFlight?.destination}</h2>
        <p className="mt-2 text-sm text-slate-600">{oldFlight ? formatDateTime(oldFlight.departs_at) : ""}</p>
      </section>
      <div className="space-y-3">
        {alternatives.map((flight) => {
          const difference = oldFlight ? Math.max(0, flight.base_price - oldFlight.base_price) : 0;
          return (
            <button key={flight.id} className="sky-card w-full rounded-2xl p-5 text-left" onClick={() => setSelected(flight)}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#0C1445]">{flight.flight_no}</h3>
                  <p className="text-sm text-slate-600">{formatDateTime(flight.departs_at)} · {flight.aircraft_type}</p>
                </div>
                <div className="text-sm md:text-right">
                  <p className="font-semibold text-[#0369A1]">Fee {formatCurrency(difference)}</p>
                  <p className="text-slate-500">New fare {formatCurrency(flight.base_price)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Confirm reschedule" description="Your booking will move to the selected flight.">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{selected?.flight_no} departing {selected ? formatDateTime(selected.departs_at) : ""}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelected(null)} disabled={loading}>Back</Button>
            <Button onClick={confirm} disabled={loading}>{loading ? "Rescheduling..." : "Confirm"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
