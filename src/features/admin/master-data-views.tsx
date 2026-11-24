"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, Layers, Pencil, Plus, School, Search, Trash2, UserCog, Users } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, getClassName, getSubjectName } from "@/lib/utils";
import type { Student, Teacher } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select, Field, Input } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { SectionCard } from "@/components/ui/section-card";

export function SiswaView() {
  const { state, addStudent, updateStudent, deleteStudent, showToast } = useDemo();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("semua");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  const students = useMemo(() => {
    let items = state.students;
    if (classFilter !== "semua") items = items.filter((student) => student.classId === classFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (student) =>
          student.name.toLowerCase().includes(q) ||
          student.nis.toLowerCase().includes(q) ||
          state.parents.find((parent) => parent.id === student.parentId)?.name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [state.students, state.parents, classFilter, search]);

  async function handleAdd(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return showToast("Nama siswa wajib diisi", "error");
    setSaving(true);
    await addStudent({
      name,
      classId: String(formData.get("classId") ?? state.classes[0]?.id ?? ""),
      gender: String(formData.get("gender")) === "putri" ? "putri" : "putra",
      parentName: String(formData.get("parentName") ?? "Wali Baru"),
      parentPhone: String(formData.get("parentPhone") ?? "0800000000"),
      address: String(formData.get("address") ?? "Alamat demo"),
      birthDate: String(formData.get("birthDate") ?? "2013-01-01"),
    });
    setSaving(false);
    setAddOpen(false);
  }

  async function handleEdit(formData: FormData) {
    if (!editing) return;
    setSaving(true);
    await updateStudent(editing.id, {
      name: String(formData.get("name") ?? editing.name),
      classId: String(formData.get("classId") ?? editing.classId),
      address: String(formData.get("address") ?? editing.address),
      status: String(formData.get("status")) === "nonaktif" ? "nonaktif" : "aktif",
    });
    setSaving(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data master · Siswa"
        title="Data siswa"
        description="Kelola data santri, kelas, wali, dan status aktif. Perubahan tersimpan di state demo."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Siswa</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total siswa" value={state.students.length} hint={`${state.classes.length} kelas`} icon={Users} tone="blue" />
        <StatCard label="Siswa aktif" value={state.students.filter((student) => student.status === "aktif").length} hint="Dapat mengikuti pembelajaran" icon={Users} tone="emerald" />
        <StatCard label="Kelas 9" value={state.students.filter((student) => student.classId === "cls-9a").length} hint="Calon peserta kenaikan" icon={School} tone="brand" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Cari nama, NIS, atau wali...">
          <div className="w-full sm:w-44">
            <Select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} aria-label="Filter kelas">
              <option value="semua">Semua kelas</option>
              {state.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
              ))}
            </Select>
          </div>
        </FilterBar>

        {students.length === 0 ? (
          <EmptyState icon={Search} title="Siswa tidak ditemukan" description="Ubah kata kunci atau filter kelas, atau tambahkan siswa baru." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Data siswa</caption>
              <thead>
                <tr>
                  <th scope="col">Siswa</th>
                  <th scope="col">Kelas</th>
                  <th scope="col">Wali</th>
                  <th scope="col">Status</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const parent = state.parents.find((item) => item.id === student.parentId);
                  return (
                    <tr key={student.id}>
                      <td>
                        <p className="font-medium text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-slate-500">NIS {student.nis} · {student.gender}</p>
                      </td>
                      <td>{getClassName(state, student.classId)}</td>
                      <td>
                        <p className="text-sm">{parent?.name}</p>
                        <p className="text-[11px] text-slate-500">{parent?.phone}</p>
                      </td>
                      <td><StatusBadge status={student.status} /></td>
                      <td>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(student)}>
                            Ubah
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setDeleting(student)} aria-label={`Hapus ${student.name}`}>
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah siswa baru" description="Data wali baru akan dibuat otomatis pada demo.">
        <form action={handleAdd} className="space-y-3">
          <Field label="Nama lengkap" htmlFor="new-student-name" required>
            <Input id="new-student-name" name="name" placeholder="Nama santri" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kelas" htmlFor="new-student-class">
              <Select id="new-student-class" name="classId" defaultValue={state.classes[0]?.id}>
                {state.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Jenis kelamin" htmlFor="new-student-gender">
              <Select id="new-student-gender" name="gender" defaultValue="putra">
                <option value="putra">Putra</option>
                <option value="putri">Putri</option>
              </Select>
            </Field>
            <Field label="Nama wali" htmlFor="new-student-parent">
              <Input id="new-student-parent" name="parentName" placeholder="Nama orang tua/wali" />
            </Field>
            <Field label="Telepon wali" htmlFor="new-student-phone">
              <Input id="new-student-phone" name="parentPhone" placeholder="08xxxxxxxxxx" />
            </Field>
            <Field label="Tanggal lahir" htmlFor="new-student-birth">
              <Input id="new-student-birth" name="birthDate" type="date" defaultValue="2013-01-01" />
            </Field>
            <Field label="Alamat" htmlFor="new-student-address">
              <Input id="new-student-address" name="address" placeholder="Alamat demo" />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Siswa</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Ubah data siswa" description={editing?.name}>
        {editing && (
          <form action={handleEdit} className="space-y-3">
            <Field label="Nama lengkap" htmlFor="edit-student-name">
              <Input id="edit-student-name" name="name" defaultValue={editing.name} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Kelas" htmlFor="edit-student-class">
                <Select id="edit-student-class" name="classId" defaultValue={editing.classId}>
                  {state.classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" htmlFor="edit-student-status">
                <Select id="edit-student-status" name="status" defaultValue={editing.status}>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </Select>
              </Field>
            </div>
            <Field label="Alamat" htmlFor="edit-student-address">
              <Input id="edit-student-address" name="address" defaultValue={editing.address} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Batal</Button>
              <Button type="submit" loading={saving}>Simpan Perubahan</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus data siswa?"
        description={`${deleting?.name ?? ""} akan dihapus dari data demo. Tindakan ini hanya memengaruhi state lokal.`}
        confirmLabel="Hapus"
        tone="danger"
        onConfirm={async () => {
          if (deleting) await deleteStudent(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

export function GuruView() {
  const { state, addTeacher, updateTeacher, showToast } = useDemo();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const teachers = state.teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return showToast("Nama guru wajib diisi", "error");
    setSaving(true);
    await addTeacher({
      name,
      email: String(formData.get("email") ?? "guru.baru@demo.local"),
      phone: String(formData.get("phone") ?? "0800000000"),
      subjectIds: [String(formData.get("subjectId") ?? state.subjects[0]?.id)],
      classIds: [String(formData.get("classId") ?? state.classes[0]?.id)],
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data master · Guru"
        title="Data guru"
        description="Kelola pengajar, kontak, mata pelajaran, dan kelas yang diampu."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Guru</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Total guru" value={state.teachers.length} hint="Diniyah dan umum" icon={UserCog} tone="brand" />
        <StatCard label="Guru aktif" value={state.teachers.filter((teacher) => teacher.status === "aktif").length} hint="Dapat mengelola kelas" icon={UserCog} tone="emerald" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Cari nama guru..." />
        {teachers.length === 0 ? (
          <EmptyState icon={Search} title="Guru tidak ditemukan" description="Coba kata kunci lain atau tambahkan guru baru." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <li key={teacher.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{teacher.name}</p>
                    <StatusBadge status={teacher.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {teacher.nip} · {teacher.email} · {teacher.phone}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Mapel: {teacher.subjectIds.map((id) => getSubjectName(state, id)).join(", ")} · Kelas:{" "}
                    {teacher.classIds.map((id) => getClassName(state, id)).join(", ")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTeacher(teacher.id, { status: teacher.status === "aktif" ? "nonaktif" : "aktif" })}
                >
                  {teacher.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah guru baru">
        <form action={handleAdd} className="space-y-3">
          <Field label="Nama lengkap" htmlFor="new-teacher-name" required>
            <Input id="new-teacher-name" name="name" placeholder="Nama guru" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email" htmlFor="new-teacher-email">
              <Input id="new-teacher-email" name="email" type="email" placeholder="guru@demo.local" />
            </Field>
            <Field label="Telepon" htmlFor="new-teacher-phone">
              <Input id="new-teacher-phone" name="phone" placeholder="08xxxxxxxxxx" />
            </Field>
            <Field label="Mata pelajaran" htmlFor="new-teacher-subject">
              <Select id="new-teacher-subject" name="subjectId">
                {state.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Kelas" htmlFor="new-teacher-class">
              <Select id="new-teacher-class" name="classId">
                {state.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Guru</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function JenjangView() {
  const { state, addJenjang, showToast } = useDemo();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return showToast("Nama jenjang wajib diisi", "error");
    setSaving(true);
    await addJenjang({
      name,
      description: String(formData.get("description") ?? ""),
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data master · Jenjang"
        title="Data jenjang"
        description="Kelola jenjang pendidikan. Jenjang yang ditambahkan langsung muncul di form tambah kelas."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Jenjang</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total jenjang" value={state.jenjang.length} hint="Jenjang pendidikan aktif" icon={Layers} tone="brand" />
        <StatCard label="Total kelas" value={state.classes.length} hint="Terhubung ke jenjang" icon={School} tone="blue" />
        <StatCard label="Total siswa" value={state.students.length} hint="Seluruh jenjang" icon={Users} tone="emerald" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {state.jenjang.map((item) => {
          const classIds = state.classes.filter((cls) => cls.jenjangId === item.id).map((cls) => cls.id);
          const classCount = classIds.length;
          const studentCount = state.students.filter((student) => classIds.includes(student.classId)).length;
          return (
            <SectionCard key={item.id} title={item.name} description={item.description} icon={<Layers className="h-4 w-4" />}>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Kelas</span>
                  <span className="font-semibold text-slate-800">{classCount}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Siswa</span>
                  <span className="font-semibold text-slate-800">{studentCount}</span>
                </div>
              </div>
              <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                {classCount === 0
                  ? "Belum ada kelas pada jenjang ini."
                  : state.classes.filter((cls) => cls.jenjangId === item.id).map((cls) => `Kelas ${cls.name}`).join(", ")}
              </p>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard title="Catatan demo" description="Jenjang terhubung ke data kelas." className="mt-4">
        <p className="text-xs text-slate-600">
          Setelah menambah jenjang di halaman ini, buka <strong>Tambah Kelas</strong>. Jenjang baru otomatis tersedia
          di pilihan jenjang tanpa perlu mengubah kode.
        </p>
      </SectionCard>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah jenjang baru" description="Jenjang akan langsung tersedia pada form tambah kelas.">
        <form action={handleAdd} className="space-y-3">
          <Field label="Nama jenjang" htmlFor="new-jenjang-name" required>
            <Input id="new-jenjang-name" name="name" placeholder="Contoh: MA" />
          </Field>
          <Field label="Keterangan" htmlFor="new-jenjang-description">
            <Input id="new-jenjang-description" name="description" placeholder="Contoh: Madrasah Aliyah — kelas 10 sampai 12." />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Jenjang</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function KelasView() {
  const { state, addClass } = useDemo();
  const role = state.activeRole;
  const canManage = role === "admin_akademik" || role === "super_admin";
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(formData: FormData) {
    setSaving(true);
    await addClass({
      name: String(formData.get("name") ?? "Baru"),
      jenjangId: String(formData.get("jenjangId") ?? state.jenjang[0]?.id),
      level: Number(formData.get("level") ?? 7),
      homeroomTeacherId: String(formData.get("homeroomTeacherId") ?? state.teachers[0]?.id),
      room: String(formData.get("room") ?? "Ruang Baru"),
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow={canManage ? "Data master · Kelas" : "Kelas yang diajar"}
        title="Data kelas"
        description="Lihat rombongan belajar, wali kelas, jumlah santri, dan kapasitas ruang."
        actions={canManage ? <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Kelas</Button> : undefined}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {state.classes.map((cls) => {
          const students = state.students.filter((student) => student.classId === cls.id);
          const homeroom = state.teachers.find((teacher) => teacher.id === cls.homeroomTeacherId);
          const jenjang = state.jenjang.find((item) => item.id === cls.jenjangId);
          return (
            <SectionCard key={cls.id} title={`Kelas ${cls.name}`} description={`${cls.room} · kapasitas ${cls.capacity}`} icon={<School className="h-4 w-4" />}>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Wali kelas</span>
                  <span className="text-right font-medium text-slate-800">{homeroom?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Jumlah santri</span>
                  <span className="font-semibold text-slate-800">{students.length}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Jenjang</span>
                  <span className="font-medium text-slate-800">{jenjang?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Tingkat</span>
                  <span className="font-medium text-slate-800">Kelas {cls.level}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2">
                {students.map((student) => (
                  <li key={student.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-slate-600">{student.name}</span>
                    <StatusBadge status={student.status} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah kelas baru">
        <form action={handleAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama kelas" htmlFor="new-class-name" required>
              <Input id="new-class-name" name="name" placeholder="Contoh: 7B" />
            </Field>
            <Field label="Jenjang" htmlFor="new-class-jenjang" required>
              <Select id="new-class-jenjang" name="jenjangId" defaultValue={state.jenjang[0]?.id}>
                {state.jenjang.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tingkat" htmlFor="new-class-level" hint="Isi angka tingkat, misalnya 10 untuk jenjang MA.">
              <Input id="new-class-level" name="level" type="number" min={1} max={12} defaultValue={7} required />
            </Field>
            <Field label="Wali kelas" htmlFor="new-class-homeroom">
              <Select id="new-class-homeroom" name="homeroomTeacherId">
                {state.teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ruang" htmlFor="new-class-room">
              <Input id="new-class-room" name="room" placeholder="Ruang 7B" />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Kelas</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function MapelView() {
  const { state, addSubject } = useDemo();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    setSaving(true);
    await addSubject({
      code: String(formData.get("code") ?? "NEW"),
      name,
      category: String(formData.get("category")) === "Umum" ? "Umum" : "Diniyah",
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data master · Mata pelajaran"
        title="Mata pelajaran"
        description="Daftar mata pelajaran diniyah dan umum yang diajarkan di pesantren."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Mapel</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {state.subjects.map((subject) => {
          const teachers = state.teachers.filter((teacher) => teacher.subjectIds.includes(subject.id));
          const materials = state.materials.filter((material) => material.subjectId === subject.id);
          return (
            <div key={subject.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{subject.name}</p>
                  <p className="text-[11px] text-slate-500">{subject.code}</p>
                </div>
                <StatusBadge label={subject.category} tone={subject.category === "Diniyah" ? "brand" : "info"} />
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Guru pengampu</dt>
                  <dd className="text-right font-medium text-slate-700">{teachers.length}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Materi</dt>
                  <dd className="font-medium text-slate-700">{materials.length}</dd>
                </div>
              </dl>
              <p className="mt-2 truncate text-[11px] text-slate-500">
                {teachers.map((teacher) => teacher.name).join(", ") || "Belum ada guru"}
              </p>
            </div>
          );
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah mata pelajaran">
        <form action={handleAdd} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kode" htmlFor="new-subject-code">
              <Input id="new-subject-code" name="code" placeholder="Contoh: TFS" />
            </Field>
            <Field label="Kategori" htmlFor="new-subject-category">
              <Select id="new-subject-category" name="category" defaultValue="Diniyah">
                <option value="Diniyah">Diniyah</option>
                <option value="Umum">Umum</option>
              </Select>
            </Field>
          </div>
          <Field label="Nama mata pelajaran" htmlFor="new-subject-name" required>
            <Input id="new-subject-name" name="name" placeholder="Contoh: Tafsir" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Mapel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function PeriodeView() {
  const { state, addPeriod } = useDemo();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(formData: FormData) {
    setSaving(true);
    await addPeriod({
      name: String(formData.get("name") ?? "Tahun Ajaran Baru"),
      semester: String(formData.get("semester")) === "Genap" ? "Genap" : "Ganjil",
      startDate: String(formData.get("startDate") ?? "2027-01-05"),
      endDate: String(formData.get("endDate") ?? "2027-06-12"),
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Data master · Periode ajaran"
        title="Periode ajaran"
        description="Atur tahun ajaran dan semester. Periode aktif digunakan untuk data akademik."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Periode</Button>}
      />

      <div className="space-y-3">
        {state.schoolPeriods.map((period) => (
          <div key={period.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{period.name}</p>
                <StatusBadge status={period.active ? "aktif" : "nonaktif"} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Semester {period.semester} · {formatDate(period.startDate)} – {formatDate(period.endDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {period.active ? "Periode berjalan" : "Arsip"}
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah periode ajaran">
        <form action={handleAdd} className="space-y-3">
          <Field label="Nama periode" htmlFor="new-period-name" required>
            <Input id="new-period-name" name="name" placeholder="Tahun Ajaran 2027/2028" />
          </Field>
          <Field label="Semester" htmlFor="new-period-semester">
            <Select id="new-period-semester" name="semester" defaultValue="Ganjil">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mulai" htmlFor="new-period-start">
              <Input id="new-period-start" name="startDate" type="date" defaultValue="2027-07-12" />
            </Field>
            <Field label="Selesai" htmlFor="new-period-end">
              <Input id="new-period-end" name="endDate" type="date" defaultValue="2027-12-17" />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Periode</Button>
          </div>
        </form>
      </Modal>

      <SectionCard title="Catatan demo" description="Periode baru ditambahkan sebagai nonaktif." className="mt-4">
        <p className="text-xs text-slate-600">
          Pada sistem nyata, hanya satu periode yang boleh aktif. Demo ini memperlihatkan pilihan periode di
          topbar untuk guru dan admin, serta badge periode pada rapor.
        </p>
      </SectionCard>
    </div>
  );
}
