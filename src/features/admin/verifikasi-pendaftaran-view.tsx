"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Eye, FileWarning, XCircle } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate } from "@/lib/utils";
import type { Registration, RegistrationStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Field, Textarea } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function VerifikasiPendaftaranView() {
  const { state, updateRegistrationStatus, verifyRegistrationPayment } = useDemo();
  const [tab, setTab] = useState("menunggu_verifikasi");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [decision, setDecision] = useState<{ registration: Registration; status: RegistrationStatus } | null>(null);
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const counts = useMemo(
    () => ({
      menunggu_verifikasi: state.registrations.filter((item) => item.status === "menunggu_verifikasi").length,
      menunggu_pembayaran: state.registrations.filter((item) => item.status === "menunggu_pembayaran").length,
      perlu_perbaikan: state.registrations.filter((item) => item.status === "perlu_perbaikan").length,
      diterima: state.registrations.filter((item) => item.status === "diterima").length,
      ditolak: state.registrations.filter((item) => item.status === "ditolak").length,
    }),
    [state.registrations]
  );

  const items = useMemo(() => {
    let filtered = state.registrations;
    if (tab !== "semua") filtered = filtered.filter((registration) => registration.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (registration) =>
          registration.studentName.toLowerCase().includes(q) ||
          registration.number.toLowerCase().includes(q) ||
          registration.parentName.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [state.registrations, tab, search]);

  async function confirmDecision() {
    if (!decision) return;
    setProcessing(true);
    await updateRegistrationStatus(decision.registration.id, decision.status, note || undefined);
    setProcessing(false);
    setDecision(null);
    setSelected(null);
    setNote("");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Pendaftaran · Verifikasi"
        title="Verifikasi pendaftar"
        description="Periksa data, kelengkapan dokumen, dan pembayaran. Beri keputusan dengan catatan yang jelas."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Menunggu verifikasi" value={counts.menunggu_verifikasi} hint="Perlu keputusan" icon={ClipboardCheck} tone="amber" />
        <StatCard label="Menunggu pembayaran" value={counts.menunggu_pembayaran} hint="Belum unggah bukti" icon={FileWarning} tone="blue" />
        <StatCard label="Perlu perbaikan" value={counts.perlu_perbaikan} hint="Menunggu wali" icon={FileWarning} tone="rose" />
        <StatCard label="Diterima" value={counts.diterima} hint={`${counts.ditolak} ditolak`} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <FilterBar search={search} onSearch={setSearch} searchPlaceholder="Cari nama santri, wali, atau nomor..." right={
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "menunggu_verifikasi", label: "Menunggu", count: counts.menunggu_verifikasi },
              { value: "perlu_perbaikan", label: "Perbaikan", count: counts.perlu_perbaikan },
              { value: "diterima", label: "Diterima", count: counts.diterima },
              { value: "semua", label: "Semua", count: state.registrations.length },
            ]}
          />
        } />

        {items.length === 0 ? (
          <EmptyState
            title="Tidak ada pendaftar"
            description="Tidak ada pendaftar pada filter ini. Coba filter lain atau tunggu pendaftaran baru."
            icon={ClipboardCheck}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((registration) => (
              <li key={registration.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{registration.studentName}</p>
                    <StatusBadge status={registration.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {registration.number} · Kelas {registration.level} · wali {registration.parentName} ·{" "}
                    {formatDate(registration.submittedAt)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <StatusBadge
                      tone={
                        registration.paymentStatus === "lunas"
                          ? "success"
                          : registration.paymentStatus === "menunggu_verifikasi"
                            ? "warning"
                            : "danger"
                      }
                      label={`Pembayaran: ${
                        registration.paymentStatus === "lunas"
                          ? "lunas"
                          : registration.paymentStatus === "menunggu_verifikasi"
                            ? "menunggu verifikasi"
                            : "belum"
                      }`}
                    />
                    <StatusBadge
                      tone={registration.documents.every((doc) => doc.uploaded) ? "success" : "warning"}
                      label={`${registration.documents.filter((doc) => doc.uploaded).length}/${registration.documents.length} dokumen`}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" icon={<Eye className="h-4 w-4" />} onClick={() => setSelected(registration)}>
                  Periksa
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Detail pendaftar"
        description={selected?.number}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              {[
                ["Nama calon santri", selected.studentName],
                ["Jenis kelamin", selected.gender],
                ["Tanggal lahir", formatDate(selected.birthDate)],
                ["Kelas tujuan", String(selected.level)],
                ["Nama wali", selected.parentName],
                ["Telepon wali", selected.parentPhone],
                ["Email wali", selected.parentEmail],
                ["Asal sekolah", selected.previousSchool],
                ["Alamat", selected.address],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-inset ring-slate-200">
                  <p className="text-[11px] text-slate-500">{label}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kelengkapan dokumen</p>
              <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {selected.documents.map((doc) => (
                  <li key={doc.name} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
                    <span className="text-slate-600">{doc.name}</span>
                    <StatusBadge status={doc.uploaded ? "lengkap" : "belum"} label={doc.uploaded ? "Ada" : "Kurang"} />
                  </li>
                ))}
              </ul>
            </div>

            {selected.notes && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
                Catatan terakhir: {selected.notes}
              </p>
            )}

            {selected.paymentStatus === "menunggu_verifikasi" && (
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4" />}
                onClick={() => verifyRegistrationPayment(selected.id)}
              >
                Verifikasi Pembayaran Pendaftaran
              </Button>
            )}

            <Field label="Catatan keputusan (opsional)" htmlFor="decision-note">
              <Textarea id="decision-note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Contoh: Mohon unggah akta kelahiran yang jelas." />
            </Field>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-amber-700"
                onClick={() => setDecision({ registration: selected, status: "perlu_perbaikan" })}
              >
                Minta Perbaikan
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-700"
                icon={<XCircle className="h-4 w-4" />}
                onClick={() => setDecision({ registration: selected, status: "ditolak" })}
              >
                Tolak
              </Button>
              <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setDecision({ registration: selected, status: "diterima" })}>
                Terima Pendaftar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(decision)}
        title={
          decision?.status === "diterima"
            ? "Terima pendaftar ini?"
            : decision?.status === "ditolak"
              ? "Tolak pendaftar ini?"
              : "Minta perbaikan berkas?"
        }
        description={
          decision?.status === "diterima"
            ? `${decision.registration.studentName} akan berstatus diterima. Wali dapat melihat keputusan pada halaman cek status.`
            : decision?.status === "ditolak"
              ? `${decision?.registration.studentName ?? ""} akan berstatus ditolak. Pastikan alasan sudah diisi pada catatan.`
              : `${decision?.registration.studentName ?? ""} akan diminta memperbaiki berkas sesuai catatan.`
        }
        confirmLabel="Ya, Simpan Keputusan"
        tone={decision?.status === "ditolak" ? "danger" : "primary"}
        loading={processing}
        onConfirm={confirmDecision}
        onCancel={() => setDecision(null)}
      />
    </div>
  );
}
