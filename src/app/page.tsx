import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";

const roles = [
  { icon: HeartHandshake, title: "Orang Tua / Wali", description: "Pantau tugas, kehadiran, rapor, tagihan, dan kelengkapan berkas anak." },
  { icon: GraduationCap, title: "Santri / Siswa", description: "Lihat materi, kerjakan tugas, ikuti ujian, dan baca hasil belajar." },
  { icon: BookOpen, title: "Guru", description: "Kelola kelas, absensi, materi, tugas, ujian, dan penilaian." },
  { icon: ClipboardList, title: "Admin Akademik", description: "Verifikasi pendaftar dan kelola data master akademik." },
  { icon: Wallet, title: "Admin Keuangan", description: "Terima pembayaran, kelola tagihan SPP, dan pantau arus kas." },
  { icon: ShieldCheck, title: "Super Admin", description: "Ringkasan lintas area, kontrol akses, dan email outbox." },
];

const steps = [
  { icon: FileText, title: "Isi formulir", detail: "Data calon santri dan wali diisi bertahap dengan validasi." },
  { icon: ClipboardList, title: "Unggah dokumen", detail: "Kartu keluarga, akta, ijazah, foto, dan KTP wali." },
  { icon: CreditCard, title: "Bayar pendaftaran", detail: "Unggah bukti transfer secara simulasi, tanpa transaksi nyata." },
  { icon: CheckCircle2, title: "Verifikasi", detail: "Admin memverifikasi berkas dan pembayaran lalu memberi keputusan." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white">
          <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                demolms · Demo LMS Pesantren
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Satu sistem untuk santri, guru, wali, dan pengelola sekolah.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Semua yang perlu dilakukan hari ini tersaji jelas: tugas terdekat, ujian aktif,
                kehadiran, rapor, hingga tagihan SPP. Alur nyata, data simulasi, tanpa backend.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href="/pendaftaran/form" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Daftar Santri Baru
                </ButtonLink>
                <ButtonLink href="/login" size="lg" variant="outline">
                  Masuk ke Demo
                </ButtonLink>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden /> 7 peran demo
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden /> Data lokal
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden /> Tanpa backend
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-brand-100/50" aria-hidden />
              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">Beranda Wali</p>
                    <p className="text-sm font-bold text-slate-900">Ahmad Fauzan · 7A</p>
                  </div>
                  <StatusBadge status="aktif" label="Semester Ganjil" tone="brand" />
                </div>
                <div className="mt-3 rounded-xl bg-amber-50 p-3 ring-1 ring-inset ring-amber-200">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                    Yang perlu diperhatikan
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    2 tugas belum dikumpulkan &amp; SPP November belum dibayar
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
                      Lihat tugas
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
                      Bayar SPP
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { icon: ClipboardList, label: "Tugas aktif", value: "3" },
                    { icon: CalendarCheck, label: "Kehadiran", value: "82%" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-200 p-3">
                      <item.icon className="h-4 w-4 text-brand-700" aria-hidden />
                      <p className="mt-1 text-lg font-bold text-slate-900">{item.value}</p>
                      <p className="text-[10px] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 p-3">
                  <ProgressBar label="Kelengkapan berkas" value={80} tone="emerald" />
                  <ProgressBar label="Progres belajar" value={68} />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] text-slate-300">Nilai terbaru · Matematika</p>
                    <p className="text-sm font-bold text-white">88 / 100</p>
                  </div>
                  <span className="rounded-full bg-brand-500 px-2 py-1 text-[10px] font-bold text-slate-900">
                    Baik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white/60">
          <div className="container-page grid grid-cols-2 gap-4 py-6 sm:grid-cols-4">
            {[
              { value: "7", label: "Peran demo siap dicoba" },
              { value: "3", label: "Kelas aktif 7A–9A" },
              { value: "10+", label: "Alur fitur saling terhubung" },
              { value: "100%", label: "Data lokal di browser" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-page py-12 lg:py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Satu LMS, tujuh pengalaman berbeda
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Setiap peran mendapat beranda, navigasi, dan hak akses yang sesuai. Coba ganti peran
              dari menu profil tanpa perlu login ulang.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Link
                key={role.title}
                href="/login"
                className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
                  <role.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{role.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{role.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 opacity-0 transition group-hover:opacity-100">
                    Coba peran <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-slate-900">
                <Users className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Calon Wali</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                  Ikuti alur pendaftaran bertahap dan cek status dengan nomor pendaftaran.
                </p>
                <Link href="/pendaftaran" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:underline">
                  Lihat alur <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-12 lg:py-16">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Pendaftaran santri baru yang transparan
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Empat langkah jelas, progres tersimpan, dan status dapat dicek kapan saja.
                </p>
              </div>
              <ButtonLink href="/pendaftaran" variant="outline" size="sm">
                Detail pendaftaran
              </ButtonLink>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-4">
              {steps.map((step, index) => (
                <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-slate-900">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <step.icon className="h-4 w-4 text-brand-700" aria-hidden />
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="container-page py-12 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-900">Apa yang bisa dicoba di demo?</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: ClipboardList, title: "Tugas & ujian", text: "Buat, kumpulkan, nilai, kerjakan dengan timer, dan lihat rekap." },
                  { icon: CalendarCheck, title: "Absensi", text: "Guru mengisi absensi kelas; wali dan siswa melihat riwayat." },
                  { icon: CreditCard, title: "SPP & verifikasi", text: "Unggah bukti transfer, admin menyetujui, status berubah." },
                  { icon: LayoutDashboard, title: "Data master", text: "Tambah siswa, guru, kelas, mapel, dan proses kenaikan kelas." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                      <item.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-2xl bg-slate-900 p-5 text-white">
              <div>
                <h2 className="text-lg font-bold">Siap mencoba?</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Masuk dengan akun demo, lalu ganti peran untuk melihat perbedaan navigasi dan data.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <li>• Password semua akun: demo123</li>
                  <li>• Tidak perlu email atau pendaftaran nyata</li>
                  <li>• Reset data kapan saja dari menu profil</li>
                </ul>
              </div>
              <ButtonLink href="/login" className="mt-5 w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
                Buka Halaman Login
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
