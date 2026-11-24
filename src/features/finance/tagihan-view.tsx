"use client";

import { useMemo, useState } from "react";
import { CreditCard, Plus, Receipt, Upload, Info } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatRupiah, getClassName } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { MockFileUpload } from "@/components/ui/mock-file-upload";
import { ProgressBar } from "@/components/ui/progress-bar";

export function TagihanView() {
  const { state, uploadPaymentProof, createInvoice, showToast } = useDemo();
  const role = state.activeRole;
  const isParent = role === "orang_tua";
  const canCreate = role === "admin_keuangan" || role === "super_admin";
  const child = state.students.find((item) => item.id === state.activeChildId);
  const [tab, setTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [proof, setProof] = useState("");
  const [method, setMethod] = useState<"Transfer BSI" | "Transfer Mandiri" | "Tunai">("Transfer BSI");
  const [payingLoading, setPayingLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const invoices = useMemo(() => {
    let items = state.invoices;
    if (isParent) items = items.filter((invoice) => invoice.studentId === child?.id);
    if (tab !== "semua") items = items.filter((invoice) => invoice.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((invoice) => {
        const student = state.students.find((item) => item.id === invoice.studentId);
        return (
          invoice.number.toLowerCase().includes(q) ||
          student?.name.toLowerCase().includes(q) ||
          invoice.periodLabel.toLowerCase().includes(q)
        );
      });
    }
    return items;
  }, [state.invoices, state.students, isParent, child?.id, tab, search]);

  const scopeInvoices = isParent
    ? state.invoices.filter((invoice) => invoice.studentId === child?.id)
    : state.invoices;
  const totalBill = scopeInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = scopeInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const outstanding = scopeInvoices
    .filter((invoice) => invoice.status !== "lunas")
    .reduce((sum, invoice) => sum + invoice.amount - invoice.paidAmount, 0);

  async function handlePay() {
    if (!paying || !proof) return;
    setPayingLoading(true);
    await uploadPaymentProof({
      invoiceId: paying.id,
      amount: paying.amount - paying.paidAmount,
      method,
      fileName: proof,
    });
    setPayingLoading(false);
    setPaying(null);
    setProof("");
  }

  async function handleCreate(formData: FormData) {
    const studentId = String(formData.get("studentId") ?? "");
    const amount = Number(formData.get("amount") ?? 0);
    const periodLabel = String(formData.get("periodLabel") ?? "Desember 2026");
    if (!studentId || !amount) {
      showToast("Data tagihan belum lengkap", "error");
      return;
    }
    setCreating(true);
    await createInvoice({
      studentId,
      type: "spp",
      periodLabel,
      description: `SPP bulan ${periodLabel}`,
      amount,
      dueDate: String(formData.get("dueDate") ?? "2026-12-10"),
    });
    setCreating(false);
    setCreateOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow={isParent ? `${child?.name ?? "Anak"} · Tagihan` : "Keuangan · Tagihan"}
        title="Tagihan SPP"
        description={
          isParent
            ? "Lihat tagihan aktif, unggah bukti transfer simulasi, dan pantau status verifikasi."
            : "Kelola tagihan santri dan pantau status pembayaran serta tunggakan."
        }
        actions={
          canCreate ? (
            <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Buat Tagihan
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total tagihan" value={formatRupiah(totalBill)} hint={`${scopeInvoices.length} tagihan`} icon={Receipt} tone="slate" />
        <StatCard label="Sudah dibayar" value={formatRupiah(totalPaid)} hint="Termasuk menunggu verifikasi" icon={CreditCard} tone="emerald" />
        <StatCard label="Sisa tagihan" value={formatRupiah(outstanding)} hint="Belum lunas" icon={CreditCard} tone={outstanding ? "rose" : "emerald"} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder={isParent ? "Cari tagihan..." : "Cari nama santri atau nomor tagihan..."}
          right={
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "semua", label: "Semua" },
                { value: "belum_bayar", label: "Belum bayar" },
                { value: "menunggu_verifikasi", label: "Menunggu" },
                { value: "lunas", label: "Lunas" },
                { value: "ditolak", label: "Ditolak" },
              ]}
            />
          }
        />

        {invoices.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Tidak ada tagihan"
            description={
              isParent
                ? "Tidak ada tagihan pada filter ini. Tagihan baru akan muncul di sini."
                : "Belum ada tagihan yang dibuat untuk filter ini."
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.map((invoice) => {
              const student = state.students.find((item) => item.id === invoice.studentId);
              const remaining = invoice.amount - invoice.paidAmount;
              return (
                <li key={invoice.id} className="px-4 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{invoice.description}</h2>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-mono">{invoice.number}</span> · {student?.name} · Kelas{" "}
                        {getClassName(state, student?.classId)} · jatuh tempo {formatDate(invoice.dueDate)}
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="font-bold text-slate-900">{formatRupiah(invoice.amount)}</span>
                        {invoice.paidAmount > 0 && (
                          <span className="ml-2 text-xs text-slate-500">
                            dibayar {formatRupiah(invoice.paidAmount)}
                          </span>
                        )}
                      </p>
                      <ProgressBar
                        value={(invoice.paidAmount / invoice.amount) * 100}
                        tone={invoice.status === "lunas" ? "emerald" : invoice.status === "ditolak" ? "rose" : "brand"}
                        className="mt-2 max-w-xs"
                      />
                      {invoice.status === "ditolak" && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-700">
                          <Info className="h-3.5 w-3.5" aria-hidden />
                          Bukti pembayaran ditolak. Mohon unggah ulang bukti yang lebih jelas.
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {isParent && invoice.status !== "lunas" && invoice.status !== "menunggu_verifikasi" && (
                        <Button
                          size="sm"
                          icon={<Upload className="h-4 w-4" />}
                          onClick={() => {
                            setPaying(invoice);
                            setProof("");
                          }}
                        >
                          Unggah Bukti
                        </Button>
                      )}
                      {isParent && invoice.status === "menunggu_verifikasi" && (
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                          Menunggu verifikasi admin
                        </span>
                      )}
                      {!isParent && (
                        <span className="text-xs text-slate-500">
                          Sisa {formatRupiah(Math.max(0, remaining))}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title="Unggah bukti pembayaran"
        description={paying ? `${paying.description} · ${formatRupiah(paying.amount - paying.paidAmount)}` : undefined}
      >
        {paying && (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
              <p>Nomor tagihan: <span className="font-mono">{paying.number}</span></p>
              <p>Jatuh tempo: {formatDate(paying.dueDate)}</p>
              <p>Bank tujuan: BSI 7000-1234-56 (simulasi)</p>
            </div>
            <Field label="Metode pembayaran" htmlFor="pay-method">
              <Select id="pay-method" value={method} onChange={(event) => setMethod(event.target.value as typeof method)}>
                <option value="Transfer BSI">Transfer BSI</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Tunai">Tunai</option>
              </Select>
            </Field>
            <MockFileUpload
              label="Bukti transfer"
              hint="Gambar atau PDF simulasi. Tidak dikirim ke server."
              value={proof || undefined}
              onChange={(name) => setProof(name ?? "")}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setPaying(null)}>Batal</Button>
              <Button loading={payingLoading} disabled={!proof} onClick={handlePay} icon={<Upload className="h-4 w-4" />}>
                Kirim Bukti
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Buat tagihan baru" description="Tagihan akan langsung terlihat oleh wali santri.">
        <form action={handleCreate} className="space-y-3">
          <Field label="Santri" htmlFor="invoice-student" required>
            <Select id="invoice-student" name="studentId" defaultValue={state.students[0]?.id}>
              {state.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — Kelas {getClassName(state, student.classId)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Periode" htmlFor="invoice-period">
              <Input id="invoice-period" name="periodLabel" defaultValue="Desember 2026" />
            </Field>
            <Field label="Nominal" htmlFor="invoice-amount" required>
              <Input id="invoice-amount" name="amount" type="number" min={10000} defaultValue={450000} />
            </Field>
          </div>
          <Field label="Jatuh tempo" htmlFor="invoice-due">
            <Input id="invoice-due" name="dueDate" type="date" defaultValue="2026-12-10" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button type="submit" loading={creating}>Simpan Tagihan</Button>
          </div>
        </form>
      </Modal>

      {isParent && (
        <p className="mt-3 text-xs text-slate-500">
          Status berubah menjadi <strong>Menunggu verifikasi</strong> setelah bukti dikirim, lalu menjadi{" "}
          <strong>Lunas</strong> atau <strong>Ditolak</strong> setelah admin keuangan memeriksa.
        </p>
      )}
    </div>
  );
}
