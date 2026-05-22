"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Plane, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Flight, SeatClass } from "@/types";
import { calculateFlightPrice, formatCurrency, formatDateTime, getFlightDuration } from "@/lib/utils";
import { useFlightStore } from "@/lib/store/flightStore";

interface FlightCardProps {
  flight: Flight;
  seatClass: SeatClass;
}

export function FlightCard({ flight, seatClass }: FlightCardProps) {
  const router = useRouter();
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setCurrentStep = useFlightStore((state) => state.setCurrentStep);
  const price = calculateFlightPrice(flight.base_price, seatClass);

  return (
    <article className="sky-card relative overflow-hidden rounded-2xl p-5">
      <div className="absolute right-0 top-0 h-24 w-36 rounded-bl-full bg-gradient-to-br from-sky-100 to-amber-100 opacity-70" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C1445] to-[#0EA5E9] text-white shadow-lg shadow-sky-900/20">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold text-[#0C1445]">{flight.flight_no}</h2>
              <Badge tone={flight.status === "delayed" ? "gold" : "success"}>{flight.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{flight.aircraft_type} - Direct</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Lock-protected booking
            </p>
          </div>
        </div>
        <div className="grid flex-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:px-8">
          <div>
            <p className="font-display text-2xl font-bold text-[#0C1445]">{formatDateTime(flight.departs_at, "time")}</p>
            <p className="text-sm font-medium text-slate-600">{flight.origin}</p>
          </div>
          <div className="flex items-center gap-3 text-slate-400 md:flex-col md:justify-center">
            <span className="route-line hidden h-1 w-28 rounded-full md:block" />
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#0EA5E9] shadow-sm">
              <ArrowRight className="h-5 w-5" />
            </span>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {getFlightDuration(flight.departs_at, flight.arrives_at)}
            </div>
          </div>
          <div className="md:text-right">
            <p className="font-display text-2xl font-bold text-[#0C1445]">{formatDateTime(flight.arrives_at, "time")}</p>
            <p className="text-sm font-medium text-slate-600">{flight.destination}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-sm md:text-right">
          <p className="text-xs uppercase text-slate-500">from</p>
          <p className="font-display text-2xl font-extrabold text-[#0369A1]">{formatCurrency(price)}</p>
          <Button
            className="mt-3 w-full md:w-auto"
            onClick={() => {
              setSelectedFlight(flight);
              setCurrentStep("seats");
              router.push(`/seats/${flight.id}`);
            }}
          >
            Select
          </Button>
        </div>
      </div>
    </article>
  );
}
