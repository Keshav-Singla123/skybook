"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      const dismissed = localStorage.getItem("skybook-install-dismissed") === "true";
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(!dismissed && window.matchMedia("(max-width: 768px)").matches);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !promptEvent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-[#0C1445] p-4 text-white shadow-2xl md:hidden">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-[#0EA5E9]" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold">Install SkyBook</p>
          <p className="text-xs text-sky-100">Faster access and saved booking views offline.</p>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            await promptEvent.prompt();
            setVisible(false);
          }}
        >
          Install
        </Button>
        <button
          aria-label="Do not show install banner again"
          onClick={() => {
            localStorage.setItem("skybook-install-dismissed", "true");
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
