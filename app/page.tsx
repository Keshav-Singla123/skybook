import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Plane, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { FlightSearch } from "@/components/flights/FlightSearch";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

const features = [
  { Icon: ShieldCheck, title: "Concurrency-safe seats", copy: "Supabase RPC locks each selected seat before booking, preventing duplicate reservations." },
  { Icon: Clock3, title: "Fast trip changes", copy: "Reschedule or cancel eligible flights from a clean booking dashboard." },
  { Icon: Sparkles, title: "Offline-ready trips", copy: "Persisted booking summaries remain readable when the network drops." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <Navbar />
      <section className="relative isolate overflow-hidden bg-[#0C1445] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.55),transparent_28rem),radial-gradient(circle_at_80%_25%,rgba(245,158,11,0.28),transparent_22rem),linear-gradient(135deg,#0C1445,#0369A1_58%,#0EA5E9)]" />
        <div className="cloud absolute top-20 h-16 w-48 rounded-full bg-white/15 blur-sm" />
        <div className="cloud absolute top-48 h-10 w-32 rounded-full bg-white/10 blur-sm [animation-delay:8s]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
          <div className="fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Wifi className="h-4 w-4" /> Real-time seat booking across India
            </div>
            <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Your Journey, Seamlessly Booked</h1>
            <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-sky-50">A premium flight desk for Indian routes: compare departures, reserve live seats, manage changes, and carry your booking details offline.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/search"><Button size="lg">Start booking <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/my-bookings"><Button size="lg" variant="secondary">View bookings</Button></Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {["8 Routes", "Live Seats", "Fast Booking"].map((stat, index) => (
                <div key={stat} className="fade-in-up rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="font-display text-2xl font-bold">{stat.split(" ")[0]}</p>
                  <p className="text-xs text-sky-100">{stat.replace(stat.split(" ")[0], "").trim()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-in-up [animation-delay:0.2s]">
            <div className="relative mx-auto mb-7 hidden h-56 max-w-md items-center justify-center lg:flex">
              <div className="absolute h-48 w-48 rounded-full border border-white/20" />
              <div className="absolute h-32 w-32 rounded-full border border-white/15" />
              <Plane className="orbital-plane absolute h-9 w-9 text-white" />
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur">
                <MapPin className="mx-auto h-7 w-7 text-amber-200" />
                <p className="mt-3 font-display text-3xl font-extrabold">DEL to BOM</p>
                <p className="mt-1 text-sm text-sky-100">Live cabin availability</p>
              </div>
            </div>
            <FlightSearch />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        {features.map(({ Icon, title, copy }, index) => (
          <article key={title} className="sky-card fade-in-up rounded-2xl p-6" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#0369A1]">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-[#0C1445]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
