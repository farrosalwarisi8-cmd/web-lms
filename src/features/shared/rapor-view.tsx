"use client";

import { useState } from "react";
import { Download, GraduationCap, Lock, Send } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  attendanceSummary,
  finalScore,
  formatDate,
  getClassName,
  getSubjectName,
} from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";

export function RaporView() {
  const { state, publishReportCard, showToast } = useDemo();
  const role = state.activeRole;
  const canManage = role === "guru" || role === "admin_akademik" || role === "super_admin";
  const activeChild = state.students.find((item) => item.id === state.activeChildId);
  const [selectedId, setSelectedId] = useState(activeChild?.id ?? state.students[0]?.id ?? "");
  const student = canManage
    ? state.students.find((item) => item.id === selectedId) ?? state.students[0]
    : activeChild ?? state.students[0];

  if (!student) return null;
  const reportCard = state.reportCards.find(
    (card) => card.studentId === student.id && card.periodId === state.activePeriodId
  );
  const grades = state.grades.filter(
    (grade) => grade.studentId === student.id && grade.periodId === state.activePeriodId
  );
  const attendance = attendanceSummary(
    state.attendance.filter((record) => record.studentId === student.id)
  );
  const average =
    grades.length === 0 ? 0 : Math.round(grades.reduce((sum, grade) => sum + finalScore(grade), 0) / grades.length);
  const published = reportCard?.status === "published";
  const classInfo = state.classes.find((item) => item.id === student.classId);

  return (
    <div>
      <PageHeader
        eyebrow={`${student.name} · Rapor semester ganjil`}
        title="Rapor"
        description={
          canManage
            ? "Periksa nilai akhir, catatan wali kelas, lalu terbitkan rapor agar dapat dibaca wali dan siswa."
            : "Rapor yang telah diterbitkan dapat dibaca dan diunduh sebagai simulasi PDF."
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => showToast("PDF demo siap diunduh", "success", "Simulasi unduhan rapor berhasil dibuat.")}
            >
              Unduh PDF (demo)
            </Button>
            {canManage && reportCard && !published && (
              <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => publishReportCard(reportCard.id)}>
                Terbitkan Rapor
              </Button>
            )}
          </>
        }
      />

      {canManage && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="report-student" className="label-base">Pilih siswa</label>
          <Select id="report-student" value={student.id} onChange={(event) => setSelectedId(event.target.value)}>
            {state.students.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — Kelas {getClassName(state, item.classId)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {!published && !canManage ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon={Lock}
            title="Rapor belum diterbitkan"
            description="Guru atau wali kelas belum menerbitkan rapor untuk semester ini. Anda dapat melihat nilai terbaru pada menu Rapor setelah rapor diterbitkan."
            tone="info"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="border-b-4 border-brand-500 bg-slate-900 px-5 py-4 text-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-brand-300">Pesantren Ansharussunnah</p>
                <h2 className="text-lg font-bold">Rapor Hasil Belajar Santri</h2>
                <p className="text-xs text-slate-300">
                  {state.schoolPeriods.find((period) => period.id === state.activePeriodId)?.name} · Semester Ganjil
                </p>
              </div>
              <StatusBadge status={published ? "published" : "draft"} label={published ? "Diterbitkan" : "Draft guru"} />
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-2">
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">Nama</dt>
                <dd className="font-semibold text-slate-900">{student.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">NIS</dt>
                <dd className="text-slate-700">{student.nis}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">Kelas</dt>
                <dd className="text-slate-700">{classInfo?.name ?? "—"}</dd>
              </div>
            </dl>
            <dl className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">Wali kelas</dt>
                <dd className="text-slate-700">
                  {state.teachers.find((teacher) => teacher.id === classInfo?.homeroomTeacherId)?.name ?? "—"}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">Kehadiran</dt>
                <dd className="text-slate-700">{attendance.percentage}% ({attendance.hadir} hadir)</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-slate-500">Rata-rata</dt>
                <dd className="font-semibold text-slate-900">{average}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-x-auto p-5">
            <table className="table-base">
              <caption className="sr-only">Nilai rapor per mata pelajaran</caption>
              <thead>
                <tr>
                  <th scope="col">Mata pelajaran</th>
                  <th scope="col" className="text-center">Tugas</th>
                  <th scope="col" className="text-center">Ujian</th>
                  <th scope="col" className="text-center">Hafalan</th>
                  <th scope="col" className="text-center">Akhlak</th>
                  <th scope="col" className="text-center">Nilai akhir</th>
                  <th scope="col">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const score = finalScore(grade);
                  return (
                    <tr key={grade.id}>
                      <td>
                        <p className="font-medium text-slate-800">{getSubjectName(state, grade.subjectId)}</p>
                        {grade.note && <p className="mt-0.5 max-w-xs text-[11px] text-slate-500">{grade.note}</p>}
                      </td>
                      <td className="text-center">{grade.assignmentScore}</td>
                      <td className="text-center">{grade.examScore}</td>
                      <td className="text-center">{grade.memorizationScore}</td>
                      <td className="text-center">{grade.akhlakScore}</td>
                      <td className="text-center">
                        <span className={`font-bold ${score >= 80 ? "text-emerald-700" : score >= 75 ? "text-slate-800" : "text-amber-700"}`}>
                          {score}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-600">
                          {score >= 90 ? "A" : score >= 80 ? "B" : score >= 75 ? "C" : "D"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {grades.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">Belum ada nilai untuk semester ini.</p>
            )}
          </div>

          <div className="border-t border-slate-100 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <GraduationCap className="h-4 w-4 text-brand-700" aria-hidden />
              Catatan wali kelas
            </h3>
            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
              {reportCard?.homeroomNote ??
                "Catatan wali kelas akan tampil setelah rapor diperiksa dan diterbitkan."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ProgressBar label="Kehadiran" value={attendance.percentage} tone={attendance.percentage >= 90 ? "emerald" : "amber"} />
              <ProgressBar label="Nilai akhir rata-rata" value={average} tone="brand" />
            </div>
            {published && reportCard?.publishedAt && (
              <p className="mt-4 text-[11px] text-slate-400">
                Diterbitkan pada {formatDate(reportCard.publishedAt)} · Dokumen ini adalah simulasi demo, bukan rapor resmi.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
