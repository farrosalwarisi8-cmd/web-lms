"use client";

import Link from "next/link";
import { ArrowLeftRight, KeyRound, Mail, ShieldCheck, User } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { demoAccounts, roleLabels } from "@/lib/seed/people";
import { getClassName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { RoleBadge } from "@/components/ui/role-badge";
import { SectionCard } from "@/components/ui/section-card";
import { ButtonLink } from "@/components/ui/button";
import { ChildSelector } from "@/components/ui/child-selector";

export function ProfilView() {
  const { state, logout } = useDemo();
  const role = state.activeRole ?? "orang_tua";
  const account = demoAccounts.find((item) => item.role === role);
  const child = state.students.find((item) => item.id === state.activeChildId);
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);

  return (
    <div>
      <PageHeader
        eyebrow="Akun demo"
        title="Profil pengguna"
        description="Informasi akun demo yang sedang aktif. Tidak ada data pribadi nyata di halaman ini."
        actions={
          <ButtonLink href="/pilih-role" variant="outline" size="sm" icon={<ArrowLeftRight className="h-4 w-4" />}>
            Ganti Peran
          </ButtonLink>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <SectionCard title="Identitas akun" icon={<User className="h-4 w-4" />}>
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-800">
                {account?.userName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("") ?? "D"}
              </span>
              <div>
                <p className="text-lg font-bold text-slate-900">{account?.userName ?? "Pengguna Demo"}</p>
                <p className="text-sm text-slate-500">{account?.description}</p>
                <div className="mt-1.5">
                  <RoleBadge role={role} />
                </div>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                <dt className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Mail className="h-3 w-3" aria-hidden /> Email demo
                </dt>
                <dd className="font-medium text-slate-800">{account?.email}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                <dt className="text-[11px] text-slate-500">Password demo</dt>
                <dd className="font-mono text-sm font-medium text-slate-800">{account?.password}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                <dt className="text-[11px] text-slate-500">Peran aktif</dt>
                <dd className="font-medium text-slate-800">{roleLabels[role]}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                <dt className="text-[11px] text-slate-500">Penyimpanan</dt>
                <dd className="font-medium text-slate-800">localStorage browser</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Konteks aktif" description="Konteks yang memengaruhi data dan navigasi.">
            <dl className="space-y-2 text-sm">
              {role === "orang_tua" && child && (
                <>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Anak dipantau</dt>
                    <dd className="font-medium text-slate-800">{child.name}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Kelas</dt>
                    <dd className="font-medium text-slate-800">{getClassName(state, child.classId)}</dd>
                  </div>
                  <div className="pt-1">
                    <ChildSelector />
                  </div>
                </>
              )}
              {role === "guru" && teacher && (
                <>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Guru aktif</dt>
                    <dd className="font-medium text-slate-800">{teacher.name}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Kelas diajar</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {teacher.classIds.map((id) => getClassName(state, id)).join(", ")}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Periode ajaran</dt>
                <dd className="text-right font-medium text-slate-800">
                  {state.schoolPeriods.find((period) => period.id === state.activePeriodId)?.name}
                </dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Keamanan demo" icon={<ShieldCheck className="h-4 w-4" />}>
            <p className="text-sm leading-relaxed text-slate-600">
              Tidak ada autentikasi nyata, sesi server, atau verifikasi identitas pada demo ini. Password
              bersifat publik dan hanya untuk memperlihatkan alur UX.
            </p>
            <div className="mt-3 space-y-2">
              <ButtonLink href="/ganti-password" variant="outline" size="sm" className="w-full" icon={<KeyRound className="h-4 w-4" />}>
                Ganti password (demo)
              </ButtonLink>
              <ButtonLink href="/pilih-role" variant="outline" size="sm" className="w-full" icon={<ArrowLeftRight className="h-4 w-4" />}>
                Pilih peran lain
              </ButtonLink>
            </div>
          </SectionCard>

          <SectionCard title="Catatan presentasi">
            <ul className="space-y-2 text-xs leading-relaxed text-slate-600">
              <li>• Gunakan menu profil di kanan atas untuk skenario presentasi.</li>
              <li>• Reset Demo mengembalikan data mock ke kondisi awal.</li>
              <li>• Skenario A, B, dan C memuat kondisi khusus untuk tiap peran.</li>
              <li>• Semua aksi utama memberikan toast sebagai umpan balik.</li>
            </ul>
            <Link href="/dashboard/pengaturan" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Buka pengaturan demo →
            </Link>
          </SectionCard>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            Keluar dari demo
          </button>
        </div>
      </div>
    </div>
  );
}
