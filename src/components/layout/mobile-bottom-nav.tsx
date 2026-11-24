"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { navByRole } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const { state } = useDemo();
  const role = state.activeRole ?? "orang_tua";
  const items = navByRole[role].flatMap((section) => section.items).slice(0, 4);

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navigasi cepat mobile"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium",
                  active ? "text-brand-800" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-800"
          >
            <Menu className="h-5 w-5" aria-hidden />
            Lainnya
          </button>
        </li>
      </ul>
    </nav>
  );
}
