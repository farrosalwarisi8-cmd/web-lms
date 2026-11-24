"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Info,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ButtonLink } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { useDemo } from "@/context/demo-context";
import { formatRupiah } from "@/lib/utils";
import { ppdbSteps } from "@/lib/ppdb-draft";

const requirements = [
  "Calon santri berusia 12–15 tahun pada tahun ajaran berjalan.",
  "Fotokopi kartu keluarga dan akta kelahiran.",
  "Ijazah atau surat keterangan lulus sekolah sebelumnya.",
  "Pas foto terbaru ukuran 3x4 dengan latar merah.",
  "KTP wali sebagai penanggung jawab pendaftaran.",
];

const timeline = [
  { label: "Gelombang 1", period: "1 – 30 November 2026", note: "Biaya formulir Rp150.000" },
  { label: "Verifikasi berkas", period: "1 – 7 Desember 2026", note: "Admin memeriksa kelengkapan" },
  { label: "Pengumuman", period: "10 Desember 2026", note: "Melalui halaman cek status" },
  { label: "Daftar ulang", period: "12 – 18 Desember 2026", note: "Pelunasan biaya masuk" },
];

export default function PendaftaranPage() {
  const { state } = useDemo();
  const total = state.ppdbFees
    .filter((fee) => fee.required)
    .reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white">
          <div className="container-page py-10 lg:py-14">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Penerimaan Santri Baru 2026/2027
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Pendaftaran santri baru, tahap demi tahap.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                Lengkapi formulir, unggah dokumen, dan kirim bukti pembayaran. Anda dapat menyimpan
                draft dan mengecek status pendaftaran dengan nomor yang diberikan.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="/pendaftaran/form" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Mulai Formulir Pendaftaran
                </ButtonLink>
                <ButtonLink href="/cek-pendaftaran" size="lg" variant="outline">
                  Cek Status Pendaftaran
                </ButtonLink>
              </div>
            </div>
            <Stepper steps={ppdbSteps} current={0} className="mt-8" />
          </div>
        </section>

        <section className="container-page grid gap-6 py-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText className="h-5 w-5 text-brand-700" aria-hidden />
                Persyaratan pendaftaran
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <CalendarDays className="h-5 w-5 text-brand-700" aria-hidden />
                Jadwal penting
              </h2>
              <ol className="mt-3 space-y-3">
                {timeline.map((item, index) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                      {index + 1}
                    </span>
                    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.period}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <CreditCard className="h-5 w-5 text-brand-700" aria-hidden />
                Rincian biaya pendaftaran
              </h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="table-base">
                  <caption className="sr-only">Rincian biaya PPDB</caption>
                  <thead>
                    <tr>
                      <th scope="col">Komponen</th>
                      <th scope="col" className="text-right">Nominal</th>
                      <th scope="col">Sifat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.ppdbFees.map((fee) => (
                      <tr key={fee.id}>
                        <td>{fee.label}</td>
                        <td className="text-right font-medium">{formatRupiah(fee.amount)}</td>
                        <td>
                          <span className={fee.required ? "text-xs font-semibold text-rose-700" : "text-xs text-slate-500"}>
                            {fee.required ? "Wajib" : "Opsional"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Total biaya wajib saat pendaftaran: <strong className="text-slate-700">{formatRupiah(total)}</strong>.
                Demo ini tidak memproses pembayaran nyata.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Users className="h-4 w-4 text-brand-400" aria-hidden />
                Sudah mendaftar?
              </h2>
              <p className="mt-1.5 text-sm text-slate-300">
                Gunakan nomor pendaftaran yang Anda terima untuk melihat progres verifikasi.
              </p>
              <Link
                href="/cek-pendaftaran"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400"
              >
                Cek Status Sekarang
              </Link>
              <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-slate-400 ring-1 ring-inset ring-white/10">
                Contoh nomor demo: <span className="font-mono text-slate-200">PPDB-2026-0001</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Butuh bantuan?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hubungi panitia PPDB demo pada jam kerja. Semua kontak pada halaman ini fiktif.
              </p>
              <dl className="mt-3 space-y-2 text-xs text-slate-600">
                <div>
                  <dt className="font-semibold text-slate-700">Telepon</dt>
                  <dd>0812-3456-7890</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Email</dt>
                  <dd>ppdb@ansharussunnah.demo</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Jam layanan</dt>
                  <dd>Senin–Jumat, 08.00–15.00 WIB</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
