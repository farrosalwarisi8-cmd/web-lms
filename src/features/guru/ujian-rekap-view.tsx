"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, FileQuestion } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { getClassName, getSubjectName } from "@/lib/utils";
import type { ExamAttempt } from "@/lib/types";

export function UjianRekapView() {
  const { state, gradeExamAttempt } = useDemo();
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const myExams = state.exams.filter((exam) => (teacher ? exam.teacherId === teacher.id : true));
  const [examId, setExamId] = useState(
    myExams.find((exam) => exam.published)?.id ?? myExams[0]?.id ?? ""
  );
  const exam = myExams.find((item) => item.id === examId);
  const attempts = state.examAttempts.filter((attempt) => attempt.examId === examId);
  const graded = attempts.filter((attempt) => attempt.status === "dinilai");
  const average =
    graded.length === 0
      ? 0
      : Math.round(graded.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / graded.length);

  const columns: Column<ExamAttempt>[] = [
    {
      key: "student",
      header: "Siswa",
      render: (attempt) => (
        <span className="font-medium text-slate-800">
          {state.students.find((student) => student.id === attempt.studentId)?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (attempt) => <StatusBadge status={attempt.status} />,
    },
    {
      key: "answered",
      header: "Terjawab",
      render: (attempt) => `${Object.keys(attempt.answers).length} / ${exam?.questions.length ?? 0}`,
    },
    {
      key: "score",
      header: "Nilai",
      render: (attempt) =>
        attempt.score !== undefined ? <span className="font-semibold">{attempt.score}</span> : "—",
    },
    {
      key: "action",
      header: "Aksi",
      render: (attempt) =>
        attempt.status === "terkirim" ? (
          <Button size="sm" variant="outline" onClick={() => gradeExamAttempt(attempt.id, attempt.score ?? 0)}>
            Sahkan Nilai
          </Button>
        ) : attempt.status === "dinilai" ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Selesai
          </span>
        ) : (
          <span className="text-xs text-slate-400">Menunggu</span>
        ),
    },
  ];

  return (
    <div>
      <Link href="/dashboard/ujian" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar ujian
      </Link>
      <PageHeader
        eyebrow="Guru · Rekap ujian"
        title="Rekap hasil ujian"
        description="Pantau peserta, jumlah soal terjawab, dan nilai. Sahkan nilai untuk mengumumkannya ke siswa dan wali."
        actions={
          <Link href="/dashboard/ujian/preview" className="text-xs font-semibold text-brand-700 hover:underline">
            Preview ujian
          </Link>
        }
      />

      {myExams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState icon={FileQuestion} title="Belum ada ujian" description="Buat ujian terlebih dahulu untuk melihat rekap." />
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <label htmlFor="rekap-exam" className="label-base">Pilih ujian</label>
            <Select id="rekap-exam" value={examId} onChange={(event) => setExamId(event.target.value)}>
              {myExams.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — Kelas {getClassName(state, item.classId)}
                </option>
              ))}
            </Select>
            {exam && (
              <p className="mt-2 text-xs text-slate-500">
                {getSubjectName(state, exam.subjectId)} · {exam.questions.length} soal ·{" "}
                {exam.durationMinutes} menit
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Peserta" value={attempts.length} hint="Termasuk yang sedang mengerjakan" icon={BarChart3} tone="blue" />
            <StatCard label="Sudah dinilai" value={graded.length} hint={`${attempts.length - graded.length} menunggu`} icon={CheckCircle2} tone={graded.length === attempts.length ? "emerald" : "amber"} />
            <StatCard label="Rata-rata nilai" value={average || "—"} hint="Dari peserta yang sudah dinilai" icon={BarChart3} tone="brand" />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Daftar peserta</h2>
            </div>
            <DataTable
              columns={columns}
              rows={attempts}
              keyFor={(attempt) => attempt.id}
              empty={
                <EmptyState
                  title="Belum ada peserta"
                  description="Siswa yang mulai mengerjakan ujian akan muncul di sini. Bila ujian masih draft, publikasikan terlebih dahulu."
                  icon={FileQuestion}
                />
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
