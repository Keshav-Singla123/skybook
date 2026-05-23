"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/lib/store/userStore";
import { toast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useUserStore((state) => state.setSession);
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      toast("Account created. You can log in now.", "success");
    }
  }, [searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast("Wrong email or password.", "error");
      return;
    }
    setSession(data.session);
    setUser(data.user);
    toast("Welcome back to SkyBook", "success");
    router.push(searchParams.get("redirectedFrom") ?? "/search");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#0C1445] to-[#0EA5E9] p-6">
      <form onSubmit={submit} className="sky-card w-full max-w-md rounded-2xl p-8">
        <div className="mb-8 text-center">
          <Plane className="mx-auto h-10 w-10 text-[#0EA5E9]" />
          <h1 className="mt-3 font-display text-3xl font-extrabold text-[#0C1445]">Login to SkyBook</h1>
          <p className="mt-2 text-sm text-slate-600">Manage seats, bookings, and reschedules securely.</p>
        </div>
        <div className="space-y-4">
          <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /></Field>
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">New here? <Link className="font-semibold text-[#0369A1]" href="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
