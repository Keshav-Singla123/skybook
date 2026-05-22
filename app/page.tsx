import Link from "next/link";
import { ArrowRight, Plane, ShieldCheck, Wifi } from "lucide-react";
import { FlightSearch } from "@/components/flights/FlightSearch";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <Navbar />
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0C1445] via-[#0369A1] to-[#0EA5E9] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="cloud absolute top-20 h-16 w-48 rounded-full bg-white/15 blur-sm" />
        <div className="cloud absolute top-48 h-10 w-32 rounded-full bg-white/10 blur-sm [animation-delay:8s]" />
        <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Wifi className="h-4 w-4" /> Real-time seat booking across India
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Your Journey, Seamlessly Booked</h1>
            <p className="mt-6 max-w-2xl text-lg font-light text-sky-50">Search flights, reserve live seats, manage changes, and keep booking access offline in one polished travel workspace.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/search"><Button size="lg">Start booking <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/my-bookings"><Button size="lg" variant="secondary">View bookings</Button></Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["8 Routes", "Real-time Seats", "Instant Booking"].map((stat, index) => (
                <div key={stat} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="font-display text-2xl font-bold">{stat.split(" ")[0]}</p>
                  <p className="text-xs text-sky-100">{stat.replace(stat.split(" ")[0], "").trim()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-in-up [animation-delay:0.2s]">
            <div className="mb-6 flex justify-center">
              <Plane className="plane-float h-24 w-24 text-white/90" />
            </div>
            <FlightSearch />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          ["Concurrency-safe seats", "Supabase RPC locks each selected seat before booking, preventing duplicate reservations."],
          ["Offline-ready trips", "Persisted booking summaries remain readable when the network drops."],
          ["Two-level cancellation rules", "The app and database both enforce the two-hour cancellation window."],
        ].map(([title, copy], index) => (
          <article key={title} className="sky-card fade-in-up rounded-2xl p-6" style={{ animationDelay: `${index * 0.1}s` }}>
            <ShieldCheck className="h-7 w-7 text-[#10B981]" />
            <h2 className="mt-4 font-display text-xl font-bold text-[#0C1445]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
