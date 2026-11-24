import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoRole } from "@/lib/types";
import { roleLabels } from "@/lib/seed/people";

const roleStyles: Record<DemoRole, string> = {
  calon_wali: "bg-blue-50 text-blue-800 ring-blue-200",
  orang_tua: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  siswa: "bg-sky-50 text-sky-800 ring-sky-200",
  guru: "bg-brand-50 text-brand-800 ring-brand-200",
  admin_akademik: "bg-violet-50 text-violet-800 ring-violet-200",
  admin_keuangan: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  super_admin: "bg-slate-900 text-white ring-slate-900",
};

export function RoleBadge({
  role,
  compact,
  className,
}: {
  role: DemoRole;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
          roleStyles[role],
          className
        )}
      >
        {roleLabels[role]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset",
        roleStyles[role],
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      {roleLabels[role]}
    </span>
  );
}
