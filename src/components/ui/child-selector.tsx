"use client";

import { Baby, ChevronDown } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn, getClassName } from "@/lib/utils";

export function ChildSelector({ className, compact }: { className?: string; compact?: boolean }) {
  const { state, selectChild } = useDemo();
  const parent = state.parents.find((item) => item.id === state.activeParentId);
  const children = state.students.filter((student) =>
    parent?.childIds.includes(student.id)
  );
  const active = children.find((child) => child.id === state.activeChildId) ?? children[0];

  if (children.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="active-child" className="sr-only">
        Pilih anak yang dipantau
      </label>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <Baby className="h-4 w-4 text-brand-700" aria-hidden />
      </div>
      <select
        id="active-child"
        value={active?.id}
        onChange={(event) => selectChild(event.target.value)}
        className={cn(
          "min-h-11 w-full appearance-none rounded-xl border border-brand-200 bg-brand-50/70 pl-9 pr-8 text-sm font-semibold text-slate-800 hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30",
          compact ? "py-1.5" : "py-2.5"
        )}
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name} — {getClassName(state, child.classId)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
    </div>
  );
}
