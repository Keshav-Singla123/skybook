"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "@/components/ui/Input";
import { FlightCard } from "@/components/flights/FlightCard";
import type { Flight, SeatClass, SortOption } from "@/types";
import { getFlightDurationMinutes } from "@/lib/utils";
import { useFlightStore } from "@/lib/store/flightStore";

interface FlightResultsProps {
  flights: Flight[];
  seatClass: SeatClass;
}

export function FlightResults({ flights, seatClass }: FlightResultsProps) {
  const [sort, setSort] = useState<SortOption>("price");
  const setSearchResults = useFlightStore((state) => state.setSearchResults);

  const sortedFlights = useMemo(() => {
    const next = [...flights];
    if (sort === "duration") next.sort((a, b) => getFlightDurationMinutes(a) - getFlightDurationMinutes(b));
    if (sort === "departure") next.sort((a, b) => new Date(a.departs_at).getTime() - new Date(b.departs_at).getTime());
    if (sort === "price") next.sort((a, b) => a.base_price - b.base_price);
    return next;
  }, [flights, sort]);

  useEffect(() => {
    setSearchResults(sortedFlights);
  }, [setSearchResults, sortedFlights]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <p className="text-sm font-medium text-slate-600">{sortedFlights.length} matching flights</p>
        <Select className="md:w-56" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
          <option value="price">Sort by price</option>
          <option value="duration">Sort by duration</option>
          <option value="departure">Sort by departure</option>
        </Select>
      </div>
      {sortedFlights.map((flight) => <FlightCard key={flight.id} flight={flight} seatClass={seatClass} />)}
    </div>
  );
}
