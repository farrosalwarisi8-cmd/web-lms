import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineError } from "./feedback";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label-base" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      <InlineError message={error} />
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("input-base", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn("input-base appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn("input-base min-h-24 resize-y", className)} {...props} />;
}

export function Checkbox({
  label,
  className,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-slate-700", className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        {...props}
      />
      {label}
    </label>
  );
}
