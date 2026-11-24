"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Eye, FileQuestion, PlayCircle, Plus, Send, Timer } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { findAttempt, formatDateTime, getClassName, getSubjectName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export function UjianView() {
  const { state, publishExam } = useDemo();
  const router = useRouter();
  const role = state.activeRole;
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const student = state.students.find((item) => item.id === state.activeChildId);
  const [tab, setTab] = useState("semua");
  const [search, setSearch] = useState("");

  const scoped = useMemo(() => {
    let items = state.exams;
    if (role === "guru" && teacher) items = items.filter((exam) => exam.teacherId === teacher.id);
    if (role === "siswa" || role === "orang_tua") {
      items = items.filter(
        (exam) => exam.classId === student?.classId && exam.published
      );
    }
    if (tab === "aktif") items = items.filter((exam) => exam.published && exam.status === "aktif");
    if (tab === "akan_datang") items = items.filter((exam) => exam.published && exam.status === "akan_datang");
    if (tab === "selesai") items = items.filter((exam) => exam.status === "ditutup");
    if (tab === "draft") items = items.filter((exam) => !exam.published);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (exam) =>
          exam.title.toLowerCase().includes(q) ||
          getSubjectName(state, exam.subjectId).toLowerCase().includes(q)
      );
    }
    return items;
  }, [state, role, teacher, student?.classId, tab, search]);

  return (
    <div>
      <PageHeader
        eyebrow={role === "orang_tua" ? `${student?.name ?? "Anak"} · Ujian` : "Ujian & penilaian"}
        title="Ujian"
        description={
          role === "guru"
            ? "Buat ujian, preview soal, publikasikan, dan pantau hasil siswa."
            : "Lihat jadwal ujian, kerjakan ujian aktif, dan baca hasil yang sudah dinilai."
        }
        actions={
          role === "guru" ? (
            <>
              <ButtonLink href="/dashboard/ujian/rekap" variant="outline" size="sm">
                Rekap Ujian
              </ButtonLink>
              <ButtonLink href="/dashboard/ujian/buat" size="sm" icon={<Plus className="h-4 w-4" />}>
                Buat Ujian
              </ButtonLink>
            </>
          ) : role === "siswa" ? (
            <ButtonLink href="/dashboard/ujian/kerjakan" size="sm" icon={<PlayCircle className="h-4 w-4" />}>
              Kerjakan Ujian
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Cari ujian atau mata pelajaran..."
          right={
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "semua", label: "Semua" },
                { value: "aktif", label: "Aktif" },
                { value: "akan_datang", label: "Akan datang" },
                ...(role === "guru" ? [{ value: "draft", label: "Draft" }] : []),
                { value: "selesai", label: "Selesai" },
              ]}
            />
          }
        />

        {scoped.length === 0 ? (
          <EmptyState
            icon={FileQuestion}
            title="Belum ada ujian pada filter ini"
            description={
              role === "guru"
                ? "Buat ujian baru, tambahkan soal, lalu publikasikan ke kelas."
                : "Guru belum menjadwalkan ujian untuk kelas ini pada filter tersebut."
            }
            action={
              role === "guru" ? (
                <ButtonLink href="/dashboard/ujian/buat" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Buat ujian
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {scoped.map((exam) => {
              const attempt = student ? findAttempt(state, exam.id, student.id) : undefined;
              const displayStatus = !exam.published
                ? "draft"
                : role === "siswa" || role === "orang_tua"
                  ? attempt?.status ?? exam.status
                  : exam.status;
              const attempts = state.examAttempts.filter((item) => item.examId === exam.id);
              return (
                <li key={exam.id} className="px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{exam.title}</h2>
                        <StatusBadge status={displayStatus} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{exam.description}</p>
                      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>{getSubjectName(state, exam.subjectId)}</span>
                        <span>Kelas {getClassName(state, exam.classId)}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden /> {exam.durationMinutes} menit
                        </span>
                        <span>{formatDateTime(exam.scheduledAt)}</span>
                        <span>{exam.questions.length} soal</span>
                        {role === "guru" && <span>{attempts.length} peserta mengerjakan</span>}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {role === "guru" && (
                        <>
                          <ButtonLink href="/dashboard/ujian/preview" size="sm" variant="outline" icon={<Eye className="h-4 w-4" />}>
                            Preview
                          </ButtonLink>
                          {!exam.published && (
                            <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => publishExam(exam.id)}>
                              Publikasikan
                            </Button>
                          )}
                          <ButtonLink href="/dashboard/ujian/rekap" size="sm" variant="outline">
                            Rekap
                          </ButtonLink>
                        </>
                      )}
                      {role === "siswa" && (
                        <>
                          {exam.status === "aktif" && (!attempt || attempt.status === "mengerjakan") && (
                            <Button
                              size="sm"
                              icon={<Timer className="h-4 w-4" />}
                              onClick={() => router.push(`/dashboard/ujian/kerjakan?exam=${exam.id}`)}
                            >
                              {attempt ? "Lanjutkan" : "Mulai Ujian"}
                            </Button>
                          )}
                          {attempt?.status === "dinilai" && (
                            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                              Nilai {attempt.score}
                            </span>
                          )}
                        </>
                      )}
                      {role === "orang_tua" && (
                        <span className="text-xs text-slate-500">
                          {attempt?.status === "dinilai" ? `Nilai ${attempt.score}` : "Belum ada nilai"}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {role === "guru" && (
        <p className="mt-3 text-xs text-slate-500">
          Ujian yang dipublikasikan langsung berstatus aktif pada demo agar dapat dicoba siswa.
        </p>
      )}
    </div>
  );
}
