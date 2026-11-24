"use client";

import { useMemo, useState } from "react";
import { BookOpen, Plus, Send, Eye } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import {
  formatDate,
  getClassName,
  getSubjectName,
  getTeacherName,
} from "@/lib/utils";
import type { Material } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MockFileUpload } from "@/components/ui/mock-file-upload";

export function MateriView() {
  const { state, addMaterial, publishMaterial, showToast } = useDemo();
  const role = state.activeRole;
  const canManage = role === "guru";
  const [tab, setTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);

  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const child = state.students.find((student) => student.id === state.activeChildId);

  const scoped = useMemo(() => {
    let items = state.materials;
    if (role === "guru" && teacher) {
      items = items.filter((material) => material.teacherId === teacher.id);
    } else if (role === "siswa" || role === "orang_tua") {
      const classId = role === "siswa" ? child?.classId : child?.classId;
      items = items.filter(
        (material) => material.classId === classId && material.status === "published"
      );
    }
    if (tab === "published") items = items.filter((material) => material.status === "published");
    if (tab === "draft") items = items.filter((material) => material.status === "draft");
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (material) =>
          material.title.toLowerCase().includes(q) ||
          material.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [state.materials, role, teacher, child?.classId, tab, search]);

  async function handleCreate(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const subjectId = String(formData.get("subjectId") ?? "");
    const classId = String(formData.get("classId") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const status = String(formData.get("status") ?? "draft") as "draft" | "published";
    if (!title || !description || !content) {
      showToast("Materi belum lengkap", "error", "Judul, ringkasan, dan isi materi wajib diisi.");
      return;
    }
    setSaving(true);
    await addMaterial({
      title,
      subjectId,
      classId,
      teacherId: teacher?.id ?? "tch-1",
      description,
      content,
      status,
      fileName: formData.get("fileName") ? String(formData.get("fileName")) : undefined,
    });
    setSaving(false);
    setCreateOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow={canManage ? "Kelola materi" : "Materi anak"}
        title="Materi pembelajaran"
        description={
          canManage
            ? "Buat materi, simpan sebagai draft, lalu publikasikan ke kelas yang dipilih."
            : "Baca materi yang telah dipublikasikan guru untuk kelas terkait."
        }
        actions={
          canManage ? (
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Buat Materi
            </Button>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Cari judul atau ringkasan materi..."
          right={
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "semua", label: "Semua" },
                { value: "published", label: "Dipublikasikan" },
                ...(canManage ? [{ value: "draft", label: "Draft" }] : []),
              ]}
            />
          }
        />

        {scoped.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={tab === "draft" ? "Tidak ada draft materi" : "Belum ada materi"}
            description={
              canManage
                ? "Buat materi baru untuk kelas yang Anda ajar. Materi draft hanya terlihat oleh guru."
                : "Guru belum mempublikasikan materi untuk kelas ini. Coba periksa kembali nanti."
            }
            tone={tab === "draft" ? "info" : "neutral"}
            action={
              canManage ? (
                <Button size="sm" onClick={() => setCreateOpen(true)} icon={<Plus className="h-4 w-4" />}>
                  Buat materi pertama
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {scoped.map((material) => (
              <li key={material.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{material.title}</h2>
                    <StatusBadge status={material.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{getSubjectName(state, material.subjectId)}</span>
                    <span>Kelas {getClassName(state, material.classId)}</span>
                    <span>{getTeacherName(state, material.teacherId)}</span>
                    <span>{formatDate(material.createdAt)}</span>
                    {material.fileName && <span className="text-brand-700">{material.fileName}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => setDetail(material)}>
                    Baca
                  </Button>
                  {canManage && material.status === "draft" && (
                    <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => publishMaterial(material.id)}>
                      Publikasikan
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Buat materi pembelajaran"
        description="Materi draft dapat dipublikasikan kapan saja."
        size="lg"
      >
        <form action={handleCreate} className="space-y-3.5">
          <Field label="Judul materi" htmlFor="material-title" required>
            <Input id="material-title" name="title" placeholder="Contoh: Nahwu — Mubtada dan Khabar" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mata pelajaran" htmlFor="material-subject" required>
              <Select id="material-subject" name="subjectId" defaultValue={teacher?.subjectIds[0]}>
                {state.subjects
                  .filter((subject) => (canManage && teacher ? teacher.subjectIds.includes(subject.id) : true))
                  .map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
              </Select>
            </Field>
            <Field label="Kelas" htmlFor="material-class" required>
              <Select id="material-class" name="classId" defaultValue={teacher?.classIds[0]}>
                {state.classes
                  .filter((cls) => (canManage && teacher ? teacher.classIds.includes(cls.id) : true))
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                  ))}
              </Select>
            </Field>
          </div>
          <Field label="Ringkasan singkat" htmlFor="material-description" required>
            <Input id="material-description" name="description" placeholder="Satu kalimat ringkas tentang materi" />
          </Field>
          <Field label="Isi materi" htmlFor="material-content" required hint="Tuliskan poin-poin utama yang dapat dibaca siswa.">
            <Textarea id="material-content" name="content" rows={5} placeholder="Tuliskan isi materi..." />
          </Field>
          <MockFileUpload
            label="Lampiran materi (opsional)"
            onChange={(fileName) => {
              const input = document.querySelector<HTMLInputElement>('input[name="fileName"]');
              if (input) input.value = fileName ?? "";
            }}
          />
          <input type="hidden" name="fileName" defaultValue="" />
          <Field label="Status simpan" htmlFor="material-status">
            <Select id="material-status" name="status" defaultValue="draft">
              <option value="draft">Simpan sebagai draft</option>
              <option value="published">Langsung publikasikan</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving} icon={<Plus className="h-4 w-4" />}>
              Simpan Materi
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.title ?? "Detail materi"}
        description={detail ? `${getSubjectName(state, detail.subjectId)} · Kelas ${getClassName(state, detail.classId)}` : undefined}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setDetail(null)}>
            Tutup
          </Button>
        }
      >
        {detail && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-700">{detail.content}</p>
            <dl className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Guru</dt>
                <dd className="font-medium text-slate-800">{getTeacherName(state, detail.teacherId)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dipublikasikan</dt>
                <dd className="font-medium text-slate-800">{formatDate(detail.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Lampiran</dt>
                <dd className="font-medium text-slate-800">{detail.fileName ?? "Tidak ada lampiran"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd><StatusBadge status={detail.status} /></dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
