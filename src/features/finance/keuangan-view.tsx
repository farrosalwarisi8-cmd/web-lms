"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, FileText, Plus, Receipt, XCircle } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatRupiah, getClassName, todayISO } from "@/lib/utils";
import type { Payment } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select } from "@/components/ui/form";

export function KeuanganView() {
  const { state, verifyPayment, addTransaction, showToast } = useDemo();
  const [tab, setTab] = useState("verifikasi");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [trxOpen, setTrxOpen] = useState(false);
  const [savingTrx, setSavingTrx] = useState(false);

  const pending = state.payments.filter((payment) => payment.status === "menunggu");
  const unpaid = state.invoices.filter((invoice) => invoice.status !== "lunas");
  const totalPending = pending.reduce((sum, payment) => sum + payment.amount, 0);
  const totalUnpaid = unpaid.reduce((sum, invoice) => sum + invoice.amount - invoice.paidAmount, 0);

  async function approve() {
    if (!selected) return;
    setProcessing(true);
    await verifyPayment(selected.id, true);
    setProcessing(false);
    setConfirmApprove(false);
    setSelected(null);
  }

  async function reject() {
    if (!selected) return;
    setProcessing(true);
    await verifyPayment(selected.id, false, "Bukti transfer tidak sesuai. Mohon unggah ulang.");
    setProcessing(false);
    setSelected(null);
  }

  async function saveTransaction(formData: FormData) {
    const amount = Number(formData.get("amount") ?? 0);
    const description = String(formData.get("description") ?? "").trim();
    if (!amount || !description) {
      showToast("Transaksi belum lengkap", "error");
      return;
    }
    setSavingTrx(true);
    await addTransaction({
      type: String(formData.get("type")) === "keluar" ? "keluar" : "masuk",
      category: String(formData.get("category") ?? "Lainnya"),
      description,
      amount,
      method: String(formData.get("method") ?? "Transfer"),
    });
    setSavingTrx(false);
    setTrxOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan · Verifikasi & kas"
        title="Verifikasi pembayaran"
        description="Periksa bukti transfer, setujui atau tolak pembayaran, dan catat transaksi kas sekolah."
        actions={
          <>
            <ButtonLink href="/dashboard/tagihan" variant="outline" size="sm" icon={<Receipt className="h-4 w-4" />}>
              Buat Tagihan
            </ButtonLink>
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setTrxOpen(true)}>
              Catat Transaksi
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Menunggu verifikasi" value={pending.length} hint={formatRupiah(totalPending)} icon={Receipt} tone="amber" />
        <StatCard label="Tagihan belum lunas" value={unpaid.length} hint={formatRupiah(totalUnpaid)} icon={FileText} tone="rose" />
        <StatCard label="Total pembayaran diterima" value={state.payments.filter((payment) => payment.status === "diverifikasi").length} hint="Transaksi terverifikasi" icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-4 py-3">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "verifikasi", label: "Antrean verifikasi", count: pending.length },
              { value: "tagihan", label: "Tagihan belum lunas", count: unpaid.length },
              { value: "transaksi", label: "Transaksi", count: state.transactions.length },
            ]}
          />
        </div>

        {tab === "verifikasi" && (
          pending.length === 0 ? (
            <EmptyState title="Antrean verifikasi kosong" description="Semua pembayaran sudah diperiksa. Antrean baru akan muncul saat wali mengunggah bukti." icon={CheckCircle2} tone="info" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((payment) => {
                const student = state.students.find((item) => item.id === payment.studentId);
                const invoice = state.invoices.find((item) => item.id === payment.invoiceId);
                return (
                  <li key={payment.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{student?.name}</p>
                      <p className="text-xs text-slate-500">
                        {invoice?.description} · {formatRupiah(payment.amount)} · {payment.method}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Bukti: {payment.proofName} · dikirim {formatDate(payment.submittedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => setSelected(payment)} icon={<FileText className="h-3.5 w-3.5" />}>
                        Periksa
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {tab === "tagihan" && (
          unpaid.length === 0 ? (
            <EmptyState title="Tidak ada tunggakan" description="Semua tagihan pada periode ini sudah lunas." icon={CheckCircle2} tone="info" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <caption className="sr-only">Tagihan belum lunas</caption>
                <thead>
                  <tr>
                    <th scope="col">Santri</th>
                    <th scope="col">Tagihan</th>
                    <th scope="col">Jatuh tempo</th>
                    <th scope="col">Sisa</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaid.slice(0, 12).map((invoice) => {
                    const student = state.students.find((item) => item.id === invoice.studentId);
                    return (
                      <tr key={invoice.id}>
                        <td>
                          <p className="font-medium text-slate-800">{student?.name}</p>
                          <p className="text-[11px] text-slate-500">Kelas {getClassName(state, student?.classId)}</p>
                        </td>
                        <td>
                          <p>{invoice.periodLabel}</p>
                          <p className="font-mono text-[11px] text-slate-500">{invoice.number}</p>
                        </td>
                        <td className="text-xs text-slate-600">{formatDate(invoice.dueDate)}</td>
                        <td className="font-semibold text-slate-800">{formatRupiah(invoice.amount - invoice.paidAmount)}</td>
                        <td><StatusBadge status={invoice.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === "transaksi" && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <caption className="sr-only">Transaksi keuangan</caption>
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Jenis</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Keterangan</th>
                  <th scope="col" className="text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {state.transactions.slice(0, 15).map((trx) => (
                  <tr key={trx.id}>
                    <td className="whitespace-nowrap text-xs text-slate-500">{formatDate(trx.date)}</td>
                    <td>
                      <StatusBadge
                        label={trx.type === "masuk" ? "Pemasukan" : "Pengeluaran"}
                        tone={trx.type === "masuk" ? "success" : "danger"}
                      />
                    </td>
                    <td>{trx.category}</td>
                    <td className="max-w-xs truncate">{trx.description}</td>
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

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Periksa bukti pembayaran"
        description={selected ? state.students.find((item) => item.id === selected.studentId)?.name : undefined}
      >
        {selected && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileText className="h-4 w-4 text-brand-700" aria-hidden />
                {selected.proofName ?? "bukti-transfer.jpg"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Pratinjau file mock — tidak ada berkas nyata yang diunggah.</p>
              <div className="mt-3 grid h-32 place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-xs text-slate-400">
                Pratinjau bukti transfer (demo)
              </div>
            </div>
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Nominal</dt>
                <dd className="font-semibold text-slate-800">{formatRupiah(selected.amount)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Metode</dt>
                <dd className="font-semibold text-slate-800">{selected.method}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Dikirim</dt>
                <dd className="font-semibold text-slate-800">{formatDate(selected.submittedAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Catatan</dt>
                <dd className="text-slate-700">{selected.note ?? "—"}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="text-rose-700" icon={<XCircle className="h-4 w-4" />} loading={processing} onClick={reject}>
                Tolak
              </Button>
              <Button icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setConfirmApprove(true)}>
                Setujui Pembayaran
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmApprove}
        title="Setujui pembayaran ini?"
        description="Status tagihan wali akan berubah menjadi Lunas atau Dibayar Sebagian, dan notifikasi demo dikirim."
        confirmLabel="Ya, Setujui"
        loading={processing}
        onConfirm={approve}
        onCancel={() => setConfirmApprove(false)}
      />

      <Modal open={trxOpen} onClose={() => setTrxOpen(false)} title="Catat transaksi kas" description="Transaksi demo akan muncul pada laporan keuangan.">
        <form action={saveTransaction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Jenis" htmlFor="trx-type">
              <Select id="trx-type" name="type" defaultValue="masuk">
                <option value="masuk">Pemasukan</option>
                <option value="keluar">Pengeluaran</option>
              </Select>
            </Field>
            <Field label="Kategori" htmlFor="trx-category">
              <Select id="trx-category" name="category" defaultValue="SPP">
                <option value="SPP">SPP</option>
                <option value="PPDB">PPDB</option>
                <option value="Donasi">Donasi</option>
                <option value="Operasional">Operasional</option>
                <option value="Gaji">Gaji</option>
                <option value="Kegiatan">Kegiatan</option>
              </Select>
            </Field>
          </div>
          <Field label="Keterangan" htmlFor="trx-description" required>
            <Input id="trx-description" name="description" placeholder="Contoh: Pembayaran SPP tunai" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nominal" htmlFor="trx-amount" required>
              <Input id="trx-amount" name="amount" type="number" min={1000} defaultValue={500000} />
            </Field>
            <Field label="Metode" htmlFor="trx-method">
              <Select id="trx-method" name="method" defaultValue="Transfer">
                <option value="Transfer">Transfer</option>
                <option value="Tunai">Tunai</option>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setTrxOpen(false)}>Batal</Button>
            <Button type="submit" loading={savingTrx}>Simpan Transaksi</Button>
          </div>
        </form>
      </Modal>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        Tanggal transaksi demo mengikuti tanggal simulasi: {formatDate(todayISO())}.
      </p>
    </div>
  );
}
