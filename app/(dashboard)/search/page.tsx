import { FlightSearch } from "@/components/flights/FlightSearch";
import { Badge } from "@/components/ui/Badge";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <section className="relative overflow-hidden bg-[#0C1445] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.42),transparent_24rem),radial-gradient(circle_at_82%_20%,rgba(245,158,11,0.22),transparent_18rem),linear-gradient(135deg,#0C1445,#0369A1)]" />
        <div className="cloud absolute top-16 h-14 w-44 rounded-full bg-white/15 blur-sm" />
        <div className="relative mx-auto max-w-6xl">
          <Badge className="border border-white/20 bg-white/10 text-white" tone="sky">Live fare search</Badge>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-5xl">Find your next flight</h1>
          <p className="mt-3 max-w-2xl text-sky-50">Pick your route, travel date, passenger count, and cabin. SkyBook filters live seat inventory for that class.</p>
          <div className="mt-8">
            <FlightSearch compact />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        {["Delhi - Mumbai", "Mumbai - Goa", "Delhi - Hyderabad"].map((route) => (
          <div key={route} className="sky-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase text-[#0369A1]">Popular route</p>
            <p className="mt-2 font-display text-xl font-bold text-[#0C1445]">{route}</p>
            <p className="mt-1 text-sm text-slate-600">Future flights with live seat maps.</p>
          </div>
        ))}
      </section>
    </main>
  );
}
