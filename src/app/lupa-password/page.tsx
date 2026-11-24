"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineError } from "@/components/ui/feedback";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return setError("Email wajib diisi.");
    if (!/.+@.+\..+/.test(email)) return setError("Format email belum benar.");
    setError(undefined);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke login
          </Link>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            {sent ? (
              <div className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" aria-hidden />
                </span>
                <h1 className="mt-4 text-xl font-bold text-slate-900">Instruksi reset terkirim (demo)</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Kami mensimulasikan pengiriman instruksi ke <strong>{email}</strong>. Tidak ada email
                  sungguhan yang dikirim. Lanjutkan ke simulasi OTP dan password baru.
                </p>
                <div className="mt-5 space-y-2">
                  <Link
                    href="/reset-password"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-slate-900 hover:bg-brand-400"
                  >
                    <KeyRound className="h-4 w-4" aria-hidden />
                    Lanjut ke Reset Password
                  </Link>
                  <Button variant="ghost" fullWidth onClick={() => setSent(false)}>
                    Gunakan email lain
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-800">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <h1 className="mt-4 text-xl font-bold text-slate-900">Lupa password?</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Masukkan email akun demo. Proses ini hanya simulasi dan tidak mengirim pesan nyata.
                </p>
                <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
                  <Field label="Email akun" htmlFor="email" required error={error}>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="wali@demo.local"
                      autoComplete="off"
                    />
                  </Field>
                  <Button type="submit" fullWidth loading={loading}>
                    Kirim Instruksi Simulasi
                  </Button>
                </form>
                <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500 ring-1 ring-inset ring-slate-200">
                  Di demo ini semua akun memakai password <strong>demo123</strong>. Halaman reset hanya
                  memperlihatkan alur UX.
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
