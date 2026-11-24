"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Plus, Send, Trash2, Info } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getClassName, getSubjectName } from "@/lib/utils";
import type { ExamQuestion } from "@/lib/types";

export function UjianBuatView() {
  const router = useRouter();
  const { state, addExam, showToast } = useDemo();
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [type, setType] = useState<ExamQuestion["type"]>("pilihan_ganda");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [classId, setClassId] = useState(teacher?.classIds[0] ?? "");
  const [subjectId, setSubjectId] = useState(teacher?.subjectIds[0] ?? "");

  function addQuestion() {
    const text = (document.getElementById("q-text") as HTMLInputElement | null)?.value.trim() ?? "";
    if (!text) {
      showToast("Soal belum diisi", "error", "Tuliskan pertanyaan terlebih dahulu.");
      return;
    }
    const score = Number((document.getElementById("q-score") as HTMLInputElement | null)?.value ?? 10);
    if (type === "pilihan_ganda") {
      const options = [0, 1, 2, 3].map(
        (index) => (document.getElementById(`q-option-${index}`) as HTMLInputElement | null)?.value.trim() || ""
      );
      if (options.some((option) => !option)) {
        showToast("Opsi jawaban belum lengkap", "error", "Isi keempat pilihan jawaban.");
        return;
      }
      const correctIndex = Number((document.getElementById("q-correct") as HTMLSelectElement | null)?.value ?? 0);
      setQuestions((prev) => [
        ...prev,
        {
          id: `q-${Date.now()}`,
          type: "pilihan_ganda",
          text,
          options,
          correctIndex,
          score: Number.isFinite(score) ? score : 10,
        },
      ]);
      [0, 1, 2, 3].forEach((index) => {
        const input = document.getElementById(`q-option-${index}`) as HTMLInputElement | null;
        if (input) input.value = "";
      });
    } else {
      setQuestions((prev) => [
        ...prev,
        { id: `q-${Date.now()}`, type: "esai", text, score: Number.isFinite(score) ? score : 10 },
      ]);
    }
    const textInput = document.getElementById("q-text") as HTMLInputElement | null;
    if (textInput) textInput.value = "";
    showToast("Soal ditambahkan", "success");
  }

  async function save(status: "draft" | "published") {
    const form = document.getElementById("form-ujian") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const scheduledAt = String(data.get("scheduledAt") ?? "");
    const duration = Number(data.get("duration") ?? 60);
    if (!title || !scheduledAt) {
      showToast("Data ujian belum lengkap", "error", "Judul dan jadwal ujian wajib diisi.");
      return;
    }
    if (questions.length === 0) {
      showToast("Ujian belum memiliki soal", "error", "Tambahkan minimal satu soal sebelum menyimpan.");
      return;
    }
    setSaving(status);
    await addExam({
      title,
      description: String(data.get("description") ?? "Kerjakan dengan jujur dan teliti."),
      subjectId,
      classId,
      teacherId: teacher?.id ?? "tch-1",
      durationMinutes: Number.isFinite(duration) ? duration : 60,
      scheduledAt,
      status: "akan_datang",
      published: status === "published",
      questions,
    });
    setSaving(null);
    router.push(status === "published" ? "/dashboard/ujian/preview" : "/dashboard/ujian");
  }

  const totalScore = questions.reduce((sum, question) => sum + question.score, 0);

  return (
    <div>
      <Link href="/dashboard/ujian" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar ujian
      </Link>
      <PageHeader
        eyebrow="Guru · Buat ujian"
        title="Susun ujian baru"
        description="Tambahkan soal pilihan ganda dan esai, atur durasi, lalu simpan sebagai draft atau publikasikan."
        actions={
          <ButtonLink href="/dashboard/ujian/preview" variant="outline" size="sm" icon={<Eye className="h-4 w-4" />}>
            Preview Ujian
          </ButtonLink>
        }
      />

      <form id="form-ujian" className="grid gap-4 xl:grid-cols-[1.6fr_1fr]" onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-slate-900">Informasi ujian</h2>
            <div className="mt-4 space-y-3.5">
              <Field label="Judul ujian" htmlFor="exam-title" required>
                <Input id="exam-title" name="title" placeholder="Contoh: Penilaian Harian Bahasa Arab" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mata pelajaran" htmlFor="exam-subject" required>
                  <Select id="exam-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                    {state.subjects
                      .filter((subject) => (teacher ? teacher.subjectIds.includes(subject.id) : true))
                      .map((subject) => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                  </Select>
                </Field>
                <Field label="Kelas" htmlFor="exam-class" required>
                  <Select id="exam-class" value={classId} onChange={(event) => setClassId(event.target.value)}>
                    {state.classes
                      .filter((cls) => (teacher ? teacher.classIds.includes(cls.id) : true))
                      .map((cls) => (
                        <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                      ))}
                  </Select>
                </Field>
                <Field label="Durasi (menit)" htmlFor="exam-duration" required>
                  <Input id="exam-duration" name="duration" type="number" min={5} max={180} defaultValue={60} />
                </Field>
                <Field label="Jadwal mulai" htmlFor="exam-schedule" required>
                  <Input id="exam-schedule" name="scheduledAt" type="datetime-local" defaultValue="2026-11-30T08:00" />
                </Field>
              </div>
              <Field label="Deskripsi / petunjuk umum" htmlFor="exam-description">
                <Textarea id="exam-description" name="description" rows={2} defaultValue="Kerjakan dengan jujur, teliti, dan tanpa membuka catatan." />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Daftar soal</h2>
                <p className="text-xs text-slate-500">{questions.length} soal · total {totalScore} poin</p>
              </div>
              <StatusBadge status={questions.length > 0 ? "aktif" : "draft"} label={questions.length > 0 ? "Siap" : "Belum ada soal"} tone={questions.length > 0 ? "success" : "neutral"} />
            </div>

            {questions.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  title="Belum ada soal"
                  description="Tambahkan soal pertama menggunakan panel di bawah. Anda dapat mencampur pilihan ganda dan esai."
                  icon={Plus}
                />
              </div>
            ) : (
              <ol className="mt-3 space-y-2">
                {questions.map((question, index) => (
                  <li key={question.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {index + 1}. {question.text}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {question.type === "pilihan_ganda" ? "Pilihan ganda" : "Esai"} · {question.score} poin
                        </p>
                        {question.options && (
                          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                            {question.options.map((option, optionIndex) => (
                              <li key={option} className={`rounded-md px-2 py-1 text-xs ${optionIndex === question.correctIndex ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200" : "bg-slate-50 text-slate-600"}`}>
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== question.id))}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Hapus soal ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-slate-900">Tambah soal</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
              <Field label="Tipe soal" htmlFor="q-type">
                <Select id="q-type" value={type} onChange={(event) => setType(event.target.value as ExamQuestion["type"])}>
                  <option value="pilihan_ganda">Pilihan ganda</option>
                  <option value="esai">Esai</option>
                </Select>
              </Field>
              <Field label="Poin" htmlFor="q-score">
                <Input id="q-score" type="number" min={1} defaultValue={20} />
              </Field>
            </div>
            <Field label="Pertanyaan" htmlFor="q-text" className="mt-3">
              <Textarea id="q-text" rows={2} placeholder="Tuliskan pertanyaan..." />
            </Field>
            {type === "pilihan_ganda" && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <Field key={index} label={`Pilihan ${String.fromCharCode(65 + index)}`} htmlFor={`q-option-${index}`}>
                    <Input id={`q-option-${index}`} placeholder={`Jawaban ${String.fromCharCode(65 + index)}`} />
                  </Field>
                ))}
                <Field label="Jawaban benar" htmlFor="q-correct" className="sm:col-span-2">
                  <Select id="q-correct" defaultValue={0}>
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                  </Select>
                </Field>
              </div>
            )}
            <Button type="button" variant="outline" className="mt-3" icon={<Plus className="h-4 w-4" />} onClick={addQuestion}>
              Tambahkan Soal
            </Button>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">Ringkasan ujian</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Kelas</dt>
                <dd className="font-medium text-slate-800">{getClassName(state, classId)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Mata pelajaran</dt>
                <dd className="font-medium text-slate-800">{getSubjectName(state, subjectId)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Jumlah soal</dt>
                <dd className="font-medium text-slate-800">{questions.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Total poin</dt>
                <dd className="font-medium text-slate-800">{totalScore}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <Info className="h-3.5 w-3.5" aria-hidden /> Catatan demo
            </p>
            <p className="mt-1">
              Nilai pilihan ganda dihitung otomatis saat siswa mengirim jawaban. Soal esai mendapat nilai
              proporsional dan dapat disesuaikan guru pada halaman rekap.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" loading={saving === "published"} onClick={() => save("published")} icon={<Send className="h-4 w-4" />}>
              Publikasikan Ujian
            </Button>
            <Button type="button" variant="outline" loading={saving === "draft"} onClick={() => save("draft")}>
              Simpan Draft
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
