import type { DemoRole } from "./types";

const allRoles: DemoRole[] = [
  "calon_wali",
  "orang_tua",
  "siswa",
  "guru",
  "admin_akademik",
  "admin_keuangan",
  "super_admin",
];

const academicViewers: DemoRole[] = ["guru", "admin_akademik", "super_admin"];

export const routeAccess: Record<string, DemoRole[]> = {
  "/dashboard": allRoles,
  "/dashboard/profil": allRoles,
  "/dashboard/materi": ["orang_tua", "siswa", "guru", "super_admin"],
  "/dashboard/tugas": ["orang_tua", "siswa", "guru", "super_admin"],
  "/dashboard/tugas/buat": ["guru"],
  "/dashboard/ujian": ["orang_tua", "siswa", "guru", "super_admin"],
  "/dashboard/ujian/buat": ["guru"],
  "/dashboard/ujian/preview": ["guru"],
  "/dashboard/ujian/kerjakan": ["siswa"],
  "/dashboard/ujian/rekap": academicViewers,
  "/dashboard/absensi": ["orang_tua", "siswa", "guru", "admin_akademik", "super_admin"],
  "/dashboard/rekap-nilai": academicViewers,
  "/dashboard/rapor": ["orang_tua", "siswa", "guru", "admin_akademik", "super_admin"],
  "/dashboard/tagihan": ["orang_tua", "admin_keuangan", "super_admin"],
  "/dashboard/keuangan": ["admin_keuangan", "super_admin"],
  "/dashboard/kasir": ["admin_keuangan", "super_admin"],
  "/dashboard/rekap-keuangan": ["admin_keuangan", "super_admin"],
  "/dashboard/laporan": ["admin_keuangan", "super_admin"],
  "/dashboard/siswa": ["guru", "admin_akademik", "admin_keuangan", "super_admin"],
  "/dashboard/guru": ["admin_akademik", "super_admin"],
  "/dashboard/jenjang": ["admin_akademik", "super_admin"],
  "/dashboard/kelas": ["guru", "admin_akademik", "super_admin"],
  "/dashboard/mapel": ["admin_akademik", "super_admin"],
  "/dashboard/periode-ajaran": ["admin_akademik", "super_admin"],
  "/dashboard/kenaikan-kelas": ["admin_akademik", "super_admin"],
  "/dashboard/verifikasi-pendaftaran": ["admin_akademik", "super_admin"],
  "/dashboard/biaya-ppdb": ["admin_akademik", "admin_keuangan", "super_admin"],
  "/dashboard/berkas": ["orang_tua", "super_admin"],
  "/dashboard/kelola-akun-keuangan": ["admin_keuangan", "super_admin"],
  "/dashboard/email-outbox": ["super_admin"],
  "/dashboard/akademik": ["super_admin"],
  "/dashboard/pengaturan": ["super_admin"],
  "/pilih-role": allRoles,
  "/ganti-password": allRoles,
};

export function rolesForPath(pathname: string): DemoRole[] {
  if (routeAccess[pathname]) return routeAccess[pathname];

  const parent = Object.keys(routeAccess)
    .filter((path) => pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  return parent ? routeAccess[parent] : ["super_admin"];
}

export function canAccess(role: DemoRole | null, pathname: string) {
  if (!role) return false;
  return rolesForPath(pathname).includes(role);
}
