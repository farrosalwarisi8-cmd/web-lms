"use client";

import { useState } from "react";
import { Info, Pencil, Wallet } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatRupiah } from "@/lib/utils";
import type { PpdbFee } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { Field, Input } from "@/components/ui/form";
import { SectionCard } from "@/components/ui/section-card";

export function BiayaPpdbView() {
  const { state, updatePpdbFee } = useDemo();
  const [editing, setEditing] = useState<PpdbFee | null>(null);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const totalRequired = state.ppdbFees.filter((fee) => fee.required).reduce((sum, fee) => sum + fee.amount, 0);
  const totalAll = state.ppdbFees.reduce((sum, fee) => sum + fee.amount, 0);

  async function save() {
    if (!editing) return;
    setSaving(true);
    await updatePpdbFee(editing.id, Number(amount));
    setSaving(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Pendaftaran · Biaya PPDB"
        title="Pengaturan biaya pendaftaran"
        description="Atur komponen biaya yang tampil pada halaman publik dan formulir pendaftaran."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Biaya wajib" value={formatRupiah(totalRequired)} hint="Dibayar saat pendaftaran" icon={Wallet} tone="brand" />
        <StatCard label="Total semua komponen" value={formatRupiah(totalAll)} hint="Termasuk opsional" icon={Wallet} tone="blue" />
        <StatCard label="Pendaftar" value={state.registrations.length} hint={`${state.registrations.filter((reg) => reg.paymentStatus === "lunas").length} sudah membayar`} icon={Wallet} tone="emerald" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Komponen biaya</h2>
          <p className="text-xs text-slate-500">Nominal dapat diubah kapan saja untuk kebutuhan simulasi.</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {state.ppdbFees.map((fee) => (
            <li key={fee.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{fee.label}</p>
                <p className="text-[11px] text-slate-500">{fee.required ? "Wajib" : "Opsional"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">{formatRupiah(fee.amount)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setEditing(fee);
                    setAmount(String(fee.amount));
                  }}
                >
                  Ubah
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <SectionCard title="Catatan demo" description="Perubahan hanya berlaku pada browser ini." className="mt-4">
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-600">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Demo tidak memiliki integrasi pembayaran. Nominal di sini hanya memengaruhi tampilan halaman
          pendaftaran dan simulasi pembayaran.
        </p>
      </SectionCard>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Ubah biaya" description={editing?.label}>
        <div className="space-y-3">
          <Field label="Nominal (Rp)" htmlFor="fee-amount" required>
            <Input id="fee-amount" type="number" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button loading={saving} onClick={save}>Simpan Nominal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
