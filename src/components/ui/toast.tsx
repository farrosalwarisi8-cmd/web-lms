"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

export function ToastViewport() {
  const { state, dismissToast } = useDemo();
  const toast = state.toast;
  if (!toast) return null;

  const config = {
    success: { icon: CheckCircle2, className: "border-emerald-200 bg-white", iconClass: "text-emerald-600" },
    error: { icon: AlertCircle, className: "border-rose-200 bg-white", iconClass: "text-rose-600" },
    info: { icon: Info, className: "border-blue-200 bg-white", iconClass: "text-blue-600" },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6 md:justify-end md:px-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3.5 shadow-lg animate-toast-in",
          config.className
        )}
      >
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{toast.message}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{toast.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={dismissToast}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
