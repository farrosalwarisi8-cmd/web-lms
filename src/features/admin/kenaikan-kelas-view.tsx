"use client";

import { useState } from "react";
import { ArrowRight, GraduationCap, Info, TrendingUp } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { finalScore, getClassName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function KenaikanKelasView() {
  const { state, promoteStudents } = useDemo();
  const [sourceClassId, setSourceClassId] = useState("cls-7a");
  const [targetClassId, setTargetClassId] = useState("cls-8a");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const students = state.students.filter((student) => student.classId === sourceClassId);
  const targetOptions = state.classes.filter((cls) => cls.id !== sourceClassId);
  const average = (studentId: string) => {
    const grades = state.grades.filter((grade) => grade.studentId === studentId);
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((sum, grade) => sum + finalScore(grade), 0) / grades.length);
  };

  async function promote() {
    setProcessing(true);
    await promoteStudents(selected, targetClassId);
    setProcessing(false);
    setConfirmOpen(false);
    setSelected([]);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Akademik · Kenaikan kelas"
        title="Proses kenaikan kelas"
        description="Pindahkan santri terpilih ke kelas berikutnya di akhir semester. Data demo diperbarui langsung."
        actions={
          <Button
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={selected.length === 0}
            icon={<TrendingUp className="h-4 w-4" />}
          >
            Proses Kenaikan ({selected.length})
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Santri kelas asal" value={students.length} hint={getClassName(state, sourceClassId)} icon={GraduationCap} tone="blue" />
        <StatCard label="Dipilih" value={selected.length} hint="Akan dipindahkan" icon={TrendingUp} tone="brand" />
        <StatCard label="Kelas tujuan" value={getClassName(state, targetClassId)} hint="Tujuan perpindahan" icon={GraduationCap} tone="emerald" />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div>
            <label htmlFor="source-class" className="label-base">Kelas asal</label>
            <Select id="source-class" value={sourceClassId} onChange={(event) => { setSourceClassId(event.target.value); setSelected([]); }}>
              {state.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
              ))}
            </Select>
          </div>
          <div className="hidden pb-3 sm:block" aria-hidden>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <label htmlFor="target-class" className="label-base">Kelas tujuan</label>
            <Select id="target-class" value={targetClassId} onChange={(event) => setTargetClassId(event.target.value)}>
              {targetOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Rekomendasi naik kelas memakai rata-rata nilai akhir. Anda tetap dapat memilih santri secara manual.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Santri kelas asal</h2>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={selected.length === students.length && students.length > 0}
              onChange={(event) => setSelected(event.target.checked ? students.map((student) => student.id) : [])}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Pilih semua
          </label>
        </div>
        {students.length === 0 ? (
          <EmptyState title="Tidak ada santri" description="Kelas asal belum memiliki santri." icon={GraduationCap} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {students.map((student) => {
              const avg = average(student.id);
              const recommendation = avg >= 75;
              return (
                <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <label className="flex min-h-10 flex-1 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(student.id)}
                      onChange={(event) =>
                        setSelected((prev) =>
                          event.target.checked ? [...prev, student.id] : prev.filter((id) => id !== student.id)
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{student.name}</span>
                      <span className="block text-[11px] text-slate-500">
                        NIS {student.nis} · rata-rata {avg || "—"}
                      </span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={recommendation ? "naik kelas" : "tinggal kelas"}
                      label={recommendation ? "Rekomendasi naik" : "Perlu tinjauan"}
                    />
                    <span className="text-xs text-slate-400">→ Kelas {getClassName(state, targetClassId)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Proses kenaikan kelas?"
        description={`${selected.length} santri akan dipindahkan dari kelas ${getClassName(state, sourceClassId)} ke kelas ${getClassName(state, targetClassId)} pada data demo.`}
        confirmLabel="Ya, Pindahkan"
        loading={processing}
        onConfirm={promote}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
