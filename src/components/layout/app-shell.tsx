"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GraduationCap, Loader2, X } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { canAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { AccessDenied } from "./access-denied";

export function AppShell({ children }: { children: ReactNode }) {
  const { state, hydrated } = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !state.isLoggedIn) {
      router.replace("/login");
    }
  }, [hydrated, state.isLoggedIn, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!hydrated || !state.isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-slate-900">
          <GraduationCap className="h-6 w-6" aria-hidden />
        </span>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Menyiapkan demo...
        </p>
      </div>
    );
  }

  const allowed = canAccess(state.activeRole, pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar />
      </div>

      <div className="lg:pl-72">
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          {allowed ? children : <AccessDenied />}
        </main>
      </div>

      <MobileBottomNav onMore={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <div className={cn("relative h-full w-72 max-w-[85vw] shadow-2xl animate-fade-up")}>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg bg-white/90 text-slate-600 shadow-sm ring-1 ring-slate-200"
              aria-label="Tutup menu navigasi"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
