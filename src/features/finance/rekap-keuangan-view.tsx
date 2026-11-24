"use client";

import { Download, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatRupiah, getClassName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";

const months = [
  { key: "2026-09", label: "September 2026" },
  { key: "2026-10", label: "Oktober 2026" },
  { key: "2026-11", label: "November 2026" },
];

export function RekapKeuanganView() {
  const { state, showToast } = useDemo();
  const arrears = state.students
    .map((student) => {
      const invoices = state.invoices.filter(
        (invoice) => invoice.studentId === student.id && invoice.status !== "lunas"
      );
      const total = invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paidAmount, 0);
      return { student, invoices, total };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
  const totalArrears = arrears.reduce((sum, item) => sum + item.total, 0);
  const totalIncome = state.transactions.filter((trx) => trx.type === "masuk").reduce((sum, trx) => sum + trx.amount, 0);
  const totalExpense = state.transactions.filter((trx) => trx.type === "keluar").reduce((sum, trx) => sum + trx.amount, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan · Rekap"
        title="Rekap keuangan & tunggakan"
        description="Ringkasan arus kas per bulan dan daftar santri dengan tunggakan SPP."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={() => showToast("Rekap Excel demo siap diunduh", "success", "Simulasi ekspor data keuangan.")}
          >
            Unduh Rekap (demo)
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total pemasukan" value={formatRupiah(totalIncome)} hint="Semua periode demo" icon={TrendingUp} tone="emerald" />
        <StatCard label="Total pengeluaran" value={formatRupiah(totalExpense)} hint="Semua periode demo" icon={TrendingDown} tone="rose" />
        <StatCard label="Saldo bersih" value={formatRupiah(totalIncome - totalExpense)} hint="Pemasukan − pengeluaran" icon={Wallet} tone="brand" />
        <StatCard label="Total tunggakan" value={formatRupiah(totalArrears)} hint={`${arrears.length} santri`} icon={Receipt} tone="amber" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Arus kas per bulan" description="Pemasukan, pengeluaran, dan saldo bersih.">
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Arus kas bulanan</caption>
              <thead>
                <tr>
                  <th scope="col">Bulan</th>
                  <th scope="col" className="text-right">Masuk</th>
                  <th scope="col" className="text-right">Keluar</th>
                  <th scope="col" className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => {
                  const trx = state.transactions.filter((item) => item.date.startsWith(month.key));
                  const income = trx.filter((item) => item.type === "masuk").reduce((sum, item) => sum + item.amount, 0);
                  const expense = trx.filter((item) => item.type === "keluar").reduce((sum, item) => sum + item.amount, 0);
                  return (
                    <tr key={month.key}>
                      <td className="font-medium text-slate-800">{month.label}</td>
                      <td className="text-right text-emerald-700">{formatRupiah(income)}</td>
                      <td className="text-right text-rose-700">{formatRupiah(expense)}</td>
                      <td className={`text-right font-semibold ${income - expense >= 0 ? "text-slate-900" : "text-rose-700"}`}>
                        {formatRupiah(income - expense)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Tunggakan per santri" description="Diurutkan dari jumlah terbesar." bodyClassName="p-0">
          {arrears.length === 0 ? (
            <EmptyState title="Tidak ada tunggakan" description="Semua tagihan santri sudah lunas." icon={Wallet} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {arrears.slice(0, 8).map((item) => (
                <li key={item.student.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{item.student.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Kelas {getClassName(state, item.student.classId)} · {item.invoices.length} tagihan
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-700">{formatRupiah(item.total)}</p>
                      <StatusBadge status="belum_bayar" label="Tunggakan" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">Kolektabilitas tagihan</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ProgressBar
            label="Tagihan lunas"
            value={
              (state.invoices.filter((invoice) => invoice.status === "lunas").length /
                Math.max(1, state.invoices.length)) *
              100
            }
            tone="emerald"
          />
          <ProgressBar
            label="Menunggu verifikasi"
            value={
              (state.invoices.filter((invoice) => invoice.status === "menunggu_verifikasi").length /
                Math.max(1, state.invoices.length)) *
              100
            }
            tone="amber"
          />
        </div>
      </div>
    </div>
  );
}
