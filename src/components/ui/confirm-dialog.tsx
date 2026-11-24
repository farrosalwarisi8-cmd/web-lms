"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "primary",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="flex gap-3">
        <span
          className={
            tone === "danger"
              ? "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700"
              : "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800"
          }
        >
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
