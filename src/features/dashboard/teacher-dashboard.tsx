"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileQuestion,
  Layers,
  School,
  Users,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  formatDate,
  formatDateTime,
  getClassName,
  getSubjectName,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriorityCard } from "@/components/ui/priority-card";

export function TeacherDashboard() {
  const { state } = useDemo();
  const teacher =
    state.teachers.find((item) => item.id === state.activeTeacherId) ?? state.teachers[0];
  if (!teacher) return null;

  const myTasks = state.tasks.filter((task) => task.teacherId === teacher.id);
  const myTaskIds = new Set(myTasks.map((task) => task.id));
  const ungraded = state.submissions.filter(
    (submission) =>
      myTaskIds.has(submission.taskId) &&
      (submission.status === "terkirim" || submission.status === "terlambat")
  );
  const activeExams = state.exams.filter(
    (exam) => exam.teacherId === teacher.id && exam.published && exam.status !== "ditutup"
  );
  const draftExams = state.exams.filter((exam) => exam.teacherId === teacher.id && !exam.published);
  const myMaterials = state.materials
    .filter((material) => material.teacherId === teacher.id)
    .slice(0, 4);
  const myClasses = state.classes.filter((item) => teacher.classIds.includes(item.id));
  const today = "2026-11-24";
  const filledToday = state.attendance.some(
    (record) => record.date === today && myClasses.some((item) => item.id === record.classId)
  );
  const attendanceTarget = myClasses[0];
  const attendanceSubject = state.subjects.find((subject) =>
    teacher.subjectIds.includes(subject.id)
  );

  return (
    <div>
      <PageHeader
        eyebrow={`${teacher.name} · ${myClasses.map((item) => item.name).join(", ")}`}
        title="Pekerjaan mengajar"
        description="Prioritaskan absensi yang belum diisi dan tugas yang menunggu penilaian."
        actions={
          <>
            <ButtonLink href="/dashboard/absensi" variant="outline" size="sm" icon={<CalendarCheck className="h-4 w-4" />}>
              Isi Absensi
            </ButtonLink>
            <ButtonLink href="/dashboard/tugas/buat" size="sm" icon={<ClipboardCheck className="h-4 w-4" />}>
              Buat Tugas
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tugas belum dinilai" value={ungraded.length} hint="Pengumpulan berstatus terkirim" icon={ClipboardList} tone={ungraded.length ? "amber" : "emerald"} href="/dashboard/tugas" />
        <StatCard label="Absensi hari ini" value={filledToday ? "Sudah" : "Belum"} hint={filledToday ? "Semua kelas terisi" : "Kelas 8A menunggu" } icon={CalendarCheck} tone={filledToday ? "emerald" : "rose"} href="/dashboard/absensi" />
        <StatCard label="Ujian aktif" value={activeExams.length} hint={`${draftExams.length} draft siap dipreview`} icon={FileQuestion} tone="blue" href="/dashboard/ujian" />
        <StatCard label="Kelas diajar" value={myClasses.length} hint={`${state.students.filter((s) => teacher.classIds.includes(s.classId)).length} santri`} icon={School} tone="brand" href="/dashboard/kelas" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <SectionCard
            title="Perlu tindakan"
            description="Pekerjaan yang paling berdampak pada wali dan siswa."
            icon={<ClipboardCheck className="h-4 w-4" />}
          >
            <div className="space-y-2.5">
              {!filledToday && (
                <PriorityCard
                  icon={CalendarCheck}
                  title={`Absensi ${getClassName(state, attendanceTarget?.id)} belum diisi`}
                  description={`${attendanceSubject?.name ?? "Mata pelajaran"} · tanggal ${formatDate(today)}. Wali menunggu rekap kehadiran.`}
                  actionLabel="Isi absensi"
                  href="/dashboard/absensi"
                  tone="danger"
                  meta="Hari ini"
                />
              )}
              {ungraded.length > 0 && (
                <PriorityCard
                  icon={ClipboardList}
                  title={`${ungraded.length} tugas menunggu penilaian`}
                  description="Siswa dan wali baru melihat nilai setelah penilaian disimpan."
                  actionLabel="Nilai tugas"
                  href="/dashboard/tugas"
                  tone="warning"
                />
              )}
              {draftExams[0] && (
                <PriorityCard
                  icon={FileQuestion}
                  title={`Draft ujian: ${draftExams[0].title}`}
                  description="Periksa soal, durasi, dan jadwal sebelum dipublikasikan ke siswa."
                  actionLabel="Preview ujian"
                  href="/dashboard/ujian/preview"
                  tone="info"
                />
              )}
              {filledToday && ungraded.length === 0 && draftExams.length === 0 && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-200">
                  Semua pekerjaan mendesak sudah selesai. Terima kasih.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Pengumpulan terbaru"
            description="Tugas yang perlu diperiksa dan dinilai."
            icon={<ClipboardList className="h-4 w-4" />}
            action={<Link href="/dashboard/tugas" className="text-xs font-semibold text-brand-700 hover:underline">Buka tugas</Link>}
            bodyClassName="p-0"
          >
            {ungraded.length === 0 ? (
              <EmptyState
                title="Tidak ada pengumpulan baru"
                description="Semua pengumpulan sudah dinilai. Pengumpulan baru akan muncul di sini."
                icon={ClipboardList}
                tone="info"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {ungraded.slice(0, 5).map((submission) => {
                  const task = state.tasks.find((item) => item.id === submission.taskId);
                  const student = state.students.find((item) => item.id === submission.studentId);
                  return (
                    <li key={submission.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {student?.name} · {task?.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getSubjectName(state, task?.subjectId)} · dikumpulkan {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={submission.status} />
                        <ButtonLink href="/dashboard/tugas" size="sm" variant="outline">
                          Nilai
                        </ButtonLink>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Materi terbaru"
            description="Materi yang Anda kelola."
            icon={<BookOpen className="h-4 w-4" />}
            action={<Link href="/dashboard/materi" className="text-xs font-semibold text-brand-700 hover:underline">Kelola materi</Link>}
          >
            {myMaterials.length === 0 ? (
              <EmptyState title="Belum ada materi" description="Buat materi pertama untuk kelas yang Anda ajar." icon={BookOpen} action={<ButtonLink href="/dashboard/materi" size="sm">Buat materi</ButtonLink>} />
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {myMaterials.map((material) => (
                  <li key={material.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{material.title}</p>
                      <StatusBadge status={material.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {getSubjectName(state, material.subjectId)} · {getClassName(state, material.classId)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Ujian" description="Jadwal dan status ujian Anda." icon={<FileQuestion className="h-4 w-4" />} action={<Link href="/dashboard/ujian" className="text-xs font-semibold text-brand-700 hover:underline">Semua</Link>}>
            <ul className="space-y-2.5">
              {state.exams
                .filter((exam) => exam.teacherId === teacher.id)
                .slice(0, 4)
                .map((exam) => (
                  <li key={exam.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{exam.title}</p>
                      <StatusBadge status={exam.published ? exam.status : "draft"} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {getClassName(state, exam.classId)} · {exam.durationMinutes} menit ·{" "}
                      {formatDateTime(exam.scheduledAt)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Link href="/dashboard/ujian/preview" className="text-[11px] font-semibold text-brand-700 hover:underline">
                        Preview
                      </Link>
                      <Link href="/dashboard/ujian/rekap" className="text-[11px] font-semibold text-brand-700 hover:underline">
                        Rekap
                      </Link>
                    </div>
                  </li>
                ))}
            </ul>
          </SectionCard>

          <SectionCard title="Kelas yang diajar" description="Ringkasan santri per kelas." icon={<Users className="h-4 w-4" />} action={<Link href="/dashboard/kelas" className="text-xs font-semibold text-brand-700 hover:underline">Detail</Link>}>
            <ul className="space-y-2">
              {myClasses.map((item) => {
                const count = state.students.filter((student) => student.classId === item.id).length;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Kelas {item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {state.teachers.find((t) => t.id === item.homeroomTeacherId)?.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {count} santri
                    </span>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <ButtonLink href="/dashboard/tugas/buat" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
            Buat Tugas Baru
          </ButtonLink>
          <ButtonLink href="/dashboard/ujian/buat" variant="outline" className="w-full">
            Buat Ujian Baru
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
