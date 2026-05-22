import Link from "next/link";
import { SeatMap } from "@/components/seats/SeatMap";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

interface SeatPageProps {
  params: Promise<{ flightId: string }>;
}

export default async function SeatPage({ params }: SeatPageProps) {
  const { flightId } = await params;
  const supabase = await createClient();
  const [{ data: flight }, { data: seats }] = await Promise.all([
    supabase.from("flights").select("*").eq("id", flightId).single(),
    supabase.from("seats").select("*").eq("flight_id", flightId).order("seat_number"),
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#0369A1]">{flight?.origin} to {flight?.destination}</p>
            <h1 className="font-display text-4xl font-extrabold text-[#0C1445]">Select your seat</h1>
          </div>
          <Link href="/search"><Button variant="secondary">New search</Button></Link>
        </div>
        <SeatMap flightId={flightId} initialSeats={seats ?? []} />
      </div>
    </main>
  );
}
