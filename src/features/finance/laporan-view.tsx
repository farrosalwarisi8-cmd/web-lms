"use client";

import { useState } from "react";
import { Download, Printer, TrendingDown, TrendingUp } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatRupiah } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { SectionCard } from "@/components/ui/section-card";
import { SimpleBarChart } from "@/components/ui/simple-bar-chart";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export function LaporanView() {
  const { state, showToast } = useDemo();
  const [period, setPeriod] = useState("2026-11");

  const filtered = state.transactions.filter((trx) => (period === "semua" ? true : trx.date.startsWith(period)));
  const income = filtered.filter((trx) => trx.type === "masuk").reduce((sum, trx) => sum + trx.amount, 0);
  const expense = filtered.filter((trx) => trx.type === "keluar").reduce((sum, trx) => sum + trx.amount, 0);

  const chart = ["2026-09", "2026-10", "2026-11"].map((month) => {
    const trx = state.transactions.filter((item) => item.date.startsWith(month));
    return {
      label: month === "2026-09" ? "Sep" : month === "2026-10" ? "Okt" : "Nov",
      value: trx.filter((item) => item.type === "masuk").reduce((sum, item) => sum + item.amount, 0),
      secondaryValue: trx.filter((item) => item.type === "keluar").reduce((sum, item) => sum + item.amount, 0),
    };
  });

  const categories = Array.from(
    filtered.reduce((map, trx) => {
      const key = `${trx.type}-${trx.category}`;
      map.set(key, (map.get(key) ?? 0) + trx.amount);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan · Laporan"
        title="Laporan keuangan"
        description="Analisis pemasukan dan pengeluaran per kategori untuk kebutuhan rapat dan evaluasi."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="h-4 w-4" />}
              onClick={() => showToast("Laporan PDF demo siap diunduh", "success", "Simulasi cetak laporan keuangan.")}
            >
              Cetak
            </Button>
            <Button
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => showToast("Data laporan demo diekspor", "success", "Simulasi ekspor CSV keuangan.")}
            >
              Ekspor
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-xs rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="report-period" className="label-base">Periode laporan</label>
        <Select id="report-period" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="2026-11">November 2026</option>
          <option value="2026-10">Oktober 2026</option>
          <option value="2026-09">September 2026</option>
          <option value="semua">Semua periode demo</option>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Pemasukan" value={formatRupiah(income)} hint={`${filtered.filter((trx) => trx.type === "masuk").length} transaksi`} icon={TrendingUp} tone="emerald" />
        <StatCard label="Pengeluaran" value={formatRupiah(expense)} hint={`${filtered.filter((trx) => trx.type === "keluar").length} transaksi`} icon={TrendingDown} tone="rose" />
        <StatCard label="Saldo bersih" value={formatRupiah(income - expense)} hint="Selisih periode terpilih" icon={TrendingUp} tone="brand" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Tren arus kas" description="Pemasukan dan pengeluaran tiga bulan terakhir.">
          <SimpleBarChart data={chart} height={190} />
        </SectionCard>
        <SectionCard title="Rincian per kategori" description="Berdasarkan periode yang dipilih.">
          {categories.length === 0 ? (
            <EmptyState title="Tidak ada transaksi" description="Belum ada transaksi pada periode ini." />
          ) : (
            <div className="space-y-3">
              {categories.map(([key, value]) => {
                const [type, category] = key.split("-");
                return (
                  <ProgressBar
                    key={key}
                    label={`${category} · ${type === "masuk" ? "Pemasukan" : "Pengeluaran"}`}
                    value={(value / Math.max(income, expense, 1)) * 100}
                    hint={formatRupiah(value)}
                    tone={type === "masuk" ? "emerald" : "rose"}
                  />
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Detail transaksi</h2>
          <span className="text-xs text-slate-500">{filtered.length} baris</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title="Tidak ada transaksi" description="Ubah periode atau catat transaksi baru melalui menu Keuangan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Detail transaksi keuangan</caption>
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Keterangan</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Metode</th>
                  <th scope="col">Jenis</th>
                  <th scope="col" className="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trx) => (
                  <tr key={trx.id}>
                    <td className="whitespace-nowrap text-xs text-slate-500">{formatDate(trx.date)}</td>
                    <td className="max-w-xs truncate font-medium text-slate-800">{trx.description}</td>
                    <td>{trx.category}</td>
                    <td className="text-xs text-slate-500">{trx.method ?? "—"}</td>
                    <td>
                      <StatusBadge
                        label={trx.type === "masuk" ? "Pemasukan" : "Pengeluaran"}
                        tone={trx.type === "masuk" ? "success" : "danger"}
                      />
                    </td>
                    <td className={`text-right font-semibold ${trx.type === "masuk" ? "text-emerald-700" : "text-rose-700"}`}>
                      {trx.type === "masuk" ? "+" : "−"}{formatRupiah(trx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
