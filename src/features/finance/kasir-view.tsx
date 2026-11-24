"use client";

import { useState } from "react";
import { CheckCircle2, Receipt, Wallet } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatRupiah, getClassName } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export function KasirView() {
  const { state, recordCashPayment, showToast } = useDemo();
  const unpaid = state.invoices.filter((invoice) => invoice.status !== "lunas");
  const [invoiceId, setInvoiceId] = useState(unpaid[0]?.id ?? "");
  const [amount, setAmount] = useState(unpaid[0] ? String(unpaid[0].amount - unpaid[0].paidAmount) : "");
  const [processing, setProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{ number: string; name: string; amount: number } | null>(null);

  const invoice = state.invoices.find((item) => item.id === invoiceId);
  const student = state.students.find((item) => item.id === invoice?.studentId);
  const cashPayments = state.payments.filter((payment) => payment.method === "Tunai");
  const totalCash = cashPayments.reduce((sum, payment) => sum + payment.amount, 0);

  async function process() {
    const value = Number(amount);
    if (!invoice || !value || value <= 0) {
      showToast("Nominal belum valid", "error", "Masukkan nominal pembayaran lebih dari nol.");
      return;
    }
    setProcessing(true);
    await recordCashPayment(invoice.id, value);
    setProcessing(false);
    setLastReceipt({ number: invoice.number, name: student?.name ?? "Santri", amount: value });
    setAmount("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan · Kasir"
        title="Kasir pembayaran"
        description="Terima pembayaran tunai di sekolah, catat transaksi, dan perbarui status tagihan secara langsung."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast("Kwitansi demo siap dicetak", "success", "Simulasi cetak kwitansi kasir.")}
          >
            Cetak Kwitansi Terakhir
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tagihan belum lunas" value={unpaid.length} hint="Siap dibayar di kasir" icon={Receipt} tone="amber" />
        <StatCard label="Pembayaran tunai" value={cashPayments.length} hint="Tercatat pada demo" icon={Wallet} tone="blue" />
        <StatCard label="Total tunai" value={formatRupiah(totalCash)} hint="Termasuk transaksi simulasi" icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-base font-bold text-slate-900">Proses pembayaran</h2>
          <p className="mt-1 text-xs text-slate-500">Pilih tagihan yang akan dibayar tunai di kasir.</p>
          {unpaid.length === 0 ? (
            <EmptyState title="Tidak ada tagihan" description="Semua tagihan sudah lunas. Pembayaran baru dapat dilakukan setelah tagihan dibuat." icon={Wallet} />
          ) : (
            <div className="mt-4 space-y-3">
              <Field label="Tagihan" htmlFor="cash-invoice">
                <Select
                  id="cash-invoice"
                  value={invoiceId}
                  onChange={(event) => {
                    setInvoiceId(event.target.value);
                    const selected = state.invoices.find((item) => item.id === event.target.value);
                    setAmount(selected ? String(selected.amount - selected.paidAmount) : "");
                  }}
                >
                  {unpaid.map((item) => {
                    const itemStudent = state.students.find((s) => s.id === item.studentId);
                    return (
                      <option key={item.id} value={item.id}>
                        {item.number} — {itemStudent?.name} — {formatRupiah(item.amount - item.paidAmount)}
                      </option>
                    );
                  })}
                </Select>
              </Field>

              {invoice && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{student?.name}</p>
                  <p>Kelas {getClassName(state, student?.classId)} · {invoice.description}</p>
                  <p>Jatuh tempo {formatDate(invoice.dueDate)}</p>
                  <p className="mt-1">Sisa tagihan: <strong>{formatRupiah(invoice.amount - invoice.paidAmount)}</strong></p>
                  <div className="mt-1"><StatusBadge status={invoice.status} /></div>
                </div>
              )}

              <Field label="Nominal diterima (Rp)" htmlFor="cash-amount" required>
                <Input id="cash-amount" type="number" min={1000} value={amount} onChange={(event) => setAmount(event.target.value)} />
              </Field>
              <Button fullWidth loading={processing} onClick={process} icon={<Wallet className="h-4 w-4" />}>
                Proses Pembayaran Tunai
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {lastReceipt && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Kwitansi demo
              </p>
              <dl className="mt-2 space-y-1 text-xs text-emerald-900">
                <div className="flex justify-between gap-2"><dt>Nomor</dt><dd className="font-mono">{lastReceipt.number}</dd></div>
                <div className="flex justify-between gap-2"><dt>Santri</dt><dd>{lastReceipt.name}</dd></div>
                <div className="flex justify-between gap-2"><dt>Nominal</dt><dd className="font-semibold">{formatRupiah(lastReceipt.amount)}</dd></div>
                <div className="flex justify-between gap-2"><dt>Tanggal</dt><dd>{formatDate("2026-11-24")}</dd></div>
              </dl>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold text-slate-900">Pembayaran tunai terakhir</h2>
            {cashPayments.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">Belum ada pembayaran tunai pada demo ini.</p>
            ) : (
              <ul className="mt-2 divide-y divide-slate-100">
                {cashPayments.slice(0, 5).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-2 py-2 text-xs">
                    <div>
                      <p className="font-medium text-slate-800">
                        {state.students.find((item) => item.id === payment.studentId)?.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{formatDate(payment.submittedAt)}</p>
                    </div>
                    <span className="font-semibold text-slate-700">{formatRupiah(payment.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
