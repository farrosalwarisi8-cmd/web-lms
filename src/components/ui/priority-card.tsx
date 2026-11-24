import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";

const tones = {
  warning: {
    wrapper: "border-amber-200 bg-amber-50/70",
    icon: "bg-amber-100 text-amber-700",
    cta: "primary" as const,
  },
  danger: {
    wrapper: "border-rose-200 bg-rose-50/70",
    icon: "bg-rose-100 text-rose-700",
    cta: "primary" as const,
  },
  info: {
    wrapper: "border-blue-200 bg-blue-50/70",
    icon: "bg-blue-100 text-blue-700",
    cta: "outline" as const,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50/70",
    icon: "bg-emerald-100 text-emerald-700",
    cta: "outline" as const,
  },
};

export function PriorityCard({
  title,
  description,
  actionLabel,
  href,
  onAction,
  icon: Icon,
  tone = "warning",
  meta,
}: {
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  meta?: string;
}) {
  const style = tones[tone];
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center", style.wrapper)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", style.icon)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {meta && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                {meta}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {href ? (
        <ButtonLink href={href} variant={style.cta} size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
          {actionLabel}
        </ButtonLink>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 sm:self-auto"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-20 flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-brand-300 hover:bg-brand-50/40"
    >
      <Icon className="h-5 w-5 text-brand-700" aria-hidden />
      <span className="mt-2 flex w-full items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-900">
        {label}
        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" aria-hidden />
      </span>
    </Link>
  );
}
