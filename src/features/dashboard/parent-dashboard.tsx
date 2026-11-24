"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileWarning,
  FolderOpen,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  attendanceSummary,
  finalScore,
  formatDate,
  formatRupiah,
  daysUntil,
  getSubjectName,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { PriorityCard, QuickLink } from "@/components/ui/priority-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

const requiredDocNames = [
  "Kartu Keluarga",
  "Akta Kelahiran",
  "Ijazah / Surat Keterangan Lulus",
  "Pas Foto 3x4",
  "KTP Wali",
];

export function ParentDashboard() {
  const { state } = useDemo();
  const child =
    state.students.find((student) => student.id === state.activeChildId) ?? state.students[0];
  if (!child) return null;

  const classTasks = state.tasks.filter(
    (task) => task.classId === child.classId && task.status === "published"
  );
  const submissions = state.submissions.filter((item) => item.studentId === child.id);
  const pendingTasks = classTasks.filter((task) => {
    const submission = submissions.find((item) => item.taskId === task.id);
    return !submission || submission.status === "draft" || submission.status === "perlu_revisi";
  });
  const openInvoices = state.invoices.filter(
    (invoice) => invoice.studentId === child.id && invoice.status !== "lunas"
  );
  const documents = state.documents.filter((doc) => doc.studentId === child.id);
  const uploadedRequired = requiredDocNames.filter((name) =>
    documents.some((doc) => doc.name === name && doc.status === "lengkap")
  ).length;
  const docPercent = Math.round((uploadedRequired / requiredDocNames.length) * 100);
  const attendance = attendanceSummary(
    state.attendance.filter((item) => item.studentId === child.id)
  );
  const childGrades = state.grades
    .filter((grade) => grade.studentId === child.id)
    .slice(0, 3);
  const latestSubmission = submissions
    .filter((item) => typeof item.score === "number")
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))[0];
  const invoiceTotal = openInvoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.amount - invoice.paidAmount),
    0
  );

  return (
    <div>
      <PageHeader
        eyebrow={`${child.name} · ${state.classes.find((item) => item.id === child.classId)?.name ?? "—"}`}
        title="Pantau perkembangan anak"
        description="Ringkasan hal yang perlu diperhatikan hari ini, lengkap dengan akses cepat ke tugas, kehadiran, rapor, dan tagihan."
        actions={
          <>
            <ButtonLink href="/dashboard/tagihan" variant="outline" size="sm" icon={<CreditCard className="h-4 w-4" />}>
              Tagihan
            </ButtonLink>
            <ButtonLink href="/dashboard/rapor" size="sm" icon={<GraduationCap className="h-4 w-4" />}>
              Lihat Rapor
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tugas belum dikumpulkan"
          value={pendingTasks.length}
          hint={pendingTasks[0] ? `Terdekat: ${formatDate(pendingTasks[0].deadline)}` : "Semua tugas terkumpul"}
          icon={ClipboardList}
          tone={pendingTasks.length > 0 ? "amber" : "emerald"}
          href="/dashboard/tugas"
        />
        <StatCard
          label="Kehadiran semester ini"
          value={`${attendance.percentage}%`}
          hint={`${attendance.hadir} hadir dari ${attendance.total} pertemuan`}
          icon={CalendarCheck}
          tone={attendance.percentage >= 90 ? "emerald" : "amber"}
          href="/dashboard/absensi"
        />
        <StatCard
          label="Tagihan aktif"
          value={formatRupiah(invoiceTotal)}
          hint={openInvoices.length > 0 ? `${openInvoices.length} tagihan belum lunas` : "Tidak ada tagihan"}
          icon={CreditCard}
          tone={invoiceTotal > 0 ? "rose" : "emerald"}
          href="/dashboard/tagihan"
        />
        <StatCard
          label="Kelengkapan berkas"
          value={`${docPercent}%`}
          hint={`${uploadedRequired} dari ${requiredDocNames.length} dokumen lengkap`}
          icon={FolderOpen}
          tone={docPercent === 100 ? "emerald" : "amber"}
          href="/dashboard/berkas"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <SectionCard
            title="Yang perlu diperhatikan"
            description="Diurutkan dari yang paling mendesak untuk anak aktif."
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 2).map((task) => (
                <PriorityCard
                  key={task.id}
                  icon={ClipboardList}
                  title={task.title}
                  description={`${getSubjectName(state, task.subjectId)} · tenggat ${formatDate(task.deadline)}`}
                  meta={
                    daysUntil(task.deadline) < 0
                      ? "Melewati tenggat"
                      : daysUntil(task.deadline) === 0
                        ? "Hari ini"
                        : `${daysUntil(task.deadline)} hari lagi`
                  }
                  actionLabel="Lihat tugas"
                  href="/dashboard/tugas"
                  tone={daysUntil(task.deadline) < 0 ? "danger" : "warning"}
                />
              ))}
              {openInvoices.length > 0 && (
                <PriorityCard
                  icon={CreditCard}
                  title={`SPP ${openInvoices[0].periodLabel} belum lunas`}
                  description={`Sisa ${formatRupiah(
                    Math.max(0, openInvoices[0].amount - openInvoices[0].paidAmount)
                  )} · jatuh tempo ${formatDate(openInvoices[0].dueDate)}`}
                  actionLabel="Bayar / unggah bukti"
                  href="/dashboard/tagihan"
                  tone="danger"
                />
              )}
              {docPercent < 100 && (
                <PriorityCard
                  icon={FileWarning}
                  title="Berkas anak belum lengkap"
                  description={`${
                    requiredDocNames.length - uploadedRequired
                  } dokumen belum diunggah, termasuk akta kelahiran bila belum ada.`}
                  actionLabel="Lengkapi berkas"
                  href="/dashboard/berkas"
                  tone="warning"
                />
              )}
              {attendance.percentage < 90 && (
                <PriorityCard
                  icon={CalendarCheck}
                  title="Kehadiran perlu ditingkatkan"
                  description={`Kehadiran ${attendance.percentage}% dengan ${attendance.alpa} alpa. Bicarakan dengan wali kelas.`}
                  actionLabel="Lihat riwayat"
                  href="/dashboard/absensi"
                  tone="info"
                />
              )}
              {pendingTasks.length === 0 && openInvoices.length === 0 && docPercent === 100 && attendance.percentage >= 90 && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden />
                  <p className="text-sm text-emerald-900">
                    Tidak ada hal mendesak. Semua tugas terkumpul dan administrasi lengkap.
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Tugas terbaru"
            description={`Tugas kelas ${child.name} yang dipublikasikan guru.`}
            icon={<ClipboardList className="h-4 w-4" />}
            action={
              <Link href="/dashboard/tugas" className="text-xs font-semibold text-brand-700 hover:underline">
                Semua tugas
              </Link>
            }
            bodyClassName="p-0"
          >
            {classTasks.length === 0 ? (
              <EmptyState
                title="Belum ada tugas"
                description="Guru belum mempublikasikan tugas untuk kelas ini. Cek kembali nanti."
                icon={ClipboardList}
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {classTasks.slice(0, 4).map((task) => {
                  const submission = submissions.find((item) => item.taskId === task.id);
                  return (
                    <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-500">
                          {getSubjectName(state, task.subjectId)} · tenggat {formatDate(task.deadline)}
                        </p>
                      </div>
                      <StatusBadge status={submission?.status ?? "belum"} />
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Nilai terbaru"
            description="Nilai tugas dan ujian yang sudah dinilai guru."
            icon={<GraduationCap className="h-4 w-4" />}
            action={
              <Link href="/dashboard/rapor" className="text-xs font-semibold text-brand-700 hover:underline">
                Buka rapor
              </Link>
            }
          >
            {latestSubmission?.score === undefined && childGrades.length === 0 ? (
              <EmptyState
                title="Belum ada nilai"
                description="Nilai akan muncul setelah guru menyimpan penilaian tugas atau ujian."
                icon={GraduationCap}
              />
            ) : (
              <div className="space-y-3">
                {latestSubmission?.score !== undefined && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-inset ring-slate-200">
                    <div>
                      <p className="text-xs text-slate-500">Tugas terbaru dinilai</p>
                      <p className="text-sm font-medium text-slate-800">
                        {state.tasks.find((task) => task.id === latestSubmission.taskId)?.title}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{latestSubmission.score}</span>
                  </div>
                )}
                {childGrades.map((grade) => (
                  <ProgressBar
                    key={grade.id}
                    label={getSubjectName(state, grade.subjectId)}
                    value={finalScore(grade)}
                    hint={`${finalScore(grade)} / 100`}
                    tone={finalScore(grade) >= 80 ? "emerald" : finalScore(grade) >= 70 ? "blue" : "amber"}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Aksi cepat" description="Akses langsung fitur yang sering dipakai wali.">
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/dashboard/tugas" label="Tugas Anak" icon={ClipboardList} />
              <QuickLink href="/dashboard/absensi" label="Kehadiran" icon={CalendarCheck} />
              <QuickLink href="/dashboard/rapor" label="Rapor" icon={GraduationCap} />
              <QuickLink href="/dashboard/tagihan" label="Tagihan SPP" icon={CreditCard} />
              <QuickLink href="/dashboard/berkas" label="Berkas" icon={FolderOpen} />
              <QuickLink href="/dashboard/materi" label="Materi" icon={BookOpen} />
            </div>
          </SectionCard>

          <SectionCard title="Profil anak" description="Data ringkas santri yang sedang dipantau.">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {child.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{child.name}</p>
                <p className="text-xs text-slate-500">
                  NIS {child.nis} · {state.classes.find((item) => item.id === child.classId)?.name}
                </p>
              </div>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Wali kelas</dt>
                <dd className="font-medium text-slate-700">
                  {state.teachers.find(
                    (teacher) =>
                      teacher.id ===
                      state.classes.find((item) => item.id === child.classId)?.homeroomTeacherId
                  )?.name ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Kehadiran</dt>
                <dd className="font-medium text-emerald-700">{attendance.percentage}%</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Izin / sakit / alpa</dt>
                <dd className="font-medium text-slate-700">
                  {attendance.izin} / {attendance.sakit} / {attendance.alpa}
                </dd>
              </div>
            </dl>
            <ButtonLink href="/dashboard/rapor" variant="outline" size="sm" className="mt-3 w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
              Lihat perkembangan lengkap
            </ButtonLink>
          </SectionCard>

          <SectionCard title="Berkas anak" description="Kelengkapan dokumen administrasi.">
            <ProgressBar value={docPercent} tone={docPercent === 100 ? "emerald" : "brand"} label="Kelengkapan" />
            <ul className="mt-3 space-y-1.5">
              {requiredDocNames.map((name) => {
                const doc = documents.find((item) => item.name === name);
                return (
                  <li key={name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-600">{name}</span>
                    <StatusBadge
                      status={doc ? (doc.status === "lengkap" ? "lengkap" : "perlu_perbaikan") : "belum"}
                      label={doc ? (doc.status === "lengkap" ? "Lengkap" : "Perbaikan") : "Belum ada"}
                    />
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
