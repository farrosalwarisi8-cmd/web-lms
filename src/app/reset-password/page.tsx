"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { InlineError } from "@/components/ui/feedback";
import { Stepper } from "@/components/ui/stepper";
import { useDemo } from "@/context/demo-context";

export default function ResetPasswordPage() {
  const { showToast } = useDemo();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("wali@demo.local");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const steps = [
    { title: "Email akun", description: "Identifikasi akun" },
    { title: "Kode OTP", description: "Kode demo 6 digit" },
    { title: "Password baru", description: "Simpan password" },
  ];

  async function next() {
    setError(undefined);
    if (step === 0) {
      if (!/.+@.+\..+/.test(email)) return setError("Format email belum benar.");
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
      showToast("Kode OTP demo dikirim", "info", "Gunakan kode 123456 untuk melanjutkan simulasi.");
      setOtp("123456");
      setStep(1);
      return;
    }
    if (step === 1) {
      if (otp.length !== 6) return setError("Kode OTP harus 6 digit.");
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 450));
      setLoading(false);
      setStep(2);
      return;
    }
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirm) return setError("Konfirmasi password belum sama.");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setDone(true);
    showToast("Password demo diperbarui", "success", "Ini hanya perubahan simulasi di sesi demo.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-lg">
          <Link href="/login" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke login
          </Link>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            {done ? (
              <div className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" aria-hidden />
                </span>
                <h1 className="mt-4 text-xl font-bold text-slate-900">Password demo diperbarui</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Simulasi reset selesai. Tidak ada password nyata yang diubah. Silakan kembali ke
                  halaman login dan gunakan akun demo.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-slate-900 hover:bg-brand-400"
                >
                  Kembali ke Login Demo
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-800">
                    <KeyRound className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Reset password (demo)</h1>
                    <p className="text-xs text-slate-500">Simulasi OTP dan password baru</p>
                  </div>
                </div>

                <Stepper steps={steps} current={step} className="mt-5" />

                <div className="mt-5 space-y-4">
                  {step === 0 && (
                    <Field label="Email akun" htmlFor="reset-email" required error={error}>
                      <Input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="off"
                      />
                    </Field>
                  )}

                  {step === 1 && (
                    <>
                      <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 ring-1 ring-inset ring-blue-200">
                        <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <span>
                          Kode OTP simulasi untuk <strong>{email}</strong> adalah <strong>123456</strong>.
                          Kode sudah diisikan otomatis agar presentasi lebih cepat.
                        </span>
                      </div>
                      <Field label="Kode OTP (6 digit)" htmlFor="otp" required error={error}>
                        <Input
                          id="otp"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                          className="font-mono tracking-[0.4em]"
                        />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Field label="Password baru" htmlFor="new-password" required error={error}>
                        <Input
                          id="new-password"
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="new-password"
                        />
                      </Field>
                      <Field label="Konfirmasi password baru" htmlFor="confirm-password" required>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirm}
                          onChange={(event) => setConfirm(event.target.value)}
                          autoComplete="new-password"
                        />
                      </Field>
                    </>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep((value) => value - 1)} disabled={loading}>
                      Kembali
                    </Button>
                  )}
                  <Button fullWidth loading={loading} onClick={next} icon={step === 2 ? <Eye className="h-4 w-4" /> : undefined}>
                    {step === 0 ? "Kirim Kode OTP" : step === 1 ? "Verifikasi Kode" : "Simpan Password Demo"}
                  </Button>
                </div>

                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Halaman ini hanya memperlihatkan alur. Jangan gunakan password nyata pada demo.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
