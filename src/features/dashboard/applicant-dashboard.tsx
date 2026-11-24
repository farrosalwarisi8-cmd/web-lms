"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  Upload,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { Stepper } from "@/components/ui/stepper";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ppdbSteps } from "@/lib/ppdb-draft";
import { formatDate } from "@/lib/utils";

const stepForStatus: Record<string, number> = {
  draft: 0,
  menunggu_pembayaran: 3,
  menunggu_verifikasi: 4,
  perlu_perbaikan: 4,
  diterima: 4,
  ditolak: 4,
};

export function ApplicantDashboard() {
  const { state } = useDemo();
  const registration =
    state.registrations.find((item) => item.parentEmail === "calonwali@demo.local") ??
    state.registrations[0];
  const current = registration ? stepForStatus[registration.status] ?? 0 : 0;
  const uploaded = registration
    ? registration.documents.filter((doc) => doc.uploaded).length
    : 0;
  const total = registration?.documents.length ?? 5;

  return (
    <div>
      <PageHeader
        eyebrow="Calon Wali · PPDB 2026/2027"
        title="Pendaftaran santri baru"
        description="Lanjutkan formulir, lengkapi dokumen, dan pantau keputusan panitia dari satu halaman."
        actions={
          <>
            <ButtonLink href="/pendaftaran/form" size="sm" icon={<FileText className="h-4 w-4" />}>
              Lanjutkan Formulir
            </ButtonLink>
            <ButtonLink href="/cek-pendaftaran" variant="outline" size="sm">
              Cek Status
            </ButtonLink>
          </>
        }
      />

      <Stepper steps={ppdbSteps} current={current} />

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <SectionCard
            title="Status pendaftaran terkini"
            description="Data ini merupakan simulasi dan tersimpan di browser Anda."
            icon={<ClipboardList className="h-4 w-4" />}
          >
            {registration ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-500">Nomor pendaftaran</p>
                    <p className="font-mono text-lg font-bold text-slate-900">{registration.number}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{registration.studentName}</p>
                    <p className="text-xs text-slate-500">
                      Kelas {registration.level} · dikirim {formatDate(registration.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge status={registration.status} />
                </div>

                {registration.notes && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
                    <strong>Catatan panitia:</strong> {registration.notes}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <ProgressBar
                      label="Kelengkapan dokumen"
                      value={(uploaded / Math.max(1, total)) * 100}
                      hint={`${uploaded}/${total}`}
                      tone={uploaded === total ? "emerald" : "amber"}
                    />
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                    <p className="text-[11px] text-slate-500">Pembayaran pendaftaran</p>
                    <div className="mt-1">
                      <StatusBadge
                        status={
                          registration.paymentStatus === "lunas"
                            ? "lunas"
                            : registration.paymentStatus === "menunggu_verifikasi"
                              ? "menunggu_verifikasi"
                              : "belum_bayar"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href="/pendaftaran/dokumen" size="sm" variant="outline" icon={<Upload className="h-4 w-4" />}>
                    Lengkapi Dokumen
                  </ButtonLink>
                  <ButtonLink href="/pendaftaran/pembayaran" size="sm" variant="outline">
                    Unggah Bukti Bayar
                  </ButtonLink>
                  <ButtonLink href={`/cek-pendaftaran?number=${registration.number}`} size="sm">
                    Lihat Detail Status
                  </ButtonLink>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Belum ada pendaftaran yang tersimpan. Mulai formulir untuk membuat pendaftaran demo.
                </p>
                <ButtonLink href="/pendaftaran/form" className="mt-3">
                  Mulai Pendaftaran
                </ButtonLink>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Yang perlu disiapkan" description="Pastikan semua berkas tersedia sebelum verifikasi." icon={<FileText className="h-4 w-4" />}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Kartu Keluarga",
                "Akta Kelahiran",
                "Ijazah / Surat Keterangan Lulus",
                "Pas Foto 3x4",
                "KTP Wali",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Info className="h-4 w-4" aria-hidden /> Alur setelah dikirim
            </p>
            <ol className="mt-2 space-y-1.5">
              <li>1. Admin akademik memverifikasi data dan dokumen.</li>
              <li>2. Admin keuangan memverifikasi bukti transfer.</li>
              <li>3. Keputusan muncul pada halaman cek status.</li>
              <li>4. Jika diterima, ikuti instruksi daftar ulang.</li>
            </ol>
          </div>

          <SectionCard title="Kontak panitia" description="Kontak fiktif untuk demo.">
            <dl className="space-y-2 text-xs text-slate-600">
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
          </SectionCard>

          <Link
            href="/pendaftaran"
            className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-card hover:border-brand-300"
          >
            Panduan pendaftaran lengkap
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
