"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]",
        variant === "primary" && "bg-[#0EA5E9] text-white shadow-lg shadow-sky-500/20 hover:bg-[#0369A1]",
        variant === "secondary" && "border border-sky-200 bg-white text-[#0C1445] hover:bg-sky-50",
        variant === "ghost" && "text-[#0C1445] hover:bg-sky-50",
        variant === "danger" && "bg-[#EF4444] text-white hover:bg-red-600",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
