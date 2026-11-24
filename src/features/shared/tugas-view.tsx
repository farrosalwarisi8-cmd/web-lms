"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, Eye, Plus, Send, Upload } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  daysUntil,
  formatDate,
  getClassName,
  getSubjectName,
} from "@/lib/utils";
import type { Submission, Task } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { Field, Textarea } from "@/components/ui/form";
import { useRouter } from "next/navigation";

export function TugasView() {
  const { state, saveTaskDraft, submitTask, gradeSubmission, publishTask } = useDemo();
  const router = useRouter();
  const role = state.activeRole;
  const canGrade = role === "guru";
  const canSubmit = role === "siswa";
  const [tab, setTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Task | null>(null);
  const [grading, setGrading] = useState<Submission | null>(null);
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [score, setScore] = useState("85");
  const [feedback, setFeedback] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  const student = state.students.find((item) => item.id === state.activeChildId);
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);

  const scoped = useMemo(() => {
    let items = state.tasks;
    if (role === "guru" && teacher) {
      items = items.filter((task) => task.teacherId === teacher.id);
    } else if (role === "siswa" || role === "orang_tua") {
      items = items.filter(
        (task) => task.classId === student?.classId && task.status === "published"
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          getSubjectName(state, task.subjectId).toLowerCase().includes(q)
      );
    }
    return items;
  }, [state, role, teacher, student?.classId, search]);

  const filtered = useMemo(() => {
    if (tab === "semua") return scoped;
    if (tab === "draft") return scoped.filter((task) => task.status === "draft");
    if (tab === "belum")
      return scoped.filter((task) => {
        const submission = state.submissions.find(
          (item) => item.taskId === task.id && item.studentId === student?.id
        );
        return !submission || submission.status === "draft" || submission.status === "perlu_revisi";
      });
    return scoped;
  }, [scoped, tab, state.submissions, student?.id]);

  const submissionsFor = (taskId: string) =>
    state.submissions.filter((submission) => submission.taskId === taskId);

  function openStudentTask(task: Task) {
    const submission = state.submissions.find(
      (item) => item.taskId === task.id && item.studentId === student?.id
    );
    setDetail(task);
    setContent(submission?.content ?? "");
    setFileName(submission?.fileName ?? "");
  }

  async function handleSaveDraft() {
    if (!detail || !student) return;
    setSavingDraft(true);
    await saveTaskDraft(detail.id, student.id, content);
    setSavingDraft(false);
  }

  async function handleSubmit() {
    if (!detail || !student) return;
    setSubmitting(true);
    await submitTask(detail.id, student.id, content, fileName || undefined);
    setSubmitting(false);
    setConfirmOpen(false);
    setDetail(null);
  }

  function openGrading(submission: Submission) {
    setGrading(submission);
    setScore(submission.score?.toString() ?? "85");
    setFeedback(submission.feedback ?? "");
  }

  async function handleGrade() {
    if (!grading) return;
    const numeric = Number(score);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) return;
    setSavingGrade(true);
    await gradeSubmission(grading.id, numeric, feedback);
    setSavingGrade(false);
    setGrading(null);
  }

  const tabs = [
    { value: "semua", label: "Semua" },
    ...(canSubmit ? [{ value: "belum", label: "Belum selesai" }] : []),
    ...(canGrade ? [{ value: "draft", label: "Draft" }] : []),
  ];

  return (
    <div>
      <PageHeader
        eyebrow={role === "orang_tua" ? `${student?.name ?? "Anak"} · Tugas` : "Tugas pembelajaran"}
        title="Tugas"
        description={
          canGrade
            ? "Pantau pengumpulan, beri nilai, dan kirim feedback untuk setiap tugas."
            : canSubmit
              ? "Kerjakan tugas, simpan draft, lalu kirim sebelum tenggat."
              : "Lihat status tugas dan nilai anak yang sedang dipantau."
        }
        actions={
          canGrade ? (
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => router.push("/dashboard/tugas/buat")}>
              Buat Tugas
            </Button>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Cari tugas atau mata pelajaran..." right={<Tabs value={tab} onChange={setTab} items={tabs} />} />

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Tidak ada tugas pada filter ini"
            description={
              canGrade
                ? "Buat tugas baru atau ubah filter untuk melihat tugas lain."
                : "Belum ada tugas yang cocok. Coba ubah filter atau periksa kembali nanti."
            }
            action={
              canGrade ? (
                <ButtonLink href="/dashboard/tugas/buat" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Buat tugas
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((task) => {
              const submission = state.submissions.find(
                (item) => item.taskId === task.id && item.studentId === student?.id
              );
              const taskSubmissions = submissionsFor(task.id);
              const ungraded = taskSubmissions.filter(
                (item) => item.status === "terkirim" || item.status === "terlambat"
              );
              const status = canSubmit || role === "orang_tua" ? submission?.status ?? "belum" : task.status;
              const late = daysUntil(task.deadline) < 0;
              return (
                <li key={task.id} className="px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{task.title}</h2>
                        <StatusBadge status={status} />
                        {ungraded.length > 0 && canGrade && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                            {ungraded.length} belum dinilai
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{getSubjectName(state, task.subjectId)}</span>
                        <span>Kelas {getClassName(state, task.classId)}</span>
                        <span className={late ? "font-medium text-rose-600" : ""}>Tenggat {formatDate(task.deadline)}</span>
                        <span>Nilai maks {task.maxScore}</span>
                        {canGrade && <span>{taskSubmissions.length} pengumpulan</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {canSubmit ? (
                        <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => openStudentTask(task)}>
                          {submission?.status === "dinilai" ? "Lihat Hasil" : "Buka Tugas"}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => setDetail(task)}>
                          Detail
                        </Button>
                      )}
                      {canGrade && task.status === "draft" && (
                        <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => publishTask(task.id)}>
                          Publikasikan
                        </Button>
                      )}
                    </div>
                  </div>

                  {canGrade && taskSubmissions.length > 0 && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <p className="border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Pengumpulan siswa
                      </p>
                      <ul className="divide-y divide-slate-200">
                        {taskSubmissions.map((item) => {
                          const taskStudent = state.students.find((s) => s.id === item.studentId);
                          return (
                            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-800">{taskStudent?.name}</p>
                                <p className="text-[11px] text-slate-500">
                                  {formatDate(item.submittedAt)} {item.fileName ? `· ${item.fileName}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={item.status} />
                                {item.score !== undefined && <span className="text-xs font-bold text-slate-800">{item.score}</span>}
                                {item.status !== "draft" && (
                                  <Button size="sm" variant="outline" onClick={() => openGrading(item)}>
                                    {item.status === "dinilai" ? "Ubah nilai" : "Nilai"}
                                  </Button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={Boolean(detail) && !grading}
        onClose={() => setDetail(null)}
        title={detail?.title ?? "Detail tugas"}
        description={detail ? `${getSubjectName(state, detail.subjectId)} · Kelas ${getClassName(state, detail.classId)}` : undefined}
        size="lg"
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p><strong className="text-slate-800">Tenggat:</strong> {formatDate(detail.deadline)}</p>
              <p><strong className="text-slate-800">Nilai maksimal:</strong> {detail.maxScore}</p>
              <p><strong className="text-slate-800">Revisi:</strong> {detail.allowRevision ? "Diperbolehkan" : "Tidak diperbolehkan"}</p>
              {detail.attachmentName && <p><strong className="text-slate-800">Lampiran:</strong> {detail.attachmentName}</p>}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instruksi</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{detail.instructions}</p>
            </div>

            {canSubmit && (
              <>
                {(() => {
                  const submission = state.submissions.find(
                    (item) => item.taskId === detail.id && item.studentId === student?.id
                  );
                  if (submission?.status === "dinilai") {
                    return (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                          <CheckCircle2 className="h-4 w-4" aria-hidden /> Sudah dinilai: {submission.score}
                        </p>
                        <p className="mt-1 text-xs text-emerald-800">{submission.feedback}</p>
                      </div>
                    );
                  }
                  return (
                    <>
                      {submission?.status === "perlu_revisi" && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                          <strong>Perlu revisi:</strong> {submission.feedback}
                        </div>
                      )}
                      <Field label="Jawaban / catatan tugas" htmlFor="task-content" hint="Ketik jawaban singkat atau ringkasan pekerjaan Anda.">
                        <Textarea id="task-content" value={content} onChange={(event) => setContent(event.target.value)} rows={4} />
                      </Field>
                      <MockFileUpload
                        label="Lampiran tugas"
                        value={fileName || undefined}
                        onChange={(name) => setFileName(name ?? "")}
                        hint="Foto hasil pekerjaan atau rekaman, simulasi lokal."
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" loading={savingDraft} onClick={handleSaveDraft}>
                          Simpan Draft
                        </Button>
                        <Button
                          icon={<Upload className="h-4 w-4" />}
                          onClick={() => {
                            if (!content.trim() && !fileName) return;
                            setConfirmOpen(true);
                          }}
                          disabled={!content.trim() && !fileName}
                        >
                          Kirim Tugas
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            {!canSubmit && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetail(null)}>Tutup</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Kirim tugas sekarang?"
        description="Setelah dikirim, guru dapat melihat dan menilai pekerjaan Anda. Pastikan jawaban dan lampiran sudah benar."
        confirmLabel="Ya, Kirim Tugas"
        loading={submitting}
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      <Modal
        open={Boolean(grading)}
        onClose={() => setGrading(null)}
        title="Beri nilai pengumpulan"
        description={grading ? state.students.find((item) => item.id === grading.studentId)?.name : undefined}
        size="md"
      >
        {grading && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {grading.content || "Siswa tidak menulis catatan."}
              {grading.fileName && <p className="mt-1 text-xs text-brand-700">Lampiran: {grading.fileName}</p>}
            </div>
            <Field label="Nilai (0–100)" htmlFor="grade-score" required>
              <input
                id="grade-score"
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(event) => setScore(event.target.value)}
                className="input-base"
              />
            </Field>
            <Field label="Feedback untuk siswa" htmlFor="grade-feedback">
              <Textarea id="grade-feedback" rows={3} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tuliskan apresiasi dan saran perbaikan..." />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGrading(null)}>Batal</Button>
              <Button loading={savingGrade} onClick={handleGrade}>Simpan Penilaian</Button>
            </div>
          </div>
        )}
      </Modal>

      {role === "orang_tua" && (
        <p className="mt-3 text-xs text-slate-500">
          Wali hanya dapat melihat status pekerjaan anak.{" "}
          <Link href="/dashboard/berkas" className="font-medium text-brand-700 hover:underline">
            Ingatkan anak untuk mengumpulkan tugas.
          </Link>
        </p>
      )}
    </div>
  );
}
