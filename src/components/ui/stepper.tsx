import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: { title: string; description?: string }[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("no-scrollbar flex gap-2 overflow-x-auto pb-1", className)} aria-label="Langkah">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step.title}
            className={cn(
              "flex min-w-[9.5rem] flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left",
              active && "border-brand-400 bg-brand-50",
              done && "border-emerald-200 bg-emerald-50/60",
              !active && !done && "border-slate-200 bg-white"
            )}
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                active && "bg-brand-500 text-slate-900",
                done && "bg-emerald-500 text-white",
                !active && !done && "bg-slate-100 text-slate-500"
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block truncate text-xs font-semibold",
                  active ? "text-brand-900" : done ? "text-emerald-900" : "text-slate-600"
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="block truncate text-[11px] text-slate-500">{step.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
