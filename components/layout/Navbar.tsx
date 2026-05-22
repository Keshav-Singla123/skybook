"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plane, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/lib/store/flightStore";
import { useUserStore } from "@/lib/store/userStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/my-bookings", label: "My Bookings" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const clearUser = useUserStore((state) => state.clearUser);
  const resetBooking = useFlightStore((state) => state.resetBooking);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setAuthenticated(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setAuthenticated(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    resetBooking();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/82 shadow-sm shadow-sky-950/5 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-[#0C1445]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0C1445] to-[#0EA5E9] text-white shadow-lg shadow-sky-900/20">
            <Plane className="h-5 w-5" />
          </span>
          SkyBook
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn("rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-sky-50 hover:text-[#0C1445]", pathname === item.href && "bg-sky-50 text-[#0C1445]")}>
              {item.label}
            </Link>
          ))}
          {authenticated ? (
            <Button variant="secondary" onClick={logout}>Logout</Button>
          ) : (
            <Link href="/login"><Button>Login</Button></Link>
          )}
        </div>
        <Button className="md:hidden" size="icon" variant="ghost" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>
      {open ? (
        <div className="border-t border-sky-100 bg-white p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-sky-50">
                {item.label}
              </Link>
            ))}
            {authenticated ? <Button variant="secondary" onClick={logout}>Logout</Button> : <Link href="/login"><Button className="w-full">Login</Button></Link>}
          </div>
        </div>
      ) : null}
    </header>
  );
}
