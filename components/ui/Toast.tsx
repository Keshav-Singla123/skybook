"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface ToastMessage {
  id: string;
  title: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (title: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let externalToast: ToastContextValue["toast"] | null = null;

export function toast(title: string, tone: ToastTone = "info") {
  externalToast?.(title, tone);
}

export function Toaster() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, tone: ToastTone = "info") => {
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, title, tone }]);
    window.setTimeout(() => setMessages((current) => current.filter((message) => message.id !== id)), 3600);
  }, []);

  useEffect(() => {
    externalToast = addToast;
    return () => {
      externalToast = null;
    };
  }, [addToast]);
  const value = useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      <div className="fixed right-4 top-4 z-[60] space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex min-w-72 items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-xl", message.tone === "success" && "border-emerald-100", message.tone === "error" && "border-red-100")}>
            {message.tone === "success" ? <CheckCircle2 className="h-5 w-5 text-[#10B981]" /> : null}
            {message.tone === "error" ? <XCircle className="h-5 w-5 text-[#EF4444]" /> : null}
            {message.tone === "info" ? <Info className="h-5 w-5 text-[#0EA5E9]" /> : null}
            <span className="font-medium text-slate-800">{message.title}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) return { toast };
  return context;
}
