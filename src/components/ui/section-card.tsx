import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  icon?: ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          {icon && <span className="mt-0.5 shrink-0 text-brand-700">{icon}</span>}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
