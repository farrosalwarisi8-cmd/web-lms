"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileQuestion,
  GraduationCap,
  PlayCircle,
  Timer,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  attendanceSummary,
  finalScore,
  findAttempt,
  formatDate,
  formatDateTime,
  getSubjectName,
  daysUntil,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";

export function StudentDashboard() {
  const { state } = useDemo();
  const student = state.students.find((item) => item.id === state.activeChildId) ?? state.students[0];
  if (!student) return null;

  const submissions = state.submissions.filter((item) => item.studentId === student.id);
  const tasks = state.tasks
    .filter((task) => task.classId === student.classId && task.status === "published")
    .sort((a, b) => (a.deadline > b.deadline ? 1 : -1));
  const pending = tasks.filter((task) => {
    const submission = submissions.find((item) => item.taskId === task.id);
    return !submission || submission.status === "draft" || submission.status === "perlu_revisi";
  });
  const activeExams = state.exams.filter(
    (exam) =>
      exam.classId === student.classId &&
      exam.published &&
      exam.status === "aktif" &&
      !findAttempt(state, exam.id, student.id)
  );
  const materials = state.materials
    .filter((material) => material.classId === student.classId && material.status === "published")
    .slice(0, 3);
  const attendance = attendanceSummary(
    state.attendance.filter((item) => item.studentId === student.id)
  );
  const grades = state.grades.filter((grade) => grade.studentId === student.id);
  const average =
    grades.length === 0
      ? 0
      : Math.round(grades.reduce((sum, grade) => sum + finalScore(grade), 0) / grades.length);
  const nextTask = pending[0];
  const startedExam = state.examAttempts.find(
    (attempt) => attempt.studentId === student.id && attempt.status === "mengerjakan"
  );

  return (
    <div>
      <PageHeader
        eyebrow={`${student.name} · ${state.classes.find((item) => item.id === student.classId)?.name ?? "—"}`}
        title="Belajar hari ini"
        description="Kerjakan yang paling dekat tenggatnya, lalu lanjutkan materi atau ujian yang sedang aktif."
        actions={
          nextTask ? (
            <ButtonLink href="/dashboard/tugas" size="sm" icon={<ClipboardList className="h-4 w-4" />}>
              Lanjutkan Tugas
            </ButtonLink>
          ) : activeExams.length > 0 ? (
            <ButtonLink href="/dashboard/ujian" size="sm" icon={<PlayCircle className="h-4 w-4" />}>
              Mulai Ujian
            </ButtonLink>
          ) : (
            <ButtonLink href="/dashboard/materi" size="sm" icon={<BookOpen className="h-4 w-4" />}>
              Buka Materi
            </ButtonLink>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tugas menunggu" value={pending.length} hint="Termasuk draft dan revisi" icon={ClipboardList} tone={pending.length ? "amber" : "emerald"} href="/dashboard/tugas" />
        <StatCard label="Ujian aktif" value={activeExams.length} hint="Dapat dikerjakan sekarang" icon={FileQuestion} tone={activeExams.length ? "blue" : "slate"} href="/dashboard/ujian" />
        <StatCard label="Kehadiran" value={`${attendance.percentage}%`} hint={`${attendance.hadir} dari ${attendance.total} pertemuan`} icon={CalendarCheck} tone={attendance.percentage >= 90 ? "emerald" : "amber"} href="/dashboard/absensi" />
        <StatCard label="Rata-rata nilai" value={average || "—"} hint="Empat mata pelajaran utama" icon={GraduationCap} tone="brand" href="/dashboard/rapor" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {nextTask && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                    Prioritas hari ini
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{nextTask.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {getSubjectName(state, nextTask.subjectId)} · tenggat {formatDate(nextTask.deadline)}
                  </p>
                </div>
                <StatusBadge
                  tone={daysUntil(nextTask.deadline) < 0 ? "danger" : "warning"}
                  label={
                    daysUntil(nextTask.deadline) < 0
                      ? "Lewat tenggat"
                      : daysUntil(nextTask.deadline) === 0
                        ? "Hari ini"
                        : `${daysUntil(nextTask.deadline)} hari lagi`
                  }
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href="/dashboard/tugas" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Kerjakan Sekarang
                </ButtonLink>
                <ButtonLink href="/dashboard/materi" size="sm" variant="outline">
                  Lihat materi terkait
                </ButtonLink>
              </div>
            </div>
          )}

          {startedExam && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Timer className="mt-0.5 h-5 w-5 text-blue-700" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ujian sedang dikerjakan</p>
                    <p className="text-xs text-slate-600">
                      {state.exams.find((exam) => exam.id === startedExam.examId)?.title}
                    </p>
                  </div>
                </div>
                <ButtonLink href="/dashboard/ujian/kerjakan" size="sm" variant="outline">
                  Lanjutkan
                </ButtonLink>
              </div>
            </div>
          )}

          <SectionCard
            title="Tugas dengan tenggat terdekat"
            description="Tugas yang belum dikumpulkan atau masih berstatus draft."
            icon={<ClipboardList className="h-4 w-4" />}
            action={<Link href="/dashboard/tugas" className="text-xs font-semibold text-brand-700 hover:underline">Semua tugas</Link>}
            bodyClassName="p-0"
          >
            {pending.length === 0 ? (
              <EmptyState
                title="Semua tugas sudah dikumpulkan"
                description="Tidak ada tugas tertunda untuk kelas ini. Gunakan waktu untuk muraja'ah materi."
                icon={ClipboardList}
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pending.slice(0, 5).map((task) => {
                  const submission = submissions.find((item) => item.taskId === task.id);
                  return (
                    <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-500">
                          {getSubjectName(state, task.subjectId)} · {formatDate(task.deadline)}
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
            title="Ujian"
            description="Ujian yang sedang aktif atau akan datang."
            icon={<FileQuestion className="h-4 w-4" />}
            action={<Link href="/dashboard/ujian" className="text-xs font-semibold text-brand-700 hover:underline">Semua ujian</Link>}
            bodyClassName="p-0"
          >
            {state.exams.filter((exam) => exam.classId === student.classId && exam.published).length === 0 ? (
              <EmptyState title="Belum ada ujian" description="Guru belum menjadwalkan ujian untuk kelas ini." icon={FileQuestion} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {state.exams
                  .filter((exam) => exam.classId === student.classId && exam.published)
                  .slice(0, 3)
                  .map((exam) => {
                    const attempt = findAttempt(state, exam.id, student.id);
                    return (
                      <li key={exam.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{exam.title}</p>
                          <p className="text-xs text-slate-500">
                            {getSubjectName(state, exam.subjectId)} · {exam.durationMinutes} menit ·{" "}
                            {formatDateTime(exam.scheduledAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={attempt?.status ?? exam.status} />
                          {exam.status === "aktif" && attempt?.status !== "dinilai" && (
                            <ButtonLink href="/dashboard/ujian/kerjakan" size="sm" variant="outline">
                              Mulai
                            </ButtonLink>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            title="Materi terbaru"
            description="Materi yang baru dipublikasikan untuk kelasmu."
            icon={<BookOpen className="h-4 w-4" />}
            action={<Link href="/dashboard/materi" className="text-xs font-semibold text-brand-700 hover:underline">Semua</Link>}
          >
            {materials.length === 0 ? (
              <EmptyState title="Belum ada materi" description="Materi yang dipublikasikan guru akan muncul di sini." icon={BookOpen} />
            ) : (
              <ul className="space-y-2.5">
                {materials.map((material) => (
                  <li key={material.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-800">{material.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {getSubjectName(state, material.subjectId)} · {formatDate(material.createdAt)}
                    </p>
                    <Link href="/dashboard/materi" className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline">
                      Baca materi <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Kehadiran" description="Rekap semester ganjil." icon={<CalendarCheck className="h-4 w-4" />}>
            <ProgressBar
              value={attendance.percentage}
              tone={attendance.percentage >= 90 ? "emerald" : "amber"}
              label="Persentase hadir"
              hint={`${attendance.percentage}%`}
            />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Izin", value: attendance.izin, tone: "text-blue-700" },
                { label: "Sakit", value: attendance.sakit, tone: "text-amber-700" },
                { label: "Alpa", value: attendance.alpa, tone: "text-rose-700" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 py-2 ring-1 ring-inset ring-slate-200">
                  <p className={`text-lg font-bold ${item.tone}`}>{item.value}</p>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Nilai terbaru" description="Empat mapel utama." icon={<GraduationCap className="h-4 w-4" />}>
            <div className="space-y-3">
              {grades.slice(0, 4).map((grade) => (
                <ProgressBar
                  key={grade.id}
                  label={getSubjectName(state, grade.subjectId)}
                  value={finalScore(grade)}
                  hint={`${finalScore(grade)}`}
                  tone={finalScore(grade) >= 80 ? "emerald" : "blue"}
                />
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
