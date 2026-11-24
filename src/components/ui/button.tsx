import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-slate-900 hover:bg-brand-400 active:bg-brand-600 shadow-sm disabled:bg-brand-200",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-400",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "min-h-11 px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "min-h-12 px-5 py-3 text-base gap-2 rounded-xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-80";

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  ...props
}: BaseProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  href,
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
