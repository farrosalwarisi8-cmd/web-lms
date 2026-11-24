"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, FastForward, Send, Timer } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getClassName, getSubjectName } from "@/lib/utils";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

export function UjianKerjakanView() {
  const { state, startExam, answerExamQuestion, submitExam } = useDemo();
  const router = useRouter();
  const student = state.students.find((item) => item.id === state.activeChildId);
  const [examId, setExamId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const exam = state.exams.find((item) => item.id === examId);
  const attempt = state.examAttempts.find(
    (item) => item.examId === examId && item.studentId === student?.id
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("exam");
    if (requested && state.exams.some((item) => item.id === requested)) {
      setExamId(requested);
    } else if (student) {
      const active = state.exams.find(
        (item) =>
          item.classId === student.classId &&
          item.published &&
          item.status === "aktif" &&
          state.examAttempts.every(
            (att) => !(att.examId === item.id && att.studentId === student.id)
          )
      );
      setExamId(active?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id]);

  useEffect(() => {
    if (!exam || !student || startedRef.current) return;
    startedRef.current = true;
    if (!attempt || attempt.status === "belum") {
      void startExam(exam.id, student.id);
    }
    setSeconds(exam.durationMinutes * 60);
    setAnswers(attempt?.answers ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.id, student?.id]);

  useEffect(() => {
    if (attempt && Object.keys(attempt.answers).length > 0) {
      setAnswers((prev) => ({ ...prev, ...attempt.answers }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.answers]);

  useEffect(() => {
    if (!exam) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [exam]);

  const answeredCount = useMemo(
    () => (exam ? exam.questions.filter((question) => answers[question.id]?.trim()).length : 0),
    [exam, answers]
  );
  const total = exam?.questions.length ?? 0;
  const remaining = total - answeredCount;

  useEffect(() => {
    if (seconds === 0 && exam && attempt?.status === "mengerjakan") {
      void submitExam(exam.id, student?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  async function handleSubmit() {
    if (!exam || !student) return;
    setSubmitting(true);
    await submitExam(exam.id, student.id);
    setSubmitting(false);
    setConfirmOpen(false);
    router.push("/dashboard/ujian");
  }

  if (!student || !exam) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={Timer}
          title="Tidak ada ujian aktif"
          description="Saat ini tidak ada ujian yang dapat dikerjakan untuk kelasmu. Ujian yang sudah selesai dapat dilihat pada daftar ujian."
          action={<Button onClick={() => router.push("/dashboard/ujian")}>Kembali ke daftar ujian</Button>}
        />
      </div>
    );
  }

  if (attempt && (attempt.status === "terkirim" || attempt.status === "dinilai")) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Jawaban sudah terkirim</h1>
          <p className="mt-1 text-sm text-slate-600">
            {attempt.status === "dinilai"
              ? `Nilai ujian Anda: ${attempt.score}.`
              : "Menunggu guru menyelesaikan penilaian."}
          </p>
          <StatusBadge status={attempt.status} className="mt-3" />
          <Button className="mt-5" onClick={() => router.push("/dashboard/ujian")}>
            Kembali ke daftar ujian
          </Button>
        </div>
      </div>
    );
  }

  const question = exam.questions[index];

  return (
    <div>
      <Link href="/dashboard/ujian" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Keluar dari ujian
      </Link>
      <PageHeader
        eyebrow={`${getSubjectName(state, exam.subjectId)} · Kelas ${getClassName(state, exam.classId)}`}
        title={exam.title}
        description={`${total} soal · ${exam.durationMinutes} menit. Jawaban tersimpan otomatis pada state demo.`}
        actions={
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ring-1 ring-inset ${
                seconds < 60 ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-slate-900 text-white ring-slate-900"
              }`}
              aria-live="polite"
              aria-label={`Sisa waktu ${formatTime(seconds)}`}
            >
              <Clock className="h-4 w-4" aria-hidden />
              {formatTime(seconds)}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<FastForward className="h-4 w-4" />}
              onClick={() => setSeconds((prev) => Math.max(0, prev - 300))}
              title="Percepat waktu 5 menit untuk presentasi"
            >
              Percepat
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          {review ? (
            <div>
              <h2 className="text-base font-bold text-slate-900">Tinjau jawaban</h2>
              <p className="mt-1 text-sm text-slate-600">
                {answeredCount} dari {total} soal terjawab. Soal kosong dapat diisi kembali sebelum dikirim.
              </p>
              <ul className="mt-4 space-y-2">
                {exam.questions.map((item, itemIndex) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                    <span className="text-sm text-slate-700">
                      Soal {itemIndex + 1} · {item.type === "pilihan_ganda" ? "Pilihan ganda" : "Esai"}
                    </span>
                    <span className={`text-xs font-semibold ${answers[item.id]?.trim() ? "text-emerald-700" : "text-amber-700"}`}>
                      {answers[item.id]?.trim() ? "Terjawab" : "Belum dijawab"}
                    </span>
                  </li>
                ))}
              </ul>
              {remaining > 0 && (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Masih ada {remaining} soal belum dijawab. Anda tetap dapat mengirim jawaban.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setReview(false)}>Kembali ke soal</Button>
                <Button icon={<Send className="h-4 w-4" />} onClick={() => setConfirmOpen(true)}>
                  Kirim Jawaban
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Soal {index + 1} dari {total}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {question.score} poin
                </span>
              </div>
              <ProgressBar value={((index + 1) / total) * 100} className="mt-2" tone="brand" />
              <h2 className="mt-4 text-base font-semibold leading-relaxed text-slate-900">{question.text}</h2>

              {question.type === "pilihan_ganda" && question.options && (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const selected = answers[question.id] === String(optionIndex);
                    return (
                      <label
                        key={option}
                        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                          selected
                            ? "border-brand-400 bg-brand-50 text-slate-900"
                            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={selected}
                          onChange={() => answerExamQuestion(exam.id, student.id, question.id, String(optionIndex))}
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 focus:ring-brand-500"
                        />
                        <span>
                          <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>{" "}
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === "esai" && (
                <textarea
                  value={answers[question.id] ?? ""}
                  onChange={(event) => answerExamQuestion(exam.id, student.id, question.id, event.target.value)}
                  className="input-base mt-4 min-h-40 resize-y"
                  placeholder="Tuliskan jawaban esai Anda di sini..."
                  aria-label={`Jawaban untuk soal ${index + 1}`}
                />
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <Button variant="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
                  Sebelumnya
                </Button>
                {index < total - 1 ? (
                  <Button onClick={() => setIndex((value) => Math.min(total - 1, value + 1))}>Soal Berikutnya</Button>
                ) : (
                  <Button onClick={() => setReview(true)} icon={<CheckCircle2 className="h-4 w-4" />}>Tinjau Jawaban</Button>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigasi soal</h2>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {exam.questions.map((item, itemIndex) => {
                const answered = Boolean(answers[item.id]?.trim());
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setIndex(itemIndex); setReview(false); }}
                    aria-label={`Soal ${itemIndex + 1}${answered ? ", sudah dijawab" : ""}`}
                    className={`grid h-9 place-items-center rounded-lg text-xs font-semibold ring-1 ring-inset ${
                      itemIndex === index
                        ? "bg-slate-900 text-white ring-slate-900"
                        : answered
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {itemIndex + 1}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">{answeredCount} dari {total} terjawab</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-900">
            Timer demo dapat dipercepat dengan tombol Percepat. Ujian akan terkirim otomatis saat waktu habis.
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Kirim jawaban ujian?"
        description={`Anda akan mengirim ${answeredCount} jawaban. Setelah dikirim, jawaban tidak dapat diubah pada demo ini.`}
        confirmLabel="Ya, Kirim Jawaban"
        loading={submitting}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
