import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
};

export function ProgressBar({
  value,
  label,
  hint,
  tone = "brand",
  className,
}: {
  value: number;
  label?: string;
  hint?: string;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={className}>
      {(label || hint) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          <span className="text-slate-500">{hint ?? `${safe}%`}</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        aria-label={label ?? "Progres"}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
