"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Save, Info } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { Stepper } from "@/components/ui/stepper";
import { getClassName } from "@/lib/utils";

export function TugasBuatView() {
  const router = useRouter();
  const { state, addTask, showToast } = useDemo();
  const teacher = state.teachers.find((item) => item.id === state.activeTeacherId);
  const [classId, setClassId] = useState(teacher?.classIds[0] ?? state.classes[0]?.id ?? "");
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [attachment, setAttachment] = useState("");

  async function submit(status: "draft" | "published") {
    const form = document.getElementById("form-tugas") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const subjectId = String(data.get("subjectId") ?? "");
    const description = String(data.get("description") ?? "").trim();
    const instructions = String(data.get("instructions") ?? "").trim();
    const deadline = String(data.get("deadline") ?? "");
    const maxScore = Number(data.get("maxScore") ?? 100);
    const allowRevision = data.get("allowRevision") === "on";

    if (!title || !description || !deadline) {
      showToast("Data tugas belum lengkap", "error", "Judul, deskripsi, dan tenggat wajib diisi.");
      return;
    }
    if (new Date(deadline) < new Date("2026-11-24")) {
      showToast("Tenggat tidak valid", "error", "Pilih tanggal setelah hari ini (24 November 2026).");
      return;
    }
    setSaving(status);
    await addTask({
      title,
      description,
      instructions: instructions || description,
      subjectId,
      classId,
      teacherId: teacher?.id ?? "tch-1",
      deadline,
      maxScore: Number.isFinite(maxScore) ? maxScore : 100,
      allowRevision,
      attachmentName: attachment || undefined,
      status,
    });
    setSaving(null);
    router.push("/dashboard/tugas");
  }

  return (
    <div>
      <Link href="/dashboard/tugas" className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar tugas
      </Link>
      <PageHeader
        eyebrow="Guru · Buat tugas"
        title="Buat tugas baru"
        description="Tentukan kelas, mata pelajaran, instruksi, dan tenggat. Simpan sebagai draft untuk diperiksa dulu."
      />

      <Stepper
        steps={[
          { title: "Detail tugas", description: "Judul dan mapel" },
          { title: "Petunjuk", description: "Instruksi pengerjaan" },
          { title: "Tenggat", description: "Batas pengumpulan" },
          { title: "Publikasi", description: "Draft atau kirim" },
        ]}
        current={0}
      />

      <form id="form-tugas" className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]" onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-slate-900">Detail tugas</h2>
            <div className="mt-4 space-y-3.5">
              <Field label="Judul tugas" htmlFor="task-title" required>
                <Input id="task-title" name="title" placeholder="Contoh: Insya Kegiatan Harian di Pesantren" />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mata pelajaran" htmlFor="task-subject" required>
                  <Select id="task-subject" name="subjectId" defaultValue={teacher?.subjectIds[0]}>
                    {state.subjects
                      .filter((subject) => (teacher ? teacher.subjectIds.includes(subject.id) : true))
                      .map((subject) => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                  </Select>
                </Field>
                <Field label="Kelas" htmlFor="task-class" required>
                  <Select id="task-class" name="classId" value={classId} onChange={(event) => setClassId(event.target.value)}>
                    {state.classes
                      .filter((cls) => (teacher ? teacher.classIds.includes(cls.id) : true))
                      .map((cls) => (
                        <option key={cls.id} value={cls.id}>Kelas {cls.name}</option>
                      ))}
                  </Select>
                </Field>
              </div>
              <Field label="Deskripsi singkat" htmlFor="task-description" required hint="Tampil pada daftar tugas siswa dan wali.">
                <Input id="task-description" name="description" placeholder="Satu kalimat tentang tugas ini" />
              </Field>
              <Field label="Instruksi pengerjaan" htmlFor="task-instructions">
                <Textarea id="task-instructions" name="instructions" rows={4} placeholder="Langkah pengerjaan, format pengumpulan, dan hal yang dinilai..." />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-slate-900">Tenggat dan penilaian</h2>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              <Field label="Tenggat pengumpulan" htmlFor="task-deadline" required>
                <Input id="task-deadline" name="deadline" type="date" defaultValue="2026-11-30" min="2026-11-24" />
              </Field>
              <Field label="Nilai maksimal" htmlFor="task-max">
                <Input id="task-max" name="maxScore" type="number" min={10} max={100} defaultValue={100} />
              </Field>
            </div>
            <Checkbox name="allowRevision" label="Izinkan siswa memperbaiki dan mengirim ulang tugas" defaultChecked className="mt-2" />
            <div className="mt-3">
              <MockFileUpload label="Lampiran pendukung (opsional)" onChange={(name) => setAttachment(name ?? "")} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">Ringkasan</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Kelas</dt>
                <dd className="font-medium text-slate-800">{getClassName(state, classId)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Jumlah santri</dt>
                <dd className="font-medium text-slate-800">
                  {state.students.filter((student) => student.classId === classId).length}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Lampiran</dt>
                <dd className="truncate font-medium text-slate-800">{attachment || "Tidak ada"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            <p className="flex items-center gap-1.5 font-semibold">
              <Info className="h-3.5 w-3.5" aria-hidden /> Alur demo
            </p>
            <p className="mt-1">
              Draft belum terlihat siswa. Setelah dipublikasikan, siswa dan wali dapat melihat tugas ini
              dan mengumpulkannya secara simulasi.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              loading={saving === "published"}
              onClick={() => submit("published")}
              icon={<Send className="h-4 w-4" />}
            >
              Publikasikan Tugas
            </Button>
            <Button
              type="button"
              variant="outline"
              loading={saving === "draft"}
              onClick={() => submit("draft")}
              icon={<Save className="h-4 w-4" />}
            >
              Simpan sebagai Draft
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
