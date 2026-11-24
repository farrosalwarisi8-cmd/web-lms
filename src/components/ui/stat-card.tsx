import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  brand: "bg-brand-50 text-brand-700",
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneStyles;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium leading-snug text-slate-500">{label}</p>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", toneStyles[tone])}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </>
  );

  const base = cn(
    "block rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition",
    href && "hover:border-brand-300 hover:shadow-md",
    className
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {content}
      </Link>
    );
  }

  return <div className={base}>{content}</div>;
}
