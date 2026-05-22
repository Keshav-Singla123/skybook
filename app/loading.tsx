import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F8FAFF] p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    </main>
  );
}
