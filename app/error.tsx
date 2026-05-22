"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFF] p-6">
      <section className="sky-card max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-[#0C1445]">Something needs attention</h1>
        <p className="mt-3 text-sm text-slate-600">{error.message}</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </section>
    </main>
  );
}
