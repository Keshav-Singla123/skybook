import { FlightSearch } from "@/components/flights/FlightSearch";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0C1445] to-[#0EA5E9] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="cloud absolute top-16 h-14 w-44 rounded-full bg-white/15 blur-sm" />
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Find your next flight</h1>
          <p className="mt-3 max-w-2xl text-sky-50">Pick your route, travel date, passenger count, and cabin. SkyBook filters live seat inventory for that class.</p>
          <div className="mt-8">
            <FlightSearch compact />
          </div>
        </div>
      </section>
    </main>
  );
}
