"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Info, Save, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { InlineError } from "@/components/ui/feedback";
import { Stepper } from "@/components/ui/stepper";
import { useDemo } from "@/context/demo-context";
import { loadDraft, ppdbSteps, saveDraft, type PpdbDraft } from "@/lib/ppdb-draft";

export default function FormPendaftaranPage() {
  const router = useRouter();
  const { showToast } = useDemo();
  const [form, setForm] = useState<PpdbDraft>(() => loadDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setForm(loadDraft());
    setLoaded(true);
  }, []);

  function update<K extends keyof PpdbDraft>(key: K, value: PpdbDraft[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.studentName.trim()) next.studentName = "Nama calon santri wajib diisi.";
    if (!form.birthPlace.trim()) next.birthPlace = "Tempat lahir wajib diisi.";
    if (!form.birthDate) next.birthDate = "Tanggal lahir wajib diisi.";
    if (!form.previousSchool.trim()) next.previousSchool = "Asal sekolah wajib diisi.";
    if (!form.parentName.trim()) next.parentName = "Nama wali wajib diisi.";
    if (!form.parentPhone.trim()) next.parentPhone = "Nomor WhatsApp wali wajib diisi.";
    else if (!/^[0-9+\-\s]{9,}$/.test(form.parentPhone)) next.parentPhone = "Nomor telepon belum valid.";
    if (!form.parentEmail.trim()) next.parentEmail = "Email wali wajib diisi.";
    else if (!/.+@.+\..+/.test(form.parentEmail)) next.parentEmail = "Format email belum benar.";
    if (!form.address.trim()) next.address = "Alamat wali wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveAndContinue() {
    if (!validate()) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    saveDraft(form);
    setSaving(false);
    showToast("Draft data santri disimpan", "success", "Lanjutkan ke unggah dokumen pada langkah berikutnya.");
    router.push("/pendaftaran/dokumen");
  }

  function saveOnly() {
    saveDraft(form);
    showToast("Draft disimpan di browser", "info", "Data akan tersedia lagi saat halaman dibuka.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex-1 py-8">
        <Link href="/pendaftaran" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke informasi pendaftaran
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Langkah 1 dari 5</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Formulir pendaftaran santri baru</h1>
            <p className="mt-1 text-sm text-slate-600">Isi data calon santri dan wali. Draft tersimpan di browser ini.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Data demo lokal
          </span>
        </div>

        <Stepper steps={ppdbSteps} current={0} className="mt-5" />

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveAndContinue();
            }}
            noValidate
          >
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-base font-bold text-slate-900">Data calon santri</h2>
              <p className="text-xs text-slate-500">Sesuai akta kelahiran dan dokumen resmi.</p>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <Field label="Nama lengkap calon santri" htmlFor="studentName" required error={errors.studentName} className="sm:col-span-2">
                  <Input
                    id="studentName"
                    value={form.studentName}
                    onChange={(event) => update("studentName", event.target.value)}
                    placeholder="Contoh: Aulia Rahma"
                    autoComplete="off"
                  />
                </Field>
                <Field label="Jenis kelamin" htmlFor="gender" required>
                  <Select
                    id="gender"
                    value={form.gender}
                    onChange={(event) => update("gender", event.target.value as PpdbDraft["gender"])}
                  >
                    <option value="putra">Putra</option>
                    <option value="putri">Putri</option>
                  </Select>
                </Field>
                <Field label="Kelas tujuan" htmlFor="level" required>
                  <Select
                    id="level"
                    value={form.level}
                    onChange={(event) => update("level", Number(event.target.value) as PpdbDraft["level"])}
                  >
                    <option value={7}>Kelas 7</option>
                    <option value={8}>Kelas 8 (pindahan)</option>
                    <option value={9}>Kelas 9 (pindahan)</option>
                  </Select>
                </Field>
                <Field label="Tempat lahir" htmlFor="birthPlace" required error={errors.birthPlace}>
                  <Input
                    id="birthPlace"
                    value={form.birthPlace}
                    onChange={(event) => update("birthPlace", event.target.value)}
                    placeholder="Contoh: Bogor"
                  />
                </Field>
                <Field label="Tanggal lahir" htmlFor="birthDate" required error={errors.birthDate}>
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(event) => update("birthDate", event.target.value)}
                  />
                </Field>
                <Field label="Asal sekolah" htmlFor="previousSchool" required error={errors.previousSchool} className="sm:col-span-2">
                  <Input
                    id="previousSchool"
                    value={form.previousSchool}
                    onChange={(event) => update("previousSchool", event.target.value)}
                    placeholder="Contoh: SDN Cibinong 02"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h2 className="text-base font-bold text-slate-900">Data wali</h2>
              <p className="text-xs text-slate-500">Kontak yang dapat dihubungi panitia PPDB.</p>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                <Field label="Nama wali" htmlFor="parentName" required error={errors.parentName}>
                  <Input
                    id="parentName"
                    value={form.parentName}
                    onChange={(event) => update("parentName", event.target.value)}
                    placeholder="Contoh: Dewi Lestari"
                  />
                </Field>
                <Field label="Nomor WhatsApp" htmlFor="parentPhone" required error={errors.parentPhone}>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={form.parentPhone}
                    onChange={(event) => update("parentPhone", event.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </Field>
                <Field label="Email wali" htmlFor="parentEmail" required error={errors.parentEmail} className="sm:col-span-2">
                  <Input
                    id="parentEmail"
                    type="email"
                    value={form.parentEmail}
                    onChange={(event) => update("parentEmail", event.target.value)}
                    placeholder="nama@email.com"
                  />
                </Field>
                <Field label="Alamat domisili" htmlFor="address" required error={errors.address} className="sm:col-span-2">
                  <textarea
                    id="address"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    className="input-base min-h-20 resize-y"
                    placeholder="Jalan, nomor rumah, kelurahan, kota"
                  />
                </Field>
              </div>
            </section>

            {Object.keys(errors).length > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <InlineError message="Beberapa kolom wajib belum lengkap. Periksa tanda merah di atas." />
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={saveOnly} icon={<Save className="h-4 w-4" />}>
                Simpan Draft
              </Button>
              <Button type="button" onClick={saveAndContinue} loading={saving} iconRight={<ArrowRight className="h-4 w-4" />}>
                Simpan &amp; Lanjut ke Dokumen
              </Button>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900">Tips pengisian</h2>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
                <li>• Nama harus sama dengan akta kelahiran.</li>
                <li>• Gunakan nomor WhatsApp wali yang aktif.</li>
                <li>• Draft dapat disimpan lalu dilanjutkan kapan saja.</li>
                <li>• Data hanya tersimpan di browser demo ini.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
              <p className="flex items-center gap-1.5 font-semibold">
                <Info className="h-3.5 w-3.5" aria-hidden /> Mode demo
              </p>
              <p className="mt-1">
                Tidak ada data yang dikirim ke server. Jangan mengisi data pribadi yang sebenarnya.
              </p>
            </div>
            {loaded && form.studentName && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pratinjau</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{form.studentName}</p>
                <p className="text-xs text-slate-500">Kelas {form.level} · {form.gender === "putra" ? "Putra" : "Putri"}</p>
                <p className="mt-1 text-xs text-slate-500">Wali: {form.parentName || "—"}</p>
              </div>
            )}
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
