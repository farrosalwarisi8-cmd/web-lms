"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter tampilan"
      className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1", className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            value === item.value
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {item.label}
          {typeof item.count === "number" && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                value === item.value ? "bg-brand-100 text-brand-800" : "bg-slate-200 text-slate-600"
              )}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
