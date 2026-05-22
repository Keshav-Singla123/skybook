import Link from "next/link";
import { FlightResults } from "@/components/flights/FlightResults";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import type { Flight, SeatClass } from "@/types";

interface ResultsPageProps {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
    class?: SeatClass;
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const origin = params.origin ?? "DEL";
  const destination = params.destination ?? "BOM";
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const seatClass = params.class ?? "economy";
  const start = new Date(`${date}T00:00:00.000Z`).toISOString();
  const end = new Date(`${date}T23:59:59.999Z`).toISOString();
  const supabase = await createClient();

  const { data } = await supabase
    .from("flights")
    .select("*, seats!inner(id)")
    .eq("origin", origin)
    .eq("destination", destination)
    .gte("departs_at", start)
    .lte("departs_at", end)
    .eq("seats.class", seatClass)
    .eq("seats.is_available", true);

  const flights: Flight[] = (data ?? []).map((row) => ({
    id: row.id,
    flight_no: row.flight_no,
    origin: row.origin,
    destination: row.destination,
    departs_at: row.departs_at,
    arrives_at: row.arrives_at,
    aircraft_type: row.aircraft_type,
    status: row.status,
    base_price: row.base_price,
  }));

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#0369A1]">{origin} to {destination}</p>
            <h1 className="font-display text-4xl font-extrabold text-[#0C1445]">Available flights</h1>
            <p className="mt-2 text-sm text-slate-600">{date} · {seatClass} cabin · direct routes</p>
          </div>
          <Link href="/search"><Button variant="secondary">Modify search</Button></Link>
        </div>
        {flights.length > 0 ? (
          <FlightResults flights={flights} seatClass={seatClass} />
        ) : (
          <section className="sky-card rounded-2xl p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-[#0C1445]">No matching flights</h2>
            <p className="mt-2 text-slate-600">Try another date or cabin. Seeded flights depart 2 to 7 days from when you run the seed SQL.</p>
            <Link href="/search"><Button className="mt-6">Search again</Button></Link>
          </section>
        )}
      </div>
    </main>
  );
}
