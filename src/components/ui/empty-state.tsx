import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  tone = "neutral",
  className,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: "neutral" | "warning" | "info";
  className?: string;
}) {
  const toneStyles = {
    neutral: "bg-slate-100 text-slate-500",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-10 text-center", className)}>
      <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", toneStyles[tone])}>
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
