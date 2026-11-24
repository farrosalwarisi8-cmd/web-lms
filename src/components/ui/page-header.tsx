import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  crumbs,
  eyebrow,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  crumbs?: Crumb[];
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 animate-fade-up", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-800 hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-slate-700">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
