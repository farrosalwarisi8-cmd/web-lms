"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { demoAccounts, roleLabels } from "@/lib/seed/people";
import type { DemoRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { InlineError } from "@/components/ui/feedback";
import { RoleBadge } from "@/components/ui/role-badge";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAs, state, hydrated } = useDemo();
  const [role, setRole] = useState<DemoRole>("orang_tua");
  const [email, setEmail] = useState("wali@demo.local");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && state.isLoggedIn) {
      // Pengguna sudah punya sesi demo; arahkan langsung ke dashboard.
      router.replace("/dashboard");
    }
  }, [hydrated, state.isLoggedIn, router]);

  function chooseRole(nextRole: DemoRole) {
    const account = demoAccounts.find((item) => item.role === nextRole);
    setRole(nextRole);
    setEmail(account?.email ?? "");
    setPassword(account?.password ?? "demo123");
    setError(undefined);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);
    if (!email.trim()) {
      setError("Email demo wajib diisi.");
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setError("Format email belum benar.");
      return;
    }
    if (!password) {
      setError("Password demo wajib diisi.");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const result = loginWithEmail(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Beri kesempatan state sesi demo ter-commit sebelum pindah halaman.
    await new Promise((resolve) => setTimeout(resolve, 80));
    router.push("/dashboard");
  }

  async function handleDemoLogin() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    loginAs(role);
    setLoading(false);
    await new Promise((resolve) => setTimeout(resolve, 80));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-500/20 blur-2xl" aria-hidden />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-500/10 blur-2xl" aria-hidden />

          <Link href="/" className="relative flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-slate-900">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold">demolms</span>
              <span className="block text-[11px] text-slate-400">Demo LMS Pesantren</span>
            </span>
          </Link>

          <div className="relative max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Ruang demo presentasi
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight">
              Coba seluruh peran dalam satu demo tanpa backend.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Pilih peran, masuk, lalu jelajahi dashboard yang berbeda. Semua data, unggahan,
              pembayaran, dan notifikasi hanyalah simulasi lokal di browser.
            </p>
            <div className="mt-6 space-y-2.5">
              {[
                "Beranda menyesuaikan peran dan konteks aktif",
                "Alur tugas, ujian, absensi, rapor, dan SPP saling terhubung",
                "Ganti anak, periode, atau peran tanpa login ulang",
              ].map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-300">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-500">
            Tidak ada kredensial produksi di halaman ini. Password demo bersifat publik.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 lg:px-10">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Kembali ke halaman publik
            </Link>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
              Mode Demo
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8">
            <div className="w-full max-w-md">
              <div className="mb-5 flex items-center gap-2.5 lg:hidden">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-slate-900">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">demolms</p>
                  <p className="text-[11px] text-slate-500">Demo LMS Pesantren</p>
                </div>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke demo</h1>
              <p className="mt-1 text-sm text-slate-600">
                Gunakan akun demo. Tidak ada autentikasi atau keamanan nyata di sini.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5" noValidate>
                <Field label="Masuk sebagai role" htmlFor="role" hint="Memilih role akan mengisi email demo yang sesuai.">
                  <Select
                    id="role"
                    value={role}
                    onChange={(event) => chooseRole(event.target.value as DemoRole)}
                  >
                    {demoAccounts.map((account) => (
                      <option key={account.role} value={account.role}>
                        {account.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Email demo" htmlFor="email" required>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="wali@demo.local"
                  />
                </Field>

                <Field label="Password demo" htmlFor="password" required hint="Semua akun demo memakai password: demo123">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>

                {error && (
                  <div className="rounded-lg bg-rose-50 px-3 py-2 ring-1 ring-inset ring-rose-200">
                    <InlineError message={error} />
                  </div>
                )}

                <Button type="submit" fullWidth loading={loading} icon={<LockKeyhole className="h-4 w-4" />}>
                  Masuk sebagai {roleLabels[role]}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  loading={loading}
                  onClick={handleDemoLogin}
                  icon={<KeyRound className="h-4 w-4" />}
                >
                  Gunakan Akun Demo
                </Button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <Link href="/lupa-password" className="font-medium text-slate-600 hover:text-slate-900 hover:underline">
                    Lupa password?
                  </Link>
                  <Link href="/reset-password" className="font-medium text-slate-600 hover:text-slate-900 hover:underline">
                    Simulasi reset password
                  </Link>
                </div>
              </form>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Akun demo tersedia
                  </p>
                  <RoleBadge role={role} compact />
                </div>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {demoAccounts.map((account) => (
                    <li key={account.role}>
                      <button
                        type="button"
                        onClick={() => chooseRole(account.role)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] hover:border-brand-300 hover:bg-brand-50/40"
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold text-slate-700">
                            {account.label}
                          </span>
                          <span className="block truncate font-mono text-[10px] text-slate-500">
                            {account.email}
                          </span>
                        </span>
                        {role === account.role && (
                          <span className="shrink-0 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-slate-900">
                            Dipilih
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Email di atas fiktif. Tidak ada pengiriman email sungguhan pada demo ini.
                </p>
              </div>

              <p className="mt-5 text-center text-xs text-slate-500">
                Belum punya akun?{" "}
                <Link href="/pendaftaran/form" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  Mulai pendaftaran demo <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </p>
              {loading && (
                <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Menyiapkan sesi demo...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
