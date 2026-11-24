"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Sparkles } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { navByRole } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/role-badge";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useDemo();
  const role = state.activeRole ?? "orang_tua";
  const sections = navByRole[role];

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-slate-900">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">demolms</p>
          <p className="text-[11px] text-slate-500">Learning Management System</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Peran aktif
        </p>
        <RoleBadge role={role} />
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
        {sections.map((section, sectionIndex) => (
          <div key={section.label ?? `section-${sectionIndex}`} className="mb-4 last:mb-0">
            {section.label && (
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                        active
                          ? "bg-brand-50 font-semibold text-brand-900 ring-1 ring-inset ring-brand-200"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          active ? "text-brand-700" : "text-slate-400"
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden />
            Mode demo lokal
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Semua data adalah simulasi. Tidak ada koneksi server, database, atau pembayaran nyata.
          </p>
          <Link
            href="/"
            className="mt-2 inline-block text-[11px] font-semibold text-brand-700 hover:underline"
          >
            Buka halaman publik →
          </Link>
        </div>
      </div>
    </aside>
  );
}
