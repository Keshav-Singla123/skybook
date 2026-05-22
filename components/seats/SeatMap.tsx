"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, RefreshCw } from "lucide-react";
import type { Seat } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency } from "@/lib/utils";
import { useFlightStore } from "@/lib/store/flightStore";
import { Button } from "@/components/ui/Button";
import { SeatTooltip } from "@/components/seats/SeatTooltip";
import { SeatLegend } from "@/components/seats/SeatLegend";
import { toast } from "@/components/ui/Toast";

interface SeatMapProps {
  flightId: string;
  initialSeats: Seat[];
  yourSeatId?: string;
  readOnly?: boolean;
}

const rows = Array.from({ length: 30 }, (_, index) => index + 1);
const columns = ["A", "B", "C", "D", "E", "F"];

function zoneLabel(row: number): string | null {
  if (row === 1) return "First Class";
  if (row === 3) return "Business Class";
  if (row === 8) return "Economy Class";
  return null;
}

function seatTone(seat: Seat, selected: boolean, yourSeat: boolean): string {
  if (yourSeat) return "border-emerald-300 bg-emerald-100 text-emerald-800";
  if (selected) return "seat-pulse scale-110 border-[#0EA5E9] bg-[#0EA5E9] text-white";
  if (!seat.is_available) return "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400";
  if (seat.class === "first") return "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200";
  if (seat.class === "business") return "border-violet-200 bg-violet-100 text-violet-800 hover:bg-violet-200";
  return "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200";
}

export function SeatMap({ flightId, initialSeats, yourSeatId, readOnly = false }: SeatMapProps) {
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const optimisticSeatId = useFlightStore((state) => state.optimisticSeatId);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const setOptimisticSeat = useFlightStore((state) => state.setOptimisticSeat);
  const setCurrentStep = useFlightStore((state) => state.setCurrentStep);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`seats-${flightId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seats", filter: `flight_id=eq.${flightId}` },
        async () => {
          const { data, error } = await supabase.from("seats").select("*").eq("flight_id", flightId).order("seat_number");
          if (!error && data) setSeats(data);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [flightId]);

  const seatByNumber = useMemo(() => new Map(seats.map((seat) => [seat.seat_number, seat])), [seats]);
  const selected = seats.find((seat) => seat.id === optimisticSeatId) ?? selectedSeat;

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
        <div className="min-w-[440px] space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[#0C1445] px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-display font-bold"><Armchair className="h-5 w-5" /> Cabin seat map</div>
            <div className="flex items-center gap-2 text-xs text-sky-100"><RefreshCw className="h-3.5 w-3.5" /> Live updates</div>
          </div>
          {rows.map((row) => (
            <div key={row}>
              {zoneLabel(row) ? <div className="my-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold uppercase text-slate-500">{zoneLabel(row)}</div> : null}
              <div className="grid grid-cols-[32px_repeat(3,40px)_28px_repeat(3,40px)] items-center gap-2">
                <span className="text-right text-xs font-semibold text-slate-400">{row}</span>
                {columns.map((column) => {
                  const seatNumber = `${row}${column}`;
                  const seat = seatByNumber.get(seatNumber);
                  const aisle = column === "D";
                  if (!seat) return <span key={seatNumber} className={cn("h-10", aisle && "col-start-6")} />;
                  const isSelected = optimisticSeatId === seat.id;
                  const isYourSeat = yourSeatId === seat.id;
                  return (
                    <button
                      key={seat.id}
                      disabled={readOnly || !seat.is_available}
                      onClick={() => {
                        setOptimisticSeat(seat.id);
                        setSelectedSeat(seat);
                      }}
                      className={cn("group relative flex h-10 min-w-10 items-center justify-center rounded-lg border text-xs font-bold transition active:scale-95", aisle && "col-start-6", seatTone(seat, isSelected, isYourSeat))}
                      aria-label={`Seat ${seat.seat_number}, ${seat.class}, ${formatCurrency(seat.extra_fee)}`}
                    >
                      {column}
                      <SeatTooltip seat={seat} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SeatLegend />
      {!readOnly ? (
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center">
          <p className="text-sm text-slate-600">{selected ? `Selected ${selected.seat_number} · ${selected.class} · ${formatCurrency(selected.extra_fee)} extra` : "Choose an available seat to continue."}</p>
          <Button
            disabled={!selected}
            onClick={() => {
              if (!selected) {
                toast("Select a seat first.", "error");
                return;
              }
              setCurrentStep("passenger");
              router.push(`/booking/${flightId}`);
            }}
          >
            Continue
          </Button>
        </div>
      ) : null}
    </div>
  );
}
