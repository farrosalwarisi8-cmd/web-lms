"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineError } from "@/components/ui/feedback";

export default function GantiPasswordPage() {
  const { showToast } = useDemo();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!current) return setError("Password saat ini wajib diisi.");
    if (next.length < 6) return setError("Password baru minimal 6 karakter.");
    if (next !== confirm) return setError("Konfirmasi password belum sama.");
    setError(undefined);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 550));
    setLoading(false);
    setDone(true);
    showToast("Password demo diperbarui", "success", "Perubahan ini hanya simulasi dan tidak disimpan permanen.");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page max-w-xl py-8">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke dashboard
        </Link>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          {done ? (
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">Password demo diperbarui</h1>
              <p className="mt-2 text-sm text-slate-600">
                Simulasi berhasil. Pada demo, password akun tetap <strong>demo123</strong> karena tidak ada
                autentikasi nyata.
              </p>
              <Link href="/dashboard/profil" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-slate-900 hover:bg-brand-400">
                Kembali ke Profil
              </Link>
            </div>
          ) : (
            <>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-800">
                <KeyRound className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="mt-4 text-xl font-bold text-slate-900">Ganti password (demo)</h1>
              <p className="mt-1 text-sm text-slate-600">
                Formulir ini hanya memperlihatkan alur validasi. Tidak ada password yang benar-benar diubah.
              </p>
              <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>
                <Field label="Password saat ini" htmlFor="current-password" required hint="Gunakan demo123 pada demo.">
                  <Input id="current-password" type="password" value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" />
                </Field>
                <Field label="Password baru" htmlFor="new-password" required>
                  <Input id="new-password" type="password" value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" />
                </Field>
                <Field label="Konfirmasi password baru" htmlFor="confirm-new-password" required>
                  <Input id="confirm-new-password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
                </Field>
                {error && (
                  <div className="rounded-lg bg-rose-50 px-3 py-2 ring-1 ring-inset ring-rose-200">
                    <InlineError message={error} />
                  </div>
                )}
                <Button type="submit" fullWidth loading={loading}>Simpan Password Demo</Button>
              </form>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Jangan gunakan password nyata pada demo. Tidak ada data yang dikirim ke server.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
