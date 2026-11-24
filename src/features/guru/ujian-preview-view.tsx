"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, ImageIcon, Send } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getClassName, getSubjectName } from "@/lib/utils";

export function UjianPreviewView() {
  const { state, publishExam } = useDemo();
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const myExams = state.exams.filter((exam) => (teacher ? exam.teacherId === teacher.id : true));
  const [selectedId, setSelectedId] = useState(
    myExams.find((exam) => !exam.published)?.id ?? myExams[0]?.id ?? ""
  );
  const exam = myExams.find((item) => item.id === selectedId);

  return (
    <div>
      <Link href="/dashboard/ujian" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar ujian
      </Link>
      <PageHeader
        eyebrow="Guru · Preview ujian"
        title="Preview ujian sebelum dipublikasikan"
        description="Periksa urutan soal, kunci jawaban, dan bobot nilai dari sudut pandang guru."
        actions={
          exam && !exam.published ? (
            <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => publishExam(exam.id)}>
              Publikasikan Ujian
            </Button>
          ) : (
            <ButtonLink href="/dashboard/ujian/rekap" size="sm" variant="outline">
              Lihat Rekap
            </ButtonLink>
          )
        }
      />

      {myExams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon={Clock}
            title="Belum ada ujian"
            description="Buat ujian terlebih dahulu untuk melihat preview di sini."
            action={<ButtonLink href="/dashboard/ujian/buat" size="sm">Buat Ujian</ButtonLink>}
          />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <label htmlFor="preview-exam" className="label-base">Pilih ujian untuk dipreview</label>
              <Select id="preview-exam" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {myExams.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} {item.published ? "(dipublikasikan)" : "(draft)"}
                  </option>
                ))}
              </Select>
            </div>

            {exam && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{exam.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{exam.description}</p>
                  </div>
                  <StatusBadge status={exam.published ? exam.status : "draft"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{getSubjectName(state, exam.subjectId)}</span>
                  <span>Kelas {getClassName(state, exam.classId)}</span>
                  <span>{exam.durationMinutes} menit</span>
                  <span>{exam.questions.length} soal</span>
                  <span>{exam.questions.reduce((sum, question) => sum + question.score, 0)} poin</span>
                </div>

                <ol className="mt-5 space-y-4">
                  {exam.questions.map((question, index) => (
                    <li key={question.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">
                          {index + 1}. {question.text}
                        </p>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {question.score} poin
                        </span>
                      </div>
                      {question.imageMock && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-500">
                          <ImageIcon className="h-4 w-4" aria-hidden /> Gambar mock: {question.imageMock}
                        </div>
                      )}
                      {question.options ? (
                        <ul className="mt-2.5 space-y-1.5">
                          {question.options.map((option, optionIndex) => (
                            <li
                              key={option}
                              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                                optionIndex === question.correctIndex
                                  ? "bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-200"
                                  : "bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span>{option}</span>
                              {optionIndex === question.correctIndex && (
                                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Kunci
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                          Soal esai — dinilai berdasarkan kelengkapan jawaban (bobot {question.score} poin).
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Checklist publikasi</h2>
              <ul className="mt-2 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Judul dan kelas sudah sesuai.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Kunci jawaban pilihan ganda diperiksa.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Durasi sesuai rencana pembelajaran.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Bobot nilai total {exam?.questions.reduce((sum, question) => sum + question.score, 0) ?? 0} poin.
                </li>
              </ul>
            </div>
            {exam && !exam.published && (
              <Button className="w-full" icon={<Send className="h-4 w-4" />} onClick={() => publishExam(exam.id)}>
                Publikasikan Sekarang
              </Button>
            )}
            <ButtonLink href="/dashboard/ujian/buat" variant="outline" className="w-full">
              Buat ujian lain
            </ButtonLink>
          </aside>
        </div>
      )}
    </div>
  );
}
