import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileQuestion,
  FileText,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Library,
  Mail,
  Receipt,
  School,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { DemoRole } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const navByRole: Record<DemoRole, NavSection[]> = {
  calon_wali: [
    {
      items: [
        { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
        { href: "/pendaftaran", label: "Alur Pendaftaran", icon: ClipboardList },
        { href: "/pendaftaran/form", label: "Formulir Saya", icon: FileText },
        { href: "/cek-pendaftaran", label: "Cek Status", icon: ShieldCheck },
      ],
    },
    {
      label: "Akun",
      items: [
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  orang_tua: [
    {
      items: [{ href: "/dashboard", label: "Beranda", icon: LayoutDashboard }],
    },
    {
      label: "Belajar Anak",
      items: [
        { href: "/dashboard/tugas", label: "Tugas", icon: ClipboardList },
        { href: "/dashboard/ujian", label: "Ujian", icon: FileQuestion },
        { href: "/dashboard/absensi", label: "Kehadiran", icon: CalendarCheck },
        { href: "/dashboard/rapor", label: "Rapor", icon: GraduationCap },
        { href: "/dashboard/materi", label: "Materi", icon: BookOpen },
      ],
    },
    {
      label: "Administrasi",
      items: [
        { href: "/dashboard/tagihan", label: "Tagihan SPP", icon: CreditCard },
        { href: "/dashboard/berkas", label: "Berkas", icon: FolderOpen },
      ],
    },
    {
      label: "Akun",
      items: [
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  siswa: [
    {
      items: [
        { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
        { href: "/dashboard/materi", label: "Materi", icon: BookOpen },
        { href: "/dashboard/tugas", label: "Tugas", icon: ClipboardList },
        { href: "/dashboard/ujian", label: "Ujian", icon: FileQuestion },
        { href: "/dashboard/absensi", label: "Absensi", icon: CalendarCheck },
        { href: "/dashboard/rapor", label: "Rapor", icon: GraduationCap },
      ],
    },
    {
      label: "Akun",
      items: [
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  guru: [
    {
      items: [{ href: "/dashboard", label: "Beranda", icon: LayoutDashboard }],
    },
    {
      label: "Mengajar",
      items: [
        { href: "/dashboard/kelas", label: "Kelas", icon: School },
        { href: "/dashboard/materi", label: "Materi", icon: BookOpen },
        { href: "/dashboard/tugas", label: "Tugas", icon: ClipboardList },
        { href: "/dashboard/ujian", label: "Ujian", icon: FileQuestion },
        { href: "/dashboard/absensi", label: "Absensi", icon: CalendarCheck },
      ],
    },
    {
      label: "Penilaian",
      items: [
        { href: "/dashboard/rekap-nilai", label: "Rekap Nilai", icon: BarChart3 },
        { href: "/dashboard/rapor", label: "Rapor", icon: GraduationCap },
      ],
    },
    {
      label: "Akun",
      items: [
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  admin_akademik: [
    {
      items: [{ href: "/dashboard", label: "Beranda", icon: LayoutDashboard }],
    },
    {
      label: "Pendaftaran",
      items: [
        { href: "/dashboard/verifikasi-pendaftaran", label: "Verifikasi Pendaftar", icon: ClipboardCheck },
        { href: "/dashboard/biaya-ppdb", label: "Biaya PPDB", icon: Wallet },
      ],
    },
    {
      label: "Data Master",
      items: [
        { href: "/dashboard/siswa", label: "Siswa", icon: Users },
        { href: "/dashboard/guru", label: "Guru", icon: UserCog },
        { href: "/dashboard/jenjang", label: "Jenjang", icon: Layers },
        { href: "/dashboard/kelas", label: "Kelas", icon: School },
        { href: "/dashboard/mapel", label: "Mata Pelajaran", icon: Library },
        { href: "/dashboard/periode-ajaran", label: "Periode Ajaran", icon: CalendarDays },
        { href: "/dashboard/kenaikan-kelas", label: "Kenaikan Kelas", icon: TrendingUp },
      ],
    },
    {
      label: "Akun",
      items: [
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  admin_keuangan: [
    {
      items: [{ href: "/dashboard", label: "Beranda", icon: LayoutDashboard }],
    },
    {
      label: "Keuangan",
      items: [
        { href: "/dashboard/tagihan", label: "Tagihan", icon: CreditCard },
        { href: "/dashboard/keuangan", label: "Verifikasi & Kas", icon: Receipt },
        { href: "/dashboard/kasir", label: "Kasir", icon: Wallet },
        { href: "/dashboard/rekap-keuangan", label: "Rekap", icon: BarChart3 },
        { href: "/dashboard/laporan", label: "Laporan", icon: FileText },
      ],
    },
    {
      label: "Data & Akun",
      items: [
        { href: "/dashboard/siswa", label: "Daftar Siswa", icon: Users },
        { href: "/dashboard/kelola-akun-keuangan", label: "Akun Keuangan", icon: ShieldCheck },
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
  super_admin: [
    {
      items: [{ href: "/dashboard", label: "Ringkasan Sistem", icon: LayoutDashboard }],
    },
    {
      label: "Area Kerja",
      items: [
        { href: "/dashboard/akademik", label: "Akademik", icon: School },
        { href: "/dashboard/verifikasi-pendaftaran", label: "Pendaftaran", icon: ClipboardCheck },
        { href: "/dashboard/keuangan", label: "Keuangan", icon: Receipt },
      ],
    },
    {
      label: "Sistem",
      items: [
        { href: "/dashboard/email-outbox", label: "Email Outbox", icon: Mail },
        { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
        { href: "/dashboard/profil", label: "Profil", icon: User },
        { href: "/pilih-role", label: "Ganti Peran Demo", icon: ArrowLeftRight },
      ],
    },
  ],
};

export const routeTitles: Record<string, string> = {
  "/dashboard": "Beranda",
  "/dashboard/materi": "Materi Pembelajaran",
  "/dashboard/tugas": "Tugas",
  "/dashboard/tugas/buat": "Buat Tugas",
  "/dashboard/ujian": "Ujian",
  "/dashboard/ujian/buat": "Buat Ujian",
  "/dashboard/ujian/preview": "Preview Ujian",
  "/dashboard/ujian/kerjakan": "Kerjakan Ujian",
  "/dashboard/ujian/rekap": "Rekap Ujian",
  "/dashboard/absensi": "Absensi",
  "/dashboard/rekap-nilai": "Rekap Nilai",
  "/dashboard/rapor": "Rapor",
  "/dashboard/tagihan": "Tagihan SPP",
  "/dashboard/keuangan": "Keuangan",
  "/dashboard/siswa": "Data Siswa",
  "/dashboard/guru": "Data Guru",
  "/dashboard/jenjang": "Data Jenjang",
  "/dashboard/kelas": "Data Kelas",
  "/dashboard/mapel": "Mata Pelajaran",
  "/dashboard/periode-ajaran": "Periode Ajaran",
  "/dashboard/kenaikan-kelas": "Kenaikan Kelas",
  "/dashboard/verifikasi-pendaftaran": "Verifikasi Pendaftaran",
  "/dashboard/biaya-ppdb": "Biaya PPDB",
  "/dashboard/berkas": "Berkas",
  "/dashboard/kelola-akun-keuangan": "Akun Admin Keuangan",
  "/dashboard/email-outbox": "Email Outbox",
  "/dashboard/profil": "Profil",
  "/dashboard/akademik": "Area Akademik",
  "/dashboard/pengaturan": "Pengaturan",
  "/dashboard/kasir": "Kasir Pembayaran",
  "/dashboard/rekap-keuangan": "Rekap Keuangan",
  "/dashboard/laporan": "Laporan Keuangan",
  "/pilih-role": "Pilih Peran Demo",
  "/ganti-password": "Ganti Password",
};

export function getInitialsAvatar(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
