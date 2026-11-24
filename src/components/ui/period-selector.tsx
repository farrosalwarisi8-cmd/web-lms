"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

export function PeriodSelector({ className }: { className?: string }) {
  const { state, selectPeriod } = useDemo();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="active-period" className="sr-only">
        Pilih periode ajaran aktif
      </label>
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
      <select
        id="active-period"
        value={state.activePeriodId}
        onChange={(event) => selectPeriod(event.target.value)}
        className="min-h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {state.schoolPeriods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.name} · {period.semester}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
    </div>
  );
}
