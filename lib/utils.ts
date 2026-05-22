import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Flight, SeatClass } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string, mode: "date" | "time" | "full" = "full"): string {
  const date = new Date(value);
  if (mode === "date") {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
  }
  if (mode === "time") {
    return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function getFlightDuration(departsAt: string, arrivesAt: string): string {
  const minutes = Math.max(0, Math.round((new Date(arrivesAt).getTime() - new Date(departsAt).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

export function getFlightDurationMinutes(flight: Flight): number {
  return Math.max(0, Math.round((new Date(flight.arrives_at).getTime() - new Date(flight.departs_at).getTime()) / 60000));
}

export function generatePNR(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function classMultiplier(seatClass: SeatClass): number {
  if (seatClass === "first") return 2.6;
  if (seatClass === "business") return 1.65;
  return 1;
}

export function calculateFlightPrice(basePrice: number, seatClass: SeatClass, extraFee = 0): number {
  return Math.round(basePrice * classMultiplier(seatClass) + extraFee);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function cityLabel(code: string): string {
  return code;
}
