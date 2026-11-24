import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = "Cari data...",
  children,
  right,
  className,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {onSearch && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="input-base pl-9"
            />
          </div>
        )}
        {children}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
