"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { INDIAN_CITIES, type SeatClass, type SearchQuery } from "@/types";
import { useFlightStore } from "@/lib/store/flightStore";
import { todayIsoDate } from "@/lib/utils";
import { toast } from "@/components/ui/Toast";

interface FlightSearchProps {
  compact?: boolean;
}

export function FlightSearch({ compact = false }: FlightSearchProps) {
  const router = useRouter();
  const searchQuery = useFlightStore((state) => state.searchQuery);
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);
  const recentSearches = useFlightStore((state) => state.recentSearches);
  const [form, setForm] = useState<SearchQuery>(searchQuery);

  const routeOptions = useMemo(() => INDIAN_CITIES, []);

  function update<K extends keyof SearchQuery>(key: K, value: SearchQuery[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.origin === form.destination) {
      toast("Origin and destination must be different.", "error");
      return;
    }
    setSearchQuery(form);
    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      passengers: String(form.passengers),
      class: form.class,
    });
    router.push(`/flights/results?${params.toString()}`);
  }

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5">
      {!compact ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase text-[#0369A1]"><Sparkles className="h-3.5 w-3.5" /> Smart fare finder</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-[#0C1445]">Book your next flight</h2>
          </div>
          <div className="hidden rounded-2xl bg-[#0C1445] px-4 py-3 text-right text-white sm:block">
            <p className="text-xs text-sky-100">Live inventory</p>
            <p className="font-display text-lg font-bold">30 rows</p>
          </div>
        </div>
      ) : null}
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-6">
        <Field label="Origin">
          <Select value={form.origin} onChange={(event) => update("origin", event.target.value)}>
            {routeOptions.map((city) => <option key={city.code} value={city.code}>{city.name} ({city.code})</option>)}
          </Select>
        </Field>
        <Field label="Destination">
          <Select value={form.destination} onChange={(event) => update("destination", event.target.value)}>
            {routeOptions.map((city) => <option key={city.code} value={city.code}>{city.name} ({city.code})</option>)}
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" min={todayIsoDate()} value={form.date} onChange={(event) => update("date", event.target.value)} />
        </Field>
        <Field label="Passengers">
          <Input type="number" min={1} max={9} value={form.passengers} onChange={(event) => update("passengers", Number(event.target.value))} />
        </Field>
        <Field label="Class">
          <Select value={form.class} onChange={(event) => update("class", event.target.value as SeatClass)}>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </Select>
        </Field>
        <div className="flex items-end">
          <Button className="w-full" type="submit" size={compact ? "md" : "lg"}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>
      </form>
      {recentSearches.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4 text-[#0EA5E9]" />
          {recentSearches.map((recent) => (
            <button
              key={`${recent.origin}-${recent.destination}-${recent.date}-${recent.class}`}
              className="rounded-full border border-sky-100 bg-white/80 px-3 py-1 font-medium text-[#0369A1] shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
              onClick={() => setForm(recent)}
            >
              {recent.origin} to {recent.destination}, {recent.date}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
