"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import { useUserStore } from "@/lib/store/userStore";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useUserStore((state) => state.setSession);
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?registered=1`,
      },
    });
    setLoading(false);
    if (error) {
      const message = error.message.includes("already")
        ? "That email is already registered."
        : error.message;
      toast(message, "error");
      return;
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      toast("Account created. Continuing to SkyBook.", "success");
      router.push("/search");
      return;
    }

    toast("Account created. Check your email, then log in.", "success");
    router.push("/login?registered=1");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#0C1445] to-[#0EA5E9] p-6">
      <form onSubmit={submit} className="sky-card w-full max-w-md rounded-2xl p-8">
        <div className="mb-8 text-center">
          <Plane className="mx-auto h-10 w-10 text-[#0EA5E9]" />
          <h1 className="mt-3 font-display text-3xl font-extrabold text-[#0C1445]">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Book and manage Indian domestic flights.</p>
        </div>
        <div className="space-y-4">
          <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /></Field>
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</Button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-[#0369A1]" href="/login">Login</Link></p>
      </form>
    </main>
  );
}
