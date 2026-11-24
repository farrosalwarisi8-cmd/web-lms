"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  CheckCheck,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
  PlayCircle,
  RotateCcw,
  User,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { demoAccounts, roleLabels } from "@/lib/seed/people";
import { routeTitles } from "@/lib/nav";
import { cn, getClassName } from "@/lib/utils";
import { ChildSelector } from "@/components/ui/child-selector";
import { PeriodSelector } from "@/components/ui/period-selector";
import { RoleBadge } from "@/components/ui/role-badge";
import { scenarioMeta } from "@/lib/mock-data";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { state, logout, markNotificationsRead, resetDemo, seedScenario } = useDemo();
  const role = state.activeRole ?? "orang_tua";
  const account = demoAccounts.find((item) => item.role === role);
  const unread = state.notifications.filter((item) => !item.read).length;
  const profileRef = useRef<HTMLDetailsElement>(null);
  const notifRef = useRef<HTMLDetailsElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeChild = state.students.find((student) => student.id === state.activeChildId);
  const title = routeTitles[pathname] ?? "Dashboard";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const staffRoles = ["guru", "admin_akademik", "admin_keuangan", "super_admin"];
  const showPeriod = staffRoles.includes(role);
  const showChild = role === "orang_tua";

  function closeProfile() {
    if (profileRef.current) profileRef.current.open = false;
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <button
          type="button"
          onClick={onMenu}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-slate-500">
            demolms <span className="px-1">/</span> {roleLabels[role]}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-sm font-bold text-slate-900">{title}</h1>
            {showChild && activeChild && (
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:inline">
                {activeChild.name} · {getClassName(state, activeChild.classId)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showChild && <ChildSelector compact className="w-44 sm:w-60" />}
          {showPeriod && <PeriodSelector className="hidden w-52 xl:block" />}

          <details ref={notifRef} className="relative">
            <summary
              className="relative grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
              aria-label={`Notifikasi, ${unread} belum dibaca`}
            >
              <Bell className="h-5 w-5" aria-hidden />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </summary>
            <div className="absolute right-0 top-12 z-40 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifikasi demo</p>
                <button
                  type="button"
                  onClick={markNotificationsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Tandai dibaca
                </button>
              </div>
              <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {state.notifications.slice(0, 5).map((item) => (
                  <li key={item.id} className={cn("px-4 py-3", !item.read && "bg-brand-50/40")}>
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          item.type === "danger"
                            ? "bg-rose-500"
                            : item.type === "warning"
                              ? "bg-amber-500"
                              : item.type === "success"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                        )}
                        aria-hidden
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.message}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <details ref={profileRef} className="relative">
            <summary
              className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-2 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
              aria-label="Menu profil dan kontrol demo"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-brand-100 text-xs font-bold text-brand-800">
                {account?.userName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("") ?? "D"}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-32 truncate text-xs font-semibold text-slate-800">
                  {account?.userName ?? "Pengguna Demo"}
                </span>
                <span className="block text-[10px] text-slate-500">{roleLabels[role]}</span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" aria-hidden />
            </summary>

            <div className="absolute right-0 top-12 z-40 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{account?.userName}</p>
                <p className="truncate text-xs text-slate-500">{account?.email}</p>
                <div className="mt-2">
                  <RoleBadge role={role} compact />
                </div>
              </div>

              <div className="border-b border-slate-100 py-1.5">
                <ProfileLink href="/dashboard/profil" icon={<User className="h-4 w-4" />} label="Profil saya" onNavigate={closeProfile} />
                <ProfileLink href="/ganti-password" icon={<KeyRound className="h-4 w-4" />} label="Ganti password" onNavigate={closeProfile} />
                <ProfileLink href="/pilih-role" icon={<ArrowLeftRight className="h-4 w-4" />} label="Ganti peran demo" onNavigate={closeProfile} />
              </div>

              <div className="border-b border-slate-100 px-4 py-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Skenario presentasi
                </p>
                <div className="space-y-1">
                  {scenarioMeta
                    .filter((item) => item.key !== "default")
                    .map((scenario) => (
                      <button
                        key={scenario.key}
                        type="button"
                        onClick={() => {
                          seedScenario(scenario.key);
                          closeProfile();
                        }}
                        className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                        {scenario.label}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => {
                      resetDemo();
                      closeProfile();
                    }}
                    className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Reset semua data demo
                  </button>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Keluar dari demo
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function ProfileLink({
  href,
  icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-10 items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {label}
    </Link>
  );
}
