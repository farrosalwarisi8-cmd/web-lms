"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CreditCard, Info, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useDemo } from "@/context/demo-context";
import { formatRupiah } from "@/lib/utils";
import {
  loadDraft,
  ppdbSteps,
  requiredDocuments,
  saveDraft,
  saveRegistrationNumber,
  type PpdbDraft,
} from "@/lib/ppdb-draft";

export default function PembayaranPendaftaranPage() {
  const router = useRouter();
  const { state, submitRegistration, showToast } = useDemo();
  const [draft, setDraft] = useState<PpdbDraft>(() => loadDraft());
  const [proof, setProof] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loaded = loadDraft();
    setDraft(loaded);
    setProof(loaded.proofFile ?? "");
  }, []);

  const fees = state.ppdbFees.filter((fee) => fee.required);
  const total = fees.reduce((sum, fee) => sum + fee.amount, 0);

  async function finalize() {
    setSubmitting(true);
    const number = await submitRegistration({
      studentName: draft.studentName || "Calon Santri Demo",
      gender: draft.gender,
      birthDate: draft.birthDate || "2013-01-01",
      parentName: draft.parentName || "Wali Demo",
      parentPhone: draft.parentPhone || "081200000000",
      parentEmail: draft.parentEmail || "wali@demo.local",
      address: draft.address || "Alamat demo",
      level: draft.level,
      previousSchool: draft.previousSchool || "Sekolah Demo",
      documents: requiredDocuments,
    });
    saveRegistrationNumber(number);
    saveDraft({ ...draft, proofFile: proof, registrationNumber: number });
    setSubmitting(false);
    setConfirmOpen(false);
    showToast("Pendaftaran terkirim", "success", `Nomor pendaftaran ${number} telah dibuat.`);
    router.push("/pendaftaran/sukses");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex-1 py-8">
        <Link href="/pendaftaran/dokumen" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke dokumen
        </Link>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Langkah 3 dari 5</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Pembayaran biaya pendaftaran</h1>
          <p className="mt-1 text-sm text-slate-600">
            Unggah bukti transfer simulasi. Tidak ada transaksi atau rekening nyata yang digunakan.
          </p>
        </div>

        <Stepper steps={ppdbSteps} current={3} className="mt-5" />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-slate-900">Ringkasan biaya wajib</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="table-base">
                <caption className="sr-only">Ringkasan biaya wajib pendaftaran</caption>
                <thead>
                  <tr>
                    <th scope="col">Komponen</th>
                    <th scope="col" className="text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id}>
                      <td>{fee.label}</td>
                      <td className="text-right font-medium">{formatRupiah(fee.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td className="font-semibold text-slate-900">Total wajib dibayar</td>
                    <td className="text-right text-base font-bold text-slate-900">{formatRupiah(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                <CreditCard className="h-4 w-4 text-brand-700" aria-hidden /> Instruksi transfer (demo)
              </p>
              <dl className="mt-2 grid gap-1.5 text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Bank</dt>
                  <dd className="font-medium text-slate-800">BSI (simulasi)</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Nomor rekening</dt>
                  <dd className="font-mono font-medium text-slate-800">7000-1234-56</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Atas nama</dt>
                  <dd className="font-medium text-slate-800">Panitia PPDB Ansharussunnah</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">Berita transfer</dt>
                  <dd className="font-medium text-slate-800">{draft.studentName || "Nama calon santri"}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4">
              <MockFileUpload
                label="Bukti transfer"
                hint="Pilih gambar atau PDF sebagai bukti transfer simulasi."
                value={proof || undefined}
                onChange={(fileName) => {
                  setProof(fileName ?? "");
                  saveDraft({ ...draft, proofFile: fileName ?? "" });
                }}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => saveDraft({ ...draft, proofFile: proof })}>
                Simpan Bukti
              </Button>
              <Button
                onClick={() => {
                  if (!proof) {
                    showToast("Bukti transfer belum diunggah", "error", "Unggah bukti transfer terlebih dahulu.");
                    return;
                  }
                  setConfirmOpen(true);
                }}
                iconRight={<ArrowRight className="h-4 w-4" />}
                disabled={!proof}
              >
                Kirim Pendaftaran
              </Button>
            </div>
            {!proof && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Tombol kirim aktif setelah bukti transfer diunggah.
              </p>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Setelah dikirim</h2>
              <ol className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
                <li>1. Anda menerima nomor pendaftaran demo.</li>
                <li>2. Admin akademik memverifikasi data dan dokumen.</li>
                <li>3. Admin keuangan memverifikasi bukti pembayaran.</li>
                <li>4. Status dapat dicek dengan nomor pendaftaran.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Aman untuk presentasi
              </p>
              <p className="mt-1">
                Halaman ini tidak meminta nomor kartu, PIN, atau password perbankan. Bukti transfer tidak
                memuat data nyata.
              </p>
            </div>
            <ProgressBar label="Kelengkapan alur" value={80} hint="3 dari 5 langkah" tone="emerald" />
          </aside>
        </div>
      </main>
      <PublicFooter />

      <ConfirmDialog
        open={confirmOpen}
        title="Kirim pendaftaran sekarang?"
        description="Data calon santri, dokumen, dan bukti transfer akan dikirim ke antrean verifikasi demo. Pastikan data sudah benar."
        confirmLabel="Ya, Kirim Pendaftaran"
        loading={submitting}
        onConfirm={finalize}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
