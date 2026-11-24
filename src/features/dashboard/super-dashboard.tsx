"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Mail,
  Receipt,
  School,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatRupiah } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { PriorityCard, QuickLink } from "@/components/ui/priority-card";

export function SuperDashboard() {
  const { state } = useDemo();
  const pendingPayments = state.payments.filter((payment) => payment.status === "menunggu");
  const pendingRegs = state.registrations.filter(
    (registration) => registration.status === "menunggu_verifikasi"
  );
  const failedEmails = state.outboxEmails.filter((email) => email.status === "gagal");
  const november = state.transactions.filter((trx) => trx.date.startsWith("2026-11"));
  const income = november.filter((trx) => trx.type === "masuk").reduce((sum, trx) => sum + trx.amount, 0);
  const expense = november.filter((trx) => trx.type === "keluar").reduce((sum, trx) => sum + trx.amount, 0);
  const rejected = state.payments.filter((payment) => payment.status === "ditolak");
  const missingDocs = state.students.filter((student) => {
    const docs = state.documents.filter((doc) => doc.studentId === student.id);
    return docs.length < 5;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin · Ringkasan sistem"
        title="Ringkasan sistem"
        description="Pantau kesehatan akademik, pendaftaran, dan keuangan lintas area kerja dalam satu layar."
        actions={
          <>
            <ButtonLink href="/dashboard/akademik" size="sm" icon={<School className="h-4 w-4" />}>
              Area Akademik
            </ButtonLink>
            <ButtonLink href="/dashboard/email-outbox" variant="outline" size="sm" icon={<Mail className="h-4 w-4" />}>
              Email Outbox
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Siswa & guru aktif" value={`${state.students.length} / ${state.teachers.length}`} hint={`${state.classes.length} kelas berjalan`} icon={Users} tone="blue" href="/dashboard/akademik" />
        <StatCard label="Pendaftar perlu keputusan" value={pendingRegs.length} hint={`${state.registrations.length} total pendaftar`} icon={ClipboardCheck} tone={pendingRegs.length ? "amber" : "emerald"} href="/dashboard/verifikasi-pendaftaran" />
        <StatCard label="Pembayaran menunggu" value={pendingPayments.length} hint="Lintas area keuangan" icon={Receipt} tone={pendingPayments.length ? "amber" : "emerald"} href="/dashboard/keuangan" />
        <StatCard label="Email gagal terkirim" value={failedEmails.length} hint={`${state.outboxEmails.length} email di outbox`} icon={Mail} tone={failedEmails.length ? "rose" : "emerald"} href="/dashboard/email-outbox" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard title="Akademik" description="Kondisi data master dan proses belajar." icon={<BookOpen className="h-4 w-4" />} action={<Link href="/dashboard/akademik" className="text-xs font-semibold text-brand-700 hover:underline">Buka</Link>}>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-600">Siswa aktif</dt>
              <dd className="font-semibold text-slate-900">{state.students.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-600">Guru aktif</dt>
              <dd className="font-semibold text-slate-900">{state.teachers.length}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-600">Tugas dipublikasikan</dt>
              <dd className="font-semibold text-slate-900">
                {state.tasks.filter((task) => task.status === "published").length}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-600">Ujian aktif</dt>
              <dd className="font-semibold text-slate-900">
                {state.exams.filter((exam) => exam.published && exam.status === "aktif").length}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-600">Rapor terbit</dt>
              <dd className="font-semibold text-slate-900">
                {state.reportCards.filter((card) => card.status === "published").length} / {state.reportCards.length}
              </dd>
            </div>
          </dl>
          <ButtonLink href="/dashboard/rapor" variant="outline" size="sm" className="mt-3 w-full">
            Pantau rapor
          </ButtonLink>
        </SectionCard>

        <SectionCard title="Pendaftaran" description="Status antrean PPDB." icon={<ClipboardCheck className="h-4 w-4" />} action={<Link href="/dashboard/verifikasi-pendaftaran" className="text-xs font-semibold text-brand-700 hover:underline">Buka</Link>}>
          <ul className="space-y-2">
            {[
              { status: "menunggu_verifikasi", label: "Menunggu verifikasi" },
              { status: "menunggu_pembayaran", label: "Menunggu pembayaran" },
              { status: "perlu_perbaikan", label: "Perlu perbaikan" },
              { status: "diterima", label: "Diterima" },
              { status: "ditolak", label: "Ditolak" },
            ].map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-2">
                <StatusBadge status={item.status} />
                <span className="text-sm font-semibold text-slate-800">
                  {state.registrations.filter((registration) => registration.status === item.status).length}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Keuangan" description="Ringkasan arus kas bulan berjalan." icon={<CreditCard className="h-4 w-4" />} action={<Link href="/dashboard/keuangan" className="text-xs font-semibold text-brand-700 hover:underline">Buka</Link>}>
          <div className="space-y-2.5">
            <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-inset ring-emerald-200">
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Pemasukan November
              </p>
              <p className="text-sm font-bold text-emerald-900">{formatRupiah(income)}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 ring-1 ring-inset ring-rose-200">
              <p className="flex items-center gap-1.5 text-[11px] text-rose-800">
                <TrendingDown className="h-3.5 w-3.5" aria-hidden /> Pengeluaran November
              </p>
              <p className="text-sm font-bold text-rose-900">{formatRupiah(expense)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
              <p className="text-[11px] text-slate-500">Saldo bersih</p>
              <p className={`text-sm font-bold ${income - expense >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {formatRupiah(income - expense)}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Masalah akses atau data" description="Temuan yang perlu ditindaklanjuti super admin." icon={<AlertTriangle className="h-4 w-4" />}>
          <div className="space-y-2.5">
            {failedEmails.length > 0 && (
              <PriorityCard
                icon={Mail}
                title={`${failedEmails.length} email outbox gagal terkirim`}
                description={failedEmails[0].error ?? "Periksa alamat email dan lampiran pada outbox."}
                actionLabel="Periksa outbox"
                href="/dashboard/email-outbox"
                tone="danger"
              />
            )}
            {rejected.length > 0 && (
              <PriorityCard
                icon={Receipt}
                title={`${rejected.length} pembayaran ditolak`}
                description="Pastikan wali menerima notifikasi untuk mengunggah ulang bukti transfer."
                actionLabel="Buka keuangan"
                href="/dashboard/keuangan"
                tone="warning"
              />
            )}
            {missingDocs.length > 0 && (
              <PriorityCard
                icon={ShieldCheck}
                title={`${missingDocs.length} siswa dengan berkas belum lengkap`}
                description={`Antara lain ${missingDocs[0].name}. Lengkapi data untuk kelancaran administrasi.`}
                actionLabel="Kelola siswa"
                href="/dashboard/siswa"
                tone="info"
              />
            )}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Quick switch area kerja" description="Pindah konteks tanpa logout.">
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/dashboard/akademik" label="Akademik" icon={School} />
              <QuickLink href="/dashboard/verifikasi-pendaftaran" label="Pendaftaran" icon={ClipboardCheck} />
              <QuickLink href="/dashboard/keuangan" label="Keuangan" icon={Receipt} />
              <QuickLink href="/dashboard/email-outbox" label="Email Outbox" icon={Mail} />
            </div>
          </SectionCard>
          <ButtonLink href="/dashboard/pengaturan" variant="outline" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
            Pengaturan sistem demo
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
