"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  School,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, getClassName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { PriorityCard, QuickLink } from "@/components/ui/priority-card";
import { EmptyState } from "@/components/ui/empty-state";

export function AcademicDashboard() {
  const { state } = useDemo();
  const pendingRegistrations = state.registrations.filter(
    (registration) => registration.status === "menunggu_verifikasi"
  );
  const needsFix = state.registrations.filter(
    (registration) => registration.status === "perlu_perbaikan"
  );
  const activePeriod = state.schoolPeriods.find((period) => period.id === state.activePeriodId);
  const grade12 = state.students.filter((student) => {
    const cls = state.classes.find((item) => item.id === student.classId);
    return cls?.level === 9;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Area kerja: Akademik"
        title="Operasional akademik"
        description="Pantau pendaftaran, data master, dan proses akhir semester dalam satu tempat."
        actions={
          <>
            <ButtonLink href="/dashboard/verifikasi-pendaftaran" size="sm" icon={<ClipboardCheck className="h-4 w-4" />}>
              Verifikasi Pendaftar
            </ButtonLink>
            <ButtonLink href="/dashboard/siswa" variant="outline" size="sm" icon={<Users className="h-4 w-4" />}>
              Kelola Siswa
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pendaftar menunggu verifikasi" value={pendingRegistrations.length} hint={`${needsFix.length} perlu perbaikan`} icon={ClipboardCheck} tone={pendingRegistrations.length ? "amber" : "emerald"} href="/dashboard/verifikasi-pendaftaran" />
        <StatCard label="Siswa aktif" value={state.students.length} hint={`${grade12.length} siswa kelas 9`} icon={Users} tone="blue" href="/dashboard/siswa" />
        <StatCard label="Guru aktif" value={state.teachers.length} hint={`${state.subjects.length} mata pelajaran`} icon={UserCheck} tone="brand" href="/dashboard/guru" />
        <StatCard label="Kelas aktif" value={state.classes.length} hint={activePeriod ? activePeriod.name : "—"} icon={School} tone="slate" href="/dashboard/kelas" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <SectionCard title="Perlu tindakan" description="Antrean pendaftaran dan proses akademik." icon={<ClipboardCheck className="h-4 w-4" />}>
            <div className="space-y-2.5">
              <PriorityCard
                icon={ClipboardCheck}
                title={`${pendingRegistrations.length} pendaftar menunggu verifikasi`}
                description="Periksa data, dokumen, dan status pembayaran sebelum memberi keputusan."
                actionLabel="Verifikasi sekarang"
                href="/dashboard/verifikasi-pendaftaran"
                tone="warning"
              />
              <PriorityCard
                icon={TrendingUp}
                title="Proses kenaikan kelas semester ganjil"
                description="Tinjau rekomendasi kelas 7 dan 8 sebelum periode berakhir."
                actionLabel="Buka kenaikan kelas"
                href="/dashboard/kenaikan-kelas"
                tone="info"
              />
              <PriorityCard
                icon={CalendarDays}
                title="Periode ajaran aktif"
                description={activePeriod ? `${activePeriod.name} · semester ${activePeriod.semester}` : "Belum ada periode aktif"}
                actionLabel="Atur periode"
                href="/dashboard/periode-ajaran"
                tone="success"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Pendaftar terbaru"
            description="10 pendaftar terakhir dari gelombang berjalan."
            icon={<Users className="h-4 w-4" />}
            action={<Link href="/dashboard/verifikasi-pendaftaran" className="text-xs font-semibold text-brand-700 hover:underline">Lihat semua</Link>}
            bodyClassName="p-0"
          >
            {state.registrations.length === 0 ? (
              <EmptyState title="Belum ada pendaftar" description="Pendaftar baru akan muncul setelah formulir dikirim." icon={Users} />
            ) : (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <caption className="sr-only">Pendaftar terbaru</caption>
                  <thead>
                    <tr>
                      <th scope="col">Calon santri</th>
                      <th scope="col">Kelas</th>
                      <th scope="col">Status</th>
                      <th scope="col">Dikirim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.registrations.slice(0, 6).map((registration) => (
                      <tr key={registration.id}>
                        <td>
                          <p className="font-medium text-slate-800">{registration.studentName}</p>
                          <p className="text-xs text-slate-500">{registration.number}</p>
                        </td>
                        <td>{registration.level}</td>
                        <td><StatusBadge status={registration.status} /></td>
                        <td className="text-xs text-slate-500">{formatDate(registration.submittedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Aksi cepat" description="Menu yang sering dipakai admin akademik.">
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/dashboard/verifikasi-pendaftaran" label="Verifikasi" icon={ClipboardCheck} />
              <QuickLink href="/dashboard/siswa" label="Siswa" icon={Users} />
              <QuickLink href="/dashboard/guru" label="Guru" icon={UserCheck} />
              <QuickLink href="/dashboard/kelas" label="Kelas" icon={School} />
              <QuickLink href="/dashboard/mapel" label="Mapel" icon={GraduationCap} />
              <QuickLink href="/dashboard/periode-ajaran" label="Periode" icon={CalendarDays} />
              <QuickLink href="/dashboard/kenaikan-kelas" label="Kenaikan" icon={TrendingUp} />
              <QuickLink href="/dashboard/biaya-ppdb" label="Biaya PPDB" icon={ClipboardCheck} />
            </div>
          </SectionCard>

          <SectionCard title="Sebaran kelas" description="Jumlah santri per kelas." icon={<School className="h-4 w-4" />}>
            <ul className="space-y-2">
              {state.classes.map((cls) => {
                const count = state.students.filter((student) => student.classId === cls.id).length;
                return (
                  <li key={cls.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Kelas {getClassName(state, cls.id)}</p>
                      <p className="text-[11px] text-slate-500">{cls.room} · kapasitas {cls.capacity}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{count}</span>
                  </li>
                );
              })}
            </ul>
            <ButtonLink href="/dashboard/kenaikan-kelas" variant="outline" size="sm" className="mt-3 w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
              Proses kenaikan kelas
            </ButtonLink>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
