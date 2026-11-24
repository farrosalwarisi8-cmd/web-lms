"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FileCheck2, Info, Save } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useDemo } from "@/context/demo-context";
import {
  loadDraft,
  ppdbSteps,
  requiredDocuments,
  saveDraft,
  type PpdbDraft,
} from "@/lib/ppdb-draft";

export default function DokumenPendaftaranPage() {
  const router = useRouter();
  const { showToast } = useDemo();
  const [draft, setDraft] = useState<PpdbDraft>(() => loadDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  const uploaded = requiredDocuments.filter((name) => draft.documents[name]).length;
  const complete = uploaded === requiredDocuments.length;

  function setDocument(name: string, uploadedNow: boolean) {
    setDraft((prev) => {
      const next = { ...prev, documents: { ...prev.documents, [name]: uploadedNow } };
      saveDraft(next);
      return next;
    });
  }

  async function next() {
    if (!complete) {
      showToast("Dokumen belum lengkap", "error", "Unggah semua dokumen wajib terlebih dahulu.");
      return;
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    saveDraft(draft);
    setSaving(false);
    showToast("Dokumen tersimpan", "success", "Lanjutkan ke pembayaran biaya pendaftaran.");
    router.push("/pendaftaran/pembayaran");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex-1 py-8">
        <Link href="/pendaftaran/form" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke data formulir
        </Link>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Langkah 2 dari 5</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Unggah dokumen pendaftaran</h1>
          <p className="mt-1 text-sm text-slate-600">
            Semua unggahan adalah simulasi lokal. File tidak dikirim ke server mana pun.
          </p>
        </div>

        <Stepper steps={ppdbSteps} current={2} className="mt-5" />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Dokumen wajib</h2>
                <p className="text-xs text-slate-500">Format PDF, JPG, atau PNG.</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${complete ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>
                {uploaded} / {requiredDocuments.length} diunggah
              </span>
            </div>
            <ProgressBar value={(uploaded / requiredDocuments.length) * 100} tone={complete ? "emerald" : "brand"} className="mt-3" />

            <div className="mt-4 space-y-4">
              {requiredDocuments.map((name) => (
                <div key={name} className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
                  <MockFileUpload
                    label={name}
                    hint="Pilih file contoh; progres unggah disimulasikan."
                    value={draft.documents[name] ? `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf` : undefined}
                    onChange={(fileName) => setDocument(name, Boolean(fileName))}
                  />
                  {draft.documents[name] && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700">
                      <FileCheck2 className="h-3.5 w-3.5" aria-hidden /> Dokumen siap diverifikasi admin.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                icon={<Save className="h-4 w-4" />}
                onClick={() => {
                  saveDraft(draft);
                  showToast("Draft dokumen disimpan", "info");
                }}
              >
                Simpan Draft
              </Button>
              <Button onClick={next} loading={saving} disabled={!complete} iconRight={<ArrowRight className="h-4 w-4" />}>
                Lanjut ke Pembayaran
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Panduan berkas</h2>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
                <li>• Pastikan seluruh dokumen terbaca jelas dan tidak terpotong.</li>
                <li>• Ukuran maksimal 5 MB per berkas (simulasi).</li>
                <li>• Nama pemilik dokumen harus sesuai data calon santri.</li>
                <li>• Bila ada berkas yang salah, hapus lalu unggah ulang.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <Info className="h-3.5 w-3.5" aria-hidden /> Pratinjau calon santri
              </p>
              <p className="mt-1 font-medium text-blue-950">{draft.studentName || "Belum diisi"}</p>
              <p>Kelas {draft.level} · Wali {draft.parentName || "Belum diisi"}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                router.push("/pendaftaran/form");
              }}
            >
              Ubah data formulir
            </Button>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
