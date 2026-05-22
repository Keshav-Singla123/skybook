import type { Seat } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function SeatTooltip({ seat }: { seat: Seat }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white shadow-xl group-hover:block">
      {seat.seat_number} · {seat.class} · {formatCurrency(seat.extra_fee)}
    </span>
  );
}
