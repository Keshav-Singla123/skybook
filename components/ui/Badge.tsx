import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "sky" | "gold" | "success" | "danger" | "muted" | "purple";
  className?: string;
}

export function Badge({ children, tone = "sky", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        tone === "sky" && "bg-sky-100 text-sky-800",
        tone === "gold" && "bg-amber-100 text-amber-800",
        tone === "success" && "bg-emerald-100 text-emerald-800",
        tone === "danger" && "bg-red-100 text-red-700",
        tone === "muted" && "bg-slate-100 text-slate-600",
        tone === "purple" && "bg-violet-100 text-violet-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
