import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function ErrorState({
  title = "Data gagal dimuat",
  description = "Terjadi kendala saat memuat data demo. Coba muat ulang halaman.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-700">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          Coba lagi
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({
  rows = 3,
  variant = "list",
  className,
}: {
  rows?: number;
  variant?: "list" | "cards" | "table";
  className?: string;
}) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)} aria-busy="true" aria-label="Memuat data">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-7 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-2.5 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Memuat data">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-200" />
              <div className="h-2.5 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
          {variant === "table" && <div className="mt-3 h-2.5 w-full rounded bg-slate-100" />}
        </div>
      ))}
    </div>
  );
}

export function InlineLoading({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-700" role="alert">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
      {message}
    </p>
  );
}
