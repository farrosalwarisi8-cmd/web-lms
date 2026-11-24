"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { demoAccounts, roleLabels } from "@/lib/seed/people";

export default function PilihRolePage() {
  const router = useRouter();
  const { state, loginAs } = useDemo();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={state.isLoggedIn ? "/dashboard" : "/login"} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {state.isLoggedIn ? "Kembali ke dashboard" : "Kembali ke login"}
          </Link>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
            Mode demo
          </span>
        </div>

        <div className="mx-auto mt-6 max-w-3xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-slate-900">
            <GraduationCap className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Pilih peran demo</h1>
          <p className="mt-1 text-sm text-slate-600">
            Setiap peran memiliki dashboard, navigasi, dan hak akses berbeda. Pilih salah satu untuk
            berpindah tanpa login ulang.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {demoAccounts.map((account) => {
            const active = state.activeRole === account.role;
            return (
              <button
                key={account.role}
                type="button"
                onClick={() => {
                  loginAs(account.role);
                  router.push("/dashboard");
                }}
                className={`group rounded-2xl border bg-white p-4 text-left shadow-card transition hover:border-brand-300 hover:shadow-md ${
                  active ? "border-brand-400 ring-1 ring-brand-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{roleLabels[account.role]}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{account.description}</p>
                  </div>
                  {active ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-600" aria-hidden />
                  )}
                </div>
                <p className="mt-3 truncate font-mono text-[11px] text-slate-500">{account.email}</p>
                <p className="text-[11px] text-slate-400">Password: {account.password}</p>
              </button>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-slate-500">
          {roleLabels[state.activeRole ?? "orang_tua"]
            ? `Peran aktif saat ini: ${roleLabels[state.activeRole ?? "orang_tua"]}.`
            : "Belum ada peran aktif."}{" "}
          Demo ini tidak menggunakan autentikasi nyata.
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Ingin melihat alur login?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Buka halaman login demo
          </Link>
        </p>
      </div>
    </div>
  );
}
