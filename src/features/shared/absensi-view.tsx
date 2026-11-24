"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Save,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  attendanceSummary,
  formatDate,
  getClassName,
  getSubjectName,
} from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";

const statusOptions: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: "hadir", label: "Hadir", active: "bg-emerald-600 text-white" },
  { value: "izin", label: "Izin", active: "bg-blue-600 text-white" },
  { value: "sakit", label: "Sakit", active: "bg-amber-500 text-white" },
  { value: "alpa", label: "Alpa", active: "bg-rose-600 text-white" },
];

export function AbsensiView() {
  const { state, saveAttendance } = useDemo();
  const role = state.activeRole;
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const student = state.students.find((item) => item.id === state.activeChildId);
  const canEdit = role === "guru";
  const isStudentView = role === "siswa" || role === "orang_tua";

  const [classId, setClassId] = useState(teacher?.classIds[0] ?? state.classes[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState(teacher?.subjectIds[0] ?? state.subjects[0]?.id ?? "");
  const [date, setDate] = useState("2026-11-24");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [historySubject, setHistorySubject] = useState("semua");

  const classStudents = state.students.filter((item) => item.classId === classId);
  const existing = state.attendance.filter(
    (record) => record.classId === classId && record.subjectId === subjectId && record.date === date
  );

  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    classStudents.forEach((item) => {
      const record = existing.find((entry) => entry.studentId === item.id);
      map[item.id] = record?.status ?? "hadir";
    });
    setStatuses(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId, date, state.attendance.length]);

  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return {
      hadir: values.filter((value) => value === "hadir").length,
      izin: values.filter((value) => value === "izin").length,
      sakit: values.filter((value) => value === "sakit").length,
      alpa: values.filter((value) => value === "alpa").length,
    };
  }, [statuses]);

  async function handleSave() {
    setSaving(true);
    await saveAttendance(
      classStudents.map((item) => ({
        date,
        classId,
        subjectId,
        studentId: item.id,
        status: statuses[item.id] ?? "hadir",
        periodId: state.activePeriodId,
        note: statuses[item.id] === "izin" ? "Izin tercatat oleh guru" : undefined,
      }))
    );
    setSaving(false);
  }

  if (isStudentView && student) {
    const records = state.attendance
      .filter((record) => record.studentId === student.id)
      .filter((record) => historySubject === "semua" || record.subjectId === historySubject)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
    const summary = attendanceSummary(
      state.attendance.filter((record) => record.studentId === student.id)
    );

    return (
      <div>
        <PageHeader
          eyebrow={`${student.name} · Kehadiran`}
          title="Absensi"
          description="Rekap kehadiran per mata pelajaran pada semester ganjil. Kehadiran dihitung dari pertemuan yang tercatat."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Persentase hadir" value={`${summary.percentage}%`} hint={`${summary.hadir} dari ${summary.total} pertemuan`} icon={UserCheck} tone={summary.percentage >= 90 ? "emerald" : "amber"} />
          <StatCard label="Izin" value={summary.izin} hint="Dengan keterangan" icon={Clock} tone="blue" />
          <StatCard label="Sakit" value={summary.sakit} hint="Dengan surat/keterangan" icon={CalendarCheck} tone="amber" />
          <StatCard label="Alpa" value={summary.alpa} hint="Tanpa keterangan" icon={XCircle} tone="rose" />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold text-slate-900">Riwayat kehadiran</h2>
            <div className="w-full sm:w-56">
              <label htmlFor="history-subject" className="sr-only">Filter mata pelajaran</label>
              <Select id="history-subject" value={historySubject} onChange={(event) => setHistorySubject(event.target.value)}>
                <option value="semua">Semua mata pelajaran</option>
                {state.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </div>
          </div>
          {records.length === 0 ? (
            <EmptyState title="Belum ada catatan" description="Belum ada absensi pada mata pelajaran yang dipilih." icon={CalendarCheck} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {records.map((record) => (
                <li key={record.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{formatDate(record.date)}</p>
                    <p className="text-xs text-slate-500">{getSubjectName(state, record.subjectId)}</p>
                    {record.note && <p className="text-[11px] text-slate-400">{record.note}</p>}
                  </div>
                  <StatusBadge status={record.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Wali dan siswa hanya dapat melihat data. Perubahan absensi dilakukan oleh guru.
        </p>
      </div>
    );
  }

  if (!canEdit) {
    const classList = role === "super_admin" || role === "admin_akademik" ? state.classes : state.classes;
    return (
      <div>
        <PageHeader
          eyebrow="Rekap kehadiran"
          title="Absensi kelas"
          description="Pantau persentase kehadiran santri per kelas. Data berasal dari absensi yang disimpan guru."
        />
        <div className="space-y-4">
          {classList.map((cls) => {
            const studentsInClass = state.students.filter((item) => item.classId === cls.id);
            return (
              <SectionCard key={cls.id} title={`Kelas ${cls.name}`} description={`${studentsInClass.length} santri · ${cls.room}`}>
                <ul className="divide-y divide-slate-100">
                  {studentsInClass.map((item) => {
                    const summary = attendanceSummary(
                      state.attendance.filter((record) => record.studentId === item.id)
                    );
                    return (
                      <li key={item.id} className="flex items-center justify-between gap-2 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {summary.hadir} hadir · {summary.izin} izin · {summary.sakit} sakit · {summary.alpa} alpa
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${summary.percentage >= 90 ? "text-emerald-700" : summary.percentage >= 80 ? "text-amber-700" : "text-rose-700"}`}>
                          {summary.percentage}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </SectionCard>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={`Absensi · ${getClassName(state, classId)}`}
        title="Isi absensi kelas"
        description="Pilih kelas, mata pelajaran, dan tanggal. Simpan untuk memperbarui rekap wali dan siswa."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setStatuses(
                Object.fromEntries(classStudents.map((item) => [item.id, "hadir"])) as Record<
                  string,
                  AttendanceStatus
                >
              )
            }
          >
            Tandai Semua Hadir
          </Button>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Kelas" htmlFor="attendance-class">
            <Select id="attendance-class" value={classId} onChange={(event) => setClassId(event.target.value)}>
              {state.classes
                .filter((cls) => (teacher ? teacher.classIds.includes(cls.id) : true))
                .map((cls) => (
                  <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                ))}
            </Select>
          </Field>
          <Field label="Mata pelajaran" htmlFor="attendance-subject">
            <Select id="attendance-subject" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
              {state.subjects
                .filter((subject) => (teacher ? teacher.subjectIds.includes(subject.id) : true))
                .map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
            </Select>
          </Field>
          <Field label="Tanggal" htmlFor="attendance-date">
            <Input id="attendance-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {existing.length > 0
            ? `Absensi untuk kelas, mapel, dan tanggal ini sudah pernah disimpan. Perubahan akan menimpa data lama.`
            : "Belum ada absensi tersimpan untuk kombinasi ini."}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Hadir", value: counts.hadir, tone: "text-emerald-700" },
          { label: "Izin", value: counts.izin, tone: "text-blue-700" },
          { label: "Sakit", value: counts.sakit, tone: "text-amber-700" },
          { label: "Alpa", value: counts.alpa, tone: "text-rose-700" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-[11px] text-slate-500">{item.label}</p>
            <p className={`text-lg font-bold ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Users className="h-4 w-4 text-brand-700" aria-hidden />
            Daftar santri
          </h2>
          <span className="text-xs text-slate-500">{classStudents.length} santri</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {classStudents.map((item) => (
            <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-[11px] text-slate-500">NIS {item.nis}</p>
              </div>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Status kehadiran ${item.name}`}>
                {statusOptions.map((option) => {
                  const active = (statuses[item.id] ?? "hadir") === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatuses((prev) => ({ ...prev, [item.id]: option.value }))}
                      aria-pressed={active}
                      className={`min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                        active ? `${option.active} ring-transparent` : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden /> {formatDate(date)} · {getSubjectName(state, subjectId)}
          </p>
          <Button onClick={handleSave} loading={saving} icon={<Save className="h-4 w-4" />}>
            Simpan Absensi
          </Button>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Setelah disimpan, wali dan siswa langsung melihat rekap terbaru.
      </p>
    </div>
  );
}
