"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, description, open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0C1445]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <Button aria-label="Close dialog" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
