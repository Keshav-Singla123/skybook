"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface CancelDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelDialog({ open, loading, onClose, onConfirm }: CancelDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Cancel booking?" description="Are you sure? This cannot be undone.">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Keep booking</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>{loading ? "Cancelling..." : "Cancel booking"}</Button>
      </div>
    </Modal>
  );
}
