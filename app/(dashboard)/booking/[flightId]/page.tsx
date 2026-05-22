"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/lib/store/flightStore";
import { calculateFlightPrice, formatCurrency, formatDateTime, generatePNR } from "@/lib/utils";
import type { Flight, RpcResult, Seat } from "@/types";
import { toast } from "@/components/ui/Toast";

interface BookingPageProps {
  params: Promise<{ flightId: string }>;
}

function isRpcResult(value: unknown): value is RpcResult {
  return typeof value === "object" && value !== null && "success" in value;
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter();
  const [flightId, setFlightId] = useState("");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const passengerForm = useFlightStore((state) => state.passengerForm);
  const setPassengerForm = useFlightStore((state) => state.setPassengerForm);
  const optimisticSeatId = useFlightStore((state) => state.optimisticSeatId);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const setOptimisticSeat = useFlightStore((state) => state.setOptimisticSeat);
  const setCurrentStep = useFlightStore((state) => state.setCurrentStep);

  useEffect(() => {
    params.then(({ flightId: id }) => setFlightId(id));
  }, [params]);

  useEffect(() => {
    if (!flightId) return;
    const supabase = createClient();
    supabase.from("flights").select("*").eq("id", flightId).single().then(({ data }) => setFlight(data));
    if (optimisticSeatId) {
      supabase.from("seats").select("*").eq("id", optimisticSeatId).single().then(({ data }) => setSeat(data));
    }
  }, [flightId, optimisticSeatId, selectedSeat]);

  const activeSeat = seat ?? selectedSeat;
  const total = useMemo(() => {
    if (!flight || !activeSeat) return 0;
    return calculateFlightPrice(flight.base_price, activeSeat.class, activeSeat.extra_fee);
  }, [flight, activeSeat]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!flight || !activeSeat) {
      toast("Flight or seat selection is missing.", "error");
      router.push(`/seats/${flightId}`);
      return;
    }
    if (!passengerForm.full_name.trim() || !passengerForm.passport_no.trim() || !passengerForm.nationality.trim() || !passengerForm.dob) {
      toast("Complete every passenger field before booking.", "error");
      return;
    }
    setLoading(true);
    setOptimisticSeat(activeSeat.id);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      router.push("/login");
      return;
    }
    const { data, error } = await supabase.rpc("reserve_seat", {
      p_flight_id: flight.id,
      p_seat_id: activeSeat.id,
      p_user_id: authData.user.id,
      p_total_price: total,
      p_pnr_code: generatePNR(),
      p_full_name: passengerForm.full_name,
      p_passport_no: passengerForm.passport_no,
      p_nationality: passengerForm.nationality,
      p_dob: passengerForm.dob,
    });
    setLoading(false);
    if (error || !isRpcResult(data) || !data.success) {
      toast(error?.message ?? (isRpcResult(data) && !data.success ? data.error : "Seat no longer available"), "error");
      router.push(`/seats/${flight.id}`);
      return;
    }
    toast("Booking confirmed", "success");
    setCurrentStep("confirmation");
    router.push(`/confirmation/${data.booking_id ?? ""}`);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="sky-card h-fit rounded-2xl p-6">
          <h1 className="font-display text-3xl font-extrabold text-[#0C1445]">Booking summary</h1>
          {flight && activeSeat ? (
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-xl bg-sky-50 p-4">
                <p className="font-display text-xl font-bold text-[#0C1445]">{flight.flight_no}</p>
                <p className="text-slate-600">{flight.origin} to {flight.destination}</p>
                <p className="mt-2 text-slate-500">{formatDateTime(flight.departs_at)} - {formatDateTime(flight.arrives_at, "time")}</p>
              </div>
              <div className="flex justify-between"><span>Seat</span><strong>{activeSeat.seat_number} ({activeSeat.class})</strong></div>
              <div className="flex justify-between"><span>Base fare</span><strong>{formatCurrency(flight.base_price)}</strong></div>
              <div className="flex justify-between"><span>Seat fee</span><strong>{formatCurrency(activeSeat.extra_fee)}</strong></div>
              <div className="border-t border-dashed border-sky-200 pt-4 flex justify-between text-lg"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>
          ) : <p className="mt-4 text-sm text-slate-600">Loading your selected flight and seat...</p>}
        </section>
        <form onSubmit={submit} className="sky-card rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <UserRound className="h-6 w-6 text-[#0EA5E9]" />
            <h2 className="font-display text-2xl font-bold text-[#0C1445]">Passenger details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name"><Input value={passengerForm.full_name} onChange={(event) => setPassengerForm({ full_name: event.target.value })} required /></Field>
            <Field label="Passport Number"><Input value={passengerForm.passport_no} onChange={(event) => setPassengerForm({ passport_no: event.target.value.toUpperCase() })} required /></Field>
            <Field label="Nationality"><Input value={passengerForm.nationality} onChange={(event) => setPassengerForm({ nationality: event.target.value })} required /></Field>
            <Field label="Date of Birth"><Input type="date" value={passengerForm.dob} onChange={(event) => setPassengerForm({ dob: event.target.value })} required /></Field>
          </div>
          <Button className="mt-6 w-full" size="lg" type="submit" disabled={loading || !flight || !activeSeat}>
            <CreditCard className="h-4 w-4" /> {loading ? "Reserving seat..." : "Confirm Booking"}
          </Button>
        </form>
      </div>
    </main>
  );
}
