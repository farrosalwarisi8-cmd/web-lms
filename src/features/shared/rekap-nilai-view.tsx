"use client";

import { useState } from "react";
import { BarChart3, GraduationCap, Pencil } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { finalScore, getClassName, getSubjectName } from "@/lib/utils";
import type { Grade } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";

export function RekapNilaiView() {
  const { state, updateGrade } = useDemo();
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const [classId, setClassId] = useState(teacher?.classIds[0] ?? state.classes[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState("semua");
  const [editing, setEditing] = useState<Grade | null>(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    assignmentScore: 80,
    examScore: 80,
    memorizationScore: 80,
    akhlakScore: 80,
    note: "",
  });

  const students = state.students.filter((student) => student.classId === classId);
  const grades = state.grades.filter(
    (grade) =>
      students.some((student) => student.id === grade.studentId) &&
      grade.periodId === state.activePeriodId &&
      (subjectId === "semua" || grade.subjectId === subjectId)
  );
  const average =
    grades.length === 0 ? 0 : Math.round(grades.reduce((sum, grade) => sum + finalScore(grade), 0) / grades.length);
  const belowKkm = grades.filter((grade) => finalScore(grade) < 75).length;

  function openEdit(grade: Grade) {
    setEditing(grade);
    setValues({
      assignmentScore: grade.assignmentScore,
      examScore: grade.examScore,
      memorizationScore: grade.memorizationScore,
      akhlakScore: grade.akhlakScore,
      note: grade.note ?? "",
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    await updateGrade(editing.id, values);
    setSaving(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Penilaian"
        title="Rekap nilai"
        description="Tinjau nilai tugas, ujian, hafalan, dan akhlak. Perubahan nilai langsung tampil di rapor siswa."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Rata-rata kelas" value={average || "—"} hint="Empat komponen penilaian" icon={BarChart3} tone="brand" />
        <StatCard label="Nilai di bawah 75" value={belowKkm} hint="Perlu perhatian guru" icon={GraduationCap} tone={belowKkm ? "amber" : "emerald"} />
        <StatCard label="Baris nilai" value={grades.length} hint={`${students.length} santri`} icon={GraduationCap} tone="blue" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="grid gap-3 border-b border-slate-100 px-4 py-3 sm:grid-cols-2">
          <div>
            <label htmlFor="grade-class" className="label-base">Kelas</label>
            <Select id="grade-class" value={classId} onChange={(event) => setClassId(event.target.value)}>
              {state.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="grade-subject" className="label-base">Mata pelajaran</label>
            <Select id="grade-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              <option value="semua">Semua mata pelajaran</option>
              {state.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </Select>
          </div>
        </div>

        {grades.length === 0 ? (
          <EmptyState title="Belum ada nilai" description="Nilai akan muncul setelah guru menyimpan penilaian tugas atau ujian." icon={GraduationCap} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Rekap nilai siswa</caption>
              <thead>
                <tr>
                  <th scope="col">Siswa</th>
                  <th scope="col">Mapel</th>
                  <th scope="col" className="text-center">Tugas</th>
                  <th scope="col" className="text-center">Ujian</th>
                  <th scope="col" className="text-center">Hafalan</th>
                  <th scope="col" className="text-center">Akhlak</th>
                  <th scope="col" className="text-center">Akhir</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const student = state.students.find((item) => item.id === grade.studentId);
                  return (
                    <tr key={grade.id}>
                      <td>
                        <p className="font-medium text-slate-800">{student?.name}</p>
                        <p className="text-[11px] text-slate-500">Kelas {getClassName(state, student?.classId)}</p>
                      </td>
                      <td>{getSubjectName(state, grade.subjectId)}</td>
                      <td className="text-center">{grade.assignmentScore}</td>
                      <td className="text-center">{grade.examScore}</td>
                      <td className="text-center">{grade.memorizationScore}</td>
                      <td className="text-center">{grade.akhlakScore}</td>
                      <td className="text-center">
                        <span className={`font-bold ${finalScore(grade) >= 80 ? "text-emerald-700" : finalScore(grade) >= 75 ? "text-slate-800" : "text-amber-700"}`}>
                          {finalScore(grade)}
                        </span>
                      </td>
                      <td>
                        <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => openEdit(grade)}>
                          Ubah
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
          Nilai akhir = 30% tugas + 40% ujian + 20% hafalan + 10% akhlak.
        </div>
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Ubah nilai siswa" description={editing ? getSubjectName(state, editing.subjectId) : undefined}>
        {editing && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {state.students.find((item) => item.id === editing.studentId)?.name}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "assignmentScore", label: "Nilai tugas" },
                { key: "examScore", label: "Nilai ujian" },
                { key: "memorizationScore", label: "Nilai hafalan" },
                { key: "akhlakScore", label: "Nilai akhlak" },
              ].map((field) => (
                <Field key={field.key} label={field.label} htmlFor={`edit-${field.key}`}>
                  <Input
                    id={`edit-${field.key}`}
                    type="number"
                    min={0}
                    max={100}
                    value={values[field.key as keyof typeof values] as number}
                    onChange={(event) =>
                      setValues((prev) => ({ ...prev, [field.key]: Number(event.target.value) }))
                    }
                  />
                </Field>
              ))}
            </div>
            <Field label="Catatan untuk rapor" htmlFor="edit-note">
              <textarea
                id="edit-note"
                className="input-base min-h-20"
                value={values.note}
                onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
              <Button loading={saving} onClick={handleSave}>Simpan Nilai</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
