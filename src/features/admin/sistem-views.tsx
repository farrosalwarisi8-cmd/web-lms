"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  School,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { formatDate, formatDateTime } from "@/lib/utils";
import { scenarioMeta } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/empty-state";
import { QuickLink } from "@/components/ui/priority-card";
import { getClassName } from "@/lib/utils";

export function KelolaAkunKeuanganView() {
  const { state, addFinanceAdmin, updateFinanceAdminStatus } = useDemo();
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd(formData: FormData) {
    setSaving(true);
    await addFinanceAdmin({
      name: String(formData.get("name") ?? "Admin Baru"),
      email: String(formData.get("email") ?? "admin.baru@demo.local"),
      role: String(formData.get("role")) === "Kasir" ? "Kasir" : "Admin Keuangan",
    });
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Keuangan · Akun"
        title="Akun admin keuangan"
        description="Kelola akses petugas keuangan dan kasir. Ini hanya simulasi peran, bukan akun autentikasi nyata."
        actions={<Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Tambah Akun</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total akun" value={state.financeAdmins.length} hint="Petugas keuangan" icon={ShieldCheck} tone="brand" />
        <StatCard label="Aktif" value={state.financeAdmins.filter((admin) => admin.status === "aktif").length} hint="Dapat mengakses kas" icon={ShieldCheck} tone="emerald" />
        <StatCard label="Nonaktif" value={state.financeAdmins.filter((admin) => admin.status === "nonaktif").length} hint="Akses ditangguhkan" icon={ShieldCheck} tone="rose" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <ul className="divide-y divide-slate-100">
          {state.financeAdmins.map((admin) => (
            <li key={admin.id} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
                  <StatusBadge status={admin.status} />
                  <StatusBadge label={admin.role} tone="info" />
                </div>
                <p className="text-xs text-slate-500">{admin.email}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateFinanceAdminStatus(admin.id, admin.status === "aktif" ? "nonaktif" : "aktif")}
              >
                {admin.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Tambah akun keuangan">
        <form action={handleAdd} className="space-y-3">
          <Field label="Nama petugas" htmlFor="finance-name" required>
            <Input id="finance-name" name="name" placeholder="Nama lengkap" />
          </Field>
          <Field label="Email demo" htmlFor="finance-email">
            <Input id="finance-email" name="email" type="email" placeholder="admin.baru@demo.local" />
          </Field>
          <Field label="Peran" htmlFor="finance-role">
            <Select id="finance-role" name="role" defaultValue="Admin Keuangan">
              <option value="Admin Keuangan">Admin Keuangan</option>
              <option value="Kasir">Kasir</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan Akun</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function EmailOutboxView() {
  const { state, retryEmail } = useDemo();
  const [selected, setSelected] = useState(state.outboxEmails[0]?.id ?? "");
  const email = state.outboxEmails.find((item) => item.id === selected);

  return (
    <div>
      <PageHeader
        eyebrow="Super Admin · Email Outbox"
        title="Email outbox (mock)"
        description="Tinjau email simulasi yang dikirim sistem. Tidak ada email nyata yang dikirim keluar."
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              state.outboxEmails
                .filter((item) => item.status === "gagal")
                .forEach((item) => retryEmail(item.id));
            }}
          >
            Kirim Ulang yang Gagal
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Daftar email</h2>
            <p className="text-xs text-slate-500">{state.outboxEmails.length} email pada outbox demo</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {state.outboxEmails.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${selected === item.id ? "bg-brand-50/50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{item.subject}</p>
                      <p className="text-xs text-slate-500">{item.to} · {formatDateTime(item.sentAt)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  {item.error && <p className="mt-1 text-[11px] text-rose-700">{item.error}</p>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          {email ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">Pratinjau email</h2>
                <StatusBadge status={email.status} />
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-slate-500">Kepada</dt>
                  <dd className="font-medium text-slate-800">{email.to}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-slate-500">Subjek</dt>
                  <dd className="text-slate-800">{email.subject}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-slate-500">Waktu</dt>
                  <dd className="text-slate-700">{formatDateTime(email.sentAt)}</dd>
                </div>
              </dl>
              <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200">
                {email.body}
              </p>
              {email.status === "gagal" && (
                <div className="mt-3">
                  <p className="text-xs text-rose-700">Error: {email.error}</p>
                  <Button size="sm" className="mt-2" icon={<RefreshCw className="h-4 w-4" />} onClick={() => retryEmail(email.id)}>
                    Kirim Ulang (demo)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Pilih email" description="Pilih salah satu email pada daftar untuk melihat pratinjau." icon={Mail} />
          )}
        </div>
      </div>
    </div>
  );
}

export function AkademikHubView() {
  const { state } = useDemo();
  return (
    <div>
      <PageHeader
        eyebrow="Super Admin · Akademik"
        title="Area kerja akademik"
        description="Akses cepat ke data master, pendaftaran, rapor, dan proses kenaikan kelas."
        actions={<ButtonLink href="/dashboard/akademik" variant="outline" size="sm">Kembali ke ringkasan</ButtonLink>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Siswa" value={state.students.length} hint={`${state.classes.length} kelas`} icon={Users} tone="blue" href="/dashboard/siswa" />
        <StatCard label="Guru" value={state.teachers.length} hint={`${state.subjects.length} mapel`} icon={School} tone="brand" href="/dashboard/guru" />
        <StatCard label="Pendaftar perlu verifikasi" value={state.registrations.filter((reg) => reg.status === "menunggu_verifikasi").length} hint="Antrean PPDB" icon={ClipboardCheck} tone="amber" href="/dashboard/verifikasi-pendaftaran" />
        <StatCard label="Rapor terbit" value={state.reportCards.filter((card) => card.status === "published").length} hint={`${state.reportCards.length} total`} icon={BookOpen} tone="emerald" href="/dashboard/rapor" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Data master" description="Kelola fondasi data akademik.">
          <div className="grid grid-cols-2 gap-2">
            <QuickLink href="/dashboard/siswa" label="Siswa" icon={Users} />
            <QuickLink href="/dashboard/guru" label="Guru" icon={School} />
            <QuickLink href="/dashboard/jenjang" label="Jenjang" icon={Layers} />
            <QuickLink href="/dashboard/kelas" label="Kelas" icon={School} />
            <QuickLink href="/dashboard/mapel" label="Mata Pelajaran" icon={BookOpen} />
            <QuickLink href="/dashboard/periode-ajaran" label="Periode Ajaran" icon={Settings} />
            <QuickLink href="/dashboard/kenaikan-kelas" label="Kenaikan Kelas" icon={ClipboardCheck} />
          </div>
        </SectionCard>
        <SectionCard title="Layanan akademik" description="Proses yang berjalan semester ini.">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span>Tugas dipublikasikan</span>
              <span className="font-semibold text-slate-800">{state.tasks.filter((task) => task.status === "published").length}</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span>Ujian aktif</span>
              <span className="font-semibold text-slate-800">{state.exams.filter((exam) => exam.published && exam.status === "aktif").length}</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span>Materi terpublikasi</span>
              <span className="font-semibold text-slate-800">{state.materials.filter((material) => material.status === "published").length}</span>
            </li>
            <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span>Absensi tercatat</span>
              <span className="font-semibold text-slate-800">{state.attendance.length}</span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

export function PengaturanView() {
  const { state, resetDemo, seedScenario } = useDemo();
  return (
    <div>
      <PageHeader
        eyebrow="Super Admin · Pengaturan"
        title="Pengaturan sistem demo"
        description="Kontrol data simulasi dan lihat informasi lingkungan demo. Tidak ada pengaturan server nyata."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Data demo" description="Muat skenario presentasi atau kembalikan data awal.">
          <div className="space-y-2">
            {scenarioMeta.map((scenario) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => seedScenario(scenario.key)}
                className="flex w-full items-start justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{scenario.label}</p>
                  <p className="text-xs text-slate-500">{scenario.description}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              </button>
            ))}
          </div>
          <Button variant="outline" className="mt-3 text-rose-700" icon={<RotateCcw className="h-4 w-4" />} onClick={resetDemo}>
            Reset Demo
          </Button>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Informasi sistem" description="Ringkasan lingkungan demo.">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Status data</dt>
                <dd className="font-medium text-slate-800">Mock lokal</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Backend / API</dt>
                <dd className="font-medium text-emerald-700">Tidak digunakan</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Penyimpanan</dt>
                <dd className="font-medium text-slate-800">localStorage browser</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Periode aktif</dt>
                <dd className="text-right font-medium text-slate-800">
                  {state.schoolPeriods.find((period) => period.id === state.activePeriodId)?.name}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Skenario</dt>
                <dd className="font-medium text-slate-800">{state.scenario}</dd>
              </div>
            </dl>
          </SectionCard>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
            <p className="font-semibold">Keamanan</p>
            <p className="mt-1">
              Demo ini tidak memiliki autentikasi nyata dan tidak boleh diisi data pribadi atau kredensial
              produksi. Semua email, pembayaran, dan unggahan adalah simulasi.
            </p>
          </div>

          <div className="flex gap-2">
            <ButtonLink href="/dashboard/profil" variant="outline" className="flex-1">Profil</ButtonLink>
            <ButtonLink href="/pilih-role" variant="outline" className="flex-1">Ganti peran</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
