"use client";

import { useState } from "react";
import { FileCheck2, FolderOpen, Info, Trash2, Upload } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, getClassName } from "@/lib/utils";
import type { StudentDocument } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

const requiredDocs = [
  "Kartu Keluarga",
  "Akta Kelahiran",
  "Ijazah / Surat Keterangan Lulus",
  "Pas Foto 3x4",
  "KTP Wali",
];

export function BerkasView() {
  const { state, uploadDocument, deleteDocument } = useDemo();
  const role = state.activeRole;
  const child = state.students.find((item) => item.id === state.activeChildId);
  const [deleting, setDeleting] = useState<StudentDocument | null>(null);
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  if (role === "super_admin") {
    return (
      <div>
        <PageHeader
          eyebrow="Administrasi · Berkas"
          title="Kelengkapan berkas siswa"
          description="Pantau kelengkapan dokumen semua santri untuk memastikan administrasi siap."
        />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Kelengkapan berkas siswa</caption>
              <thead>
                <tr>
                  <th scope="col">Siswa</th>
                  <th scope="col">Kelas</th>
                  <th scope="col">Dokumen</th>
                  <th scope="col">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {state.students.map((student) => {
                  const docs = state.documents.filter((doc) => doc.studentId === student.id);
                  const complete = requiredDocs.filter((name) => docs.some((doc) => doc.name === name)).length;
                  return (
                    <tr key={student.id}>
                      <td className="font-medium text-slate-800">{student.name}</td>
                      <td>{getClassName(state, student.classId)}</td>
                      <td>{complete} / {requiredDocs.length}</td>
                      <td className="min-w-32">
                        <ProgressBar value={(complete / requiredDocs.length) * 100} tone={complete === requiredDocs.length ? "emerald" : "amber"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!child) return null;
  const documents = state.documents.filter((doc) => doc.studentId === child.id);
  const complete = requiredDocs.filter((name) => documents.some((doc) => doc.name === name)).length;
  const percent = Math.round((complete / requiredDocs.length) * 100);

  return (
    <div>
      <PageHeader
        eyebrow={`${child.name} · Berkas`}
        title="Berkas anak"
        description="Lengkapi dokumen administrasi. Unggahan pada demo hanya menyimpan nama berkas di state lokal."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Berkas lengkap" value={`${complete} / ${requiredDocs.length}`} hint="Dokumen wajib" icon={FileCheck2} tone={percent === 100 ? "emerald" : "amber"} />
        <StatCard label="Persentase" value={`${percent}%`} hint="Kelengkapan administrasi" icon={FolderOpen} tone={percent === 100 ? "emerald" : "amber"} />
        <StatCard label="Kelas" value={getClassName(state, child.classId)} hint={`NIS ${child.nis}`} icon={FolderOpen} tone="brand" />
      </div>

      <div className="mt-4 space-y-3">
        {requiredDocs.map((name) => {
          const doc = documents.find((item) => item.name === name);
          return (
            <div key={name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{name}</h2>
                    <StatusBadge status={doc ? (doc.status === "lengkap" ? "lengkap" : "perlu_perbaikan") : "belum"} label={doc ? (doc.status === "lengkap" ? "Lengkap" : "Perbaikan") : "Belum diunggah"} />
                  </div>
                  {doc ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {doc.fileName} · {doc.size} · diunggah {formatDate(doc.uploadedAt)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">Dokumen wajib belum tersedia pada data demo.</p>
                  )}
                </div>
                {doc && (
                  <Button size="sm" variant="ghost" className="text-rose-600" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDeleting(doc)}>
                    Hapus
                  </Button>
                )}
              </div>

              {!doc && (
                <div className="mt-3">
                  <MockFileUpload
                    label={`Unggah ${name}`}
                    value={undefined}
                    onChange={(fileName) => {
                      if (fileName) {
                        setUploadingName(name);
                        void uploadDocument(child.id, name, fileName).finally(() => setUploadingName(null));
                      }
                    }}
                  />
                  {uploadingName === name && <p className="mt-1 text-xs text-slate-500">Menyimpan berkas demo...</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {complete < requiredDocs.length && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Berkas yang belum lengkap dapat menghambat verifikasi administrasi. Unggah dokumen yang hilang,
          lalu periksa kembali statusnya.
        </div>
      )}

      {documents.length === 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon={Upload}
            title="Belum ada berkas"
            description="Unggah dokumen pertama menggunakan tombol pada setiap kategori di atas."
          />
        </div>
      )}

      <SectionCard title="Catatan demo" className="mt-4">
        <p className="text-xs leading-relaxed text-slate-600">
          Upload file tidak mengirim data ke server. Hanya nama file yang disimpan. Tombol hapus juga hanya
          mengubah state dan localStorage demo.
        </p>
      </SectionCard>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Hapus berkas ini?"
        description={`${deleting?.name ?? ""} akan dihapus dari data demo. Anda dapat mengunggah ulang kapan saja.`}
        confirmLabel="Hapus Berkas"
        tone="danger"
        onConfirm={() => {
          if (deleting) deleteDocument(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
