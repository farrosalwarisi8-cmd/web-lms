"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatRupiah, formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { PriorityCard, QuickLink } from "@/components/ui/priority-card";
import { SimpleBarChart } from "@/components/ui/simple-bar-chart";
import { EmptyState } from "@/components/ui/empty-state";

export function FinanceDashboard() {
  const { state } = useDemo();
  const pendingPayments = state.payments.filter((payment) => payment.status === "menunggu");
  const unpaidInvoices = state.invoices.filter(
    (invoice) => invoice.status === "belum_bayar" || invoice.status === "ditolak"
  );
  const totalUnpaid = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paidAmount, 0);

  const november = state.transactions.filter((trx) => trx.date.startsWith("2026-11"));
  const income = november.filter((trx) => trx.type === "masuk").reduce((sum, trx) => sum + trx.amount, 0);
  const expense = november.filter((trx) => trx.type === "keluar").reduce((sum, trx) => sum + trx.amount, 0);

  const chart = ["2026-09", "2026-10", "2026-11"].map((month) => {
    const monthTrx = state.transactions.filter((trx) => trx.date.startsWith(month));
    return {
      label: month === "2026-09" ? "Sep" : month === "2026-10" ? "Okt" : "Nov",
      value: monthTrx.filter((trx) => trx.type === "masuk").reduce((sum, trx) => sum + trx.amount, 0),
      secondaryValue: monthTrx.filter((trx) => trx.type === "keluar").reduce((sum, trx) => sum + trx.amount, 0),
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Area kerja: Keuangan"
        title="Kontrol keuangan sekolah"
        description="Verifikasi pembayaran, pantau tunggakan, dan jaga arus kas bulan berjalan."
        actions={
          <>
            <ButtonLink href="/dashboard/keuangan" size="sm" icon={<Receipt className="h-4 w-4" />}>
              Verifikasi Pembayaran
            </ButtonLink>
            <ButtonLink href="/dashboard/tagihan" variant="outline" size="sm" icon={<CreditCard className="h-4 w-4" />}>
              Buat Tagihan
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pembayaran menunggu" value={pendingPayments.length} hint="Perlu diverifikasi hari ini" icon={Receipt} tone={pendingPayments.length ? "amber" : "emerald"} href="/dashboard/keuangan" />
        <StatCard label="Pemasukan November" value={formatRupiah(income)} hint="SPP, PPDB, dan donasi" icon={TrendingUp} tone="emerald" href="/dashboard/laporan" />
        <StatCard label="Pengeluaran November" value={formatRupiah(expense)} hint="Operasional dan honor" icon={TrendingDown} tone="rose" href="/dashboard/laporan" />
        <StatCard label="Tunggakan aktif" value={formatRupiah(totalUnpaid)} hint={`${unpaidInvoices.length} tagihan belum lunas`} icon={Wallet} tone="amber" href="/dashboard/rekap-keuangan" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <SectionCard title="Perlu tindakan" description="Antrean yang memengaruhi status tagihan wali." icon={<Receipt className="h-4 w-4" />}>
            <div className="space-y-2.5">
              <PriorityCard
                icon={Receipt}
                title={`${pendingPayments.length} pembayaran menunggu verifikasi`}
                description="Periksa nominal, bukti transfer, dan kecocokan tagihan sebelum menyetujui."
                actionLabel="Buka antrean"
                href="/dashboard/keuangan"
                tone={pendingPayments.length > 4 ? "danger" : "warning"}
                meta="Antrean kasir"
              />
              {unpaidInvoices[0] && (
                <PriorityCard
                  icon={Wallet}
                  title={`${unpaidInvoices.length} tagihan belum lunas`}
                  description={`Total tunggakan ${formatRupiah(totalUnpaid)}. Kirim pengingat simulasi ke wali.`}
                  actionLabel="Lihat tunggakan"
                  href="/dashboard/rekap-keuangan"
                  tone="info"
                />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Arus kas 3 bulan" description="Perbandingan pemasukan dan pengeluaran." icon={<BarChart3 className="h-4 w-4" />}>
            <SimpleBarChart data={chart} height={180} />
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                <p className="text-[11px] text-slate-500">Saldo bersih November</p>
                <p className={`text-sm font-bold ${income - expense >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {formatRupiah(income - expense)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                <p className="text-[11px] text-slate-500">Transaksi November</p>
                <p className="text-sm font-bold text-slate-800">{november.length} transaksi</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                <p className="text-[11px] text-slate-500">Tagihan lunas</p>
                <p className="text-sm font-bold text-slate-800">
                  {state.invoices.filter((invoice) => invoice.status === "lunas").length}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Pembayaran terbaru"
            description="Termasuk yang sudah diverifikasi dan ditolak."
            icon={<Receipt className="h-4 w-4" />}
            action={<Link href="/dashboard/keuangan" className="text-xs font-semibold text-brand-700 hover:underline">Kelola</Link>}
            bodyClassName="p-0"
          >
            {state.payments.length === 0 ? (
              <EmptyState title="Belum ada pembayaran" description="Bukti pembayaran dari wali akan tampil di sini." icon={Receipt} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {state.payments.slice(0, 5).map((payment) => {
                  const student = state.students.find((item) => item.id === payment.studentId);
                  return (
                    <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{student?.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatRupiah(payment.amount)} · {formatShortDate(payment.submittedAt)}
                        </p>
                      </div>
                      <StatusBadge status={payment.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Aksi cepat" description="Menu utama area keuangan.">
            <div className="grid grid-cols-2 gap-2">
              <QuickLink href="/dashboard/keuangan" label="Verifikasi" icon={Receipt} />
              <QuickLink href="/dashboard/tagihan" label="Buat Tagihan" icon={CreditCard} />
              <QuickLink href="/dashboard/kasir" label="Kasir" icon={Wallet} />
              <QuickLink href="/dashboard/rekap-keuangan" label="Rekap & Tunggakan" icon={BarChart3} />
              <QuickLink href="/dashboard/laporan" label="Laporan" icon={TrendingUp} />
              <QuickLink href="/dashboard/kelola-akun-keuangan" label="Akun Keuangan" icon={Receipt} />
            </div>
          </SectionCard>

          <SectionCard title="Tagihan belum lunas" description="Prioritas penagihan SPP." bodyClassName="p-0">
            {unpaidInvoices.length === 0 ? (
              <EmptyState title="Semua tagihan lunas" description="Tidak ada tunggakan pada periode ini." icon={Wallet} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {unpaidInvoices.slice(0, 5).map((invoice) => {
                  const student = state.students.find((item) => item.id === invoice.studentId);
                  return (
                    <li key={invoice.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-800">{student?.name}</p>
                        <p className="text-[11px] text-slate-500">{invoice.periodLabel} · jatuh tempo {formatDate(invoice.dueDate)}</p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-rose-700">
                        {formatRupiah(invoice.amount - invoice.paidAmount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
          <ButtonLink href="/dashboard/laporan" variant="outline" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
            Buka laporan keuangan
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
