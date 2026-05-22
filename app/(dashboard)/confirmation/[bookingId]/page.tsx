import Link from "next/link";
import { Download, Plane } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(*)")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFF] p-6">
        <section className="sky-card rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-[#0C1445]">Booking not found</h1>
          <Link href="/my-bookings"><Button className="mt-5">View My Bookings</Button></Link>
        </section>
      </main>
    );
  }

  const flight = booking.flights;
  const seat = booking.seats;
  const passenger = booking.passengers?.[0];

  return (
    <main className="min-h-screen bg-[#F8FAFF] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <Badge tone="success">Confirmed</Badge>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-[#0C1445]">You are ready to fly</h1>
        </div>
        <section className="boarding-pass overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl">
          <div className="grid md:grid-cols-[1.4fr_0.8fr]">
            <div className="p-8">
              <div className="flex items-center gap-3">
                <Plane className="h-8 w-8 text-[#0EA5E9]" />
                <div>
                  <p className="font-display text-2xl font-bold text-[#0C1445]">{flight?.flight_no}</p>
                  <p className="text-sm text-slate-500">SkyBook Boarding Pass</p>
                </div>
              </div>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div><p className="text-xs font-semibold text-slate-400">Route</p><p className="font-display text-2xl font-bold">{flight?.origin} to {flight?.destination}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Departure</p><p className="font-semibold">{flight ? formatDateTime(flight.departs_at) : ""}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Passenger</p><p className="font-semibold">{passenger?.full_name}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Seat</p><p className="font-semibold">{seat?.seat_number} · {seat?.class}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">Paid</p><p className="font-semibold">{formatCurrency(booking.total_price)}</p></div>
              </div>
            </div>
            <div className="border-t border-dashed border-sky-200 p-8 md:border-l md:border-t-0">
              <p className="text-xs font-semibold text-slate-400">PNR CODE</p>
              <p className="mt-2 font-mono text-5xl font-black text-[#0C1445]">{booking.pnr_code}</p>
              <div className="mt-8 grid h-32 w-32 grid-cols-5 gap-1 rounded-lg bg-slate-950 p-2">
                {Array.from({ length: 25 }, (_, index) => <span key={index} className={index % 3 === 0 || index % 7 === 0 ? "bg-white" : "bg-slate-950"} />)}
              </div>
              <Button className="mt-8 w-full" variant="secondary"><Download className="h-4 w-4" /> Save card</Button>
            </div>
          </div>
        </section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/my-bookings"><Button>View My Bookings</Button></Link>
          <Link href="/search"><Button variant="secondary">Book Another Flight</Button></Link>
        </div>
      </div>
    </main>
  );
}
