"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCopy, LayoutDashboard, Mail, Printer } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button, ButtonLink } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useDemo } from "@/context/demo-context";
import { loadRegistrationNumber, ppdbSteps } from "@/lib/ppdb-draft";

export default function SuksesPendaftaranPage() {
  const router = useRouter();
  const { loginAs, showToast } = useDemo();
  const [number, setNumber] = useState("");

  useEffect(() => {
    setNumber(loadRegistrationNumber() || "PPDB-2026-0001");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex-1 py-10">
        <Stepper steps={ppdbSteps} current={4} />
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-card">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Pendaftaran berhasil dikirim
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Terima kasih. Simpan nomor pendaftaran berikut untuk mengecek status verifikasi.
              Data ini hanya tersimpan pada demo browser Anda.
            </p>

            <div className="mx-auto mt-5 max-w-sm rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-800">
                Nomor pendaftaran
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-wide text-slate-900">{number}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(number).catch(() => undefined);
                  showToast("Nomor disalin", "success", number);
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-800 hover:underline"
              >
                <ClipboardCopy className="h-3.5 w-3.5" aria-hidden /> Salin nomor
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left ring-1 ring-inset ring-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Langkah berikutnya</h2>
              <ol className="mt-2 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-700">1.</span>
                  Admin akademik memeriksa kelengkapan data dan dokumen (1–3 hari kerja pada alur nyata).
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-700">2.</span>
                  Admin keuangan memverifikasi bukti transfer pendaftaran.
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-brand-700">3.</span>
                  Keputusan dan instruksi daftar ulang akan tampil pada halaman cek status.
                </li>
              </ol>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <ButtonLink
                href={`/cek-pendaftaran?number=${encodeURIComponent(number)}`}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Cek Status Pendaftaran
              </ButtonLink>
              <Button
                variant="outline"
                icon={<LayoutDashboard className="h-4 w-4" />}
                onClick={() => {
                  loginAs("calon_wali");
                  router.push("/dashboard");
                }}
              >
                Buka Dashboard Calon Wali
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => showToast("PDF demo siap diunduh", "success", "Simulasi bukti pendaftaran berhasil dibuat.")}
                className="inline-flex items-center gap-1 hover:text-slate-800 hover:underline"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden /> Unduh bukti (demo)
              </button>
              <Link href="/" className="hover:text-slate-800 hover:underline">
                Kembali ke beranda
              </Link>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" aria-hidden /> Email hanya simulasi
              </span>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
