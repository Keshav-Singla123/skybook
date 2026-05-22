"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Plane, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CancelDialog } from "@/components/bookings/CancelDialog";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { BookingWithDetails, RpcResult } from "@/types";
import { toast } from "@/components/ui/Toast";
import { useFlightStore } from "@/lib/store/flightStore";

interface BookingCardProps {
  booking: BookingWithDetails;
  onCancelled: (bookingId: string) => void;
}

function isRpcResult(value: unknown): value is RpcResult {
  return typeof value === "object" && value !== null && "success" in value;
}

export function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const resetBooking = useFlightStore((state) => state.resetBooking);
  const flight = booking.flights;
  const seat = booking.seats;
  const passenger = booking.passengers?.[0];

  async function cancel() {
    setLoading(true);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      toast("Please log in again to cancel.", "error");
      return;
    }
    const { data, error } = await supabase.rpc("cancel_booking", { p_booking_id: booking.id, p_user_id: authData.user.id });
    setLoading(false);
    setOpen(false);
    if (error || !isRpcResult(data) || !data.success) {
      toast(error?.message ?? (isRpcResult(data) && !data.success ? data.error : "Could not cancel booking"), "error");
      return;
    }
    resetBooking();
    onCancelled(booking.id);
    toast("Booking cancelled and seat released.", "success");
  }

  return (
    <article className="sky-card rounded-2xl p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0C1445] text-white"><Plane className="h-6 w-6" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#0C1445]">{booking.pnr_code}</h2>
              <Badge tone={booking.status === "cancelled" ? "danger" : booking.status === "rescheduled" ? "purple" : "success"}>{booking.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">{flight?.flight_no} · {flight?.origin} to {flight?.destination}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><CalendarClock className="h-4 w-4 text-[#0EA5E9]" /> {flight ? formatDateTime(flight.departs_at) : ""}</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3 lg:min-w-[360px]">
          <div><span className="block text-xs text-slate-400">Passenger</span><strong>{passenger?.full_name}</strong></div>
          <div><span className="block text-xs text-slate-400">Seat</span><strong>{seat?.seat_number}</strong></div>
          <div><span className="block text-xs text-slate-400">Total</span><strong>{formatCurrency(booking.total_price)}</strong></div>
        </div>
        {booking.status !== "cancelled" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/reschedule/${booking.id}`}><Button className="w-full" variant="secondary"><RefreshCw className="h-4 w-4" /> Reschedule</Button></Link>
            <Button className="w-full" variant="danger" onClick={() => setOpen(true)}><XCircle className="h-4 w-4" /> Cancel</Button>
          </div>
        ) : null}
      </div>
      <CancelDialog open={open} loading={loading} onClose={() => setOpen(false)} onConfirm={cancel} />
    </article>
  );
}
