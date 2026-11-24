# demolms — Demo Frontend LMS

**demolms** adalah demo frontend Learning Management System untuk Pesantren/Sekolah Ansharussunnah. Dibangun dengan **Next.js App Router, TypeScript strict, Tailwind CSS, dan lucide-react**.

> **Penting:** Ini demo frontend-only untuk presentasi UX. Tidak ada backend, database, API eksternal, autentikasi nyata, pembayaran, atau pengiriman email. Semua data adalah mock lokal dan tersimpan di `localStorage` browser.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Tidak perlu file `.env`, database, atau service eksternal.

Perintah lain:

```bash
npm run typecheck   # cek TypeScript strict
npm run build       # build produksi
npm start           # jalankan hasil build
```

## Akun Demo

Semua akun memakai password **`demo123`**. Login tidak benar-benar diautentikasi; halaman `/login` hanya mensimulasikan pemilihan peran.

| Email | Peran | Konteks |
| --- | --- | --- |
| `wali@demo.local` | Orang Tua / Wali | 2 anak: Ahmad Fauzan (7A) & Aisyah Nur (9A) |
| `siswa@demo.local` | Santri / Siswa | Ahmad Fauzan, kelas 7A |
| `guru@demo.local` | Guru | Ustadz Ahmad Syakir, kelas 7A–9A |
| `akademik@demo.local` | Admin Akademik | Pendaftaran & data master |
| `keuangan@demo.local` | Admin Keuangan | Tagihan, verifikasi, laporan |
| `superadmin@demo.local` | Super Admin | Ringkasan lintas area & outbox |
| `calonwali@demo.local` | Calon Wali | Alur PPDB berjalan |

## Yang dapat dicoba

- **Publik:** landing page, informasi pendaftaran, formulir multi-step dengan validasi, unggah dokumen & bukti transfer (progres palsu), nomor pendaftaran, cek status, login demo, lupa/reset password.
- **Wali:** ganti anak aktif, prioritas tugas, SPP, berkas, kehadiran, nilai, rapor.
- **Siswa:** materi, tugas (draft & kirim dengan konfirmasi), ujian dengan timer yang dapat dipercepat, kehadiran, rapor.
- **Guru:** buat materi/tugas/ujian, publikasi, penilaian tugas, rekap ujian, absensi, rekap nilai, terbitkan rapor.
- **Admin Akademik:** verifikasi pendaftar, data siswa/guru/kelas/mapel/periode, kenaikan kelas, biaya PPDB.
- **Admin Keuangan:** buat tagihan, verifikasi/tolak pembayaran, kasir tunai, rekap tunggakan, laporan arus kas.
- **Super Admin:** ringkasan lintas area, email outbox mock, pengaturan demo.

Kontrol presentasi tersedia dari menu profil di kanan atas: **Skenario A/B/C**, **Reset Demo**, dan **Ganti Peran**.

## Pengujian otomatis

```bash
npm test          # jalankan seluruh suite sekali
npm run test:watch
```

Menggunakan **Vitest + React Testing Library (jsdom)** untuk menguji `DemoContext` secara langsung, bukan sekadar helper terpisah. Cakupan utama (17 tes):

- login peran, `loginWithEmail`, ganti anak/peran/periode, logout;
- buat/publikasi tugas, draft siswa, kirim, penilaian, status terlambat;
- materi draft → publikasi, simpan absensi (termasuk menimpa data lama);
- buat/publikasi ujian, mulai, jawab, kirim (skor otomatis), sahkan nilai;
- ubah nilai dan terbitkan rapor;
- tagihan, unggah bukti, verifikasi/tolak, kasir tunai, transaksi;
- unggah/hapus berkas, keputusan pendaftaran, verifikasi pembayaran PPDB;
- CRUD data master, kenaikan kelas, akun keuangan, biaya PPDB, retry email;
- Skenario A/B/C dan `resetDemo`.

File tes ada di `src/context/*.test.tsx`, dengan harness di `src/test/harness.tsx`. Delay aksi 300–700 ms dipercepat memakai fake timer, jadi suite selesai dalam hitungan detik tanpa backend.

## Struktur proyek

```
src/
  app/                     # route App Router (publik + dashboard)
  components/
    layout/                # AppShell, Sidebar, Topbar, MobileBottomNav
    ui/                    # komponen reusable (badge, tabel, dialog, dsb.)
    public/                # header & footer publik
  context/demo-context.tsx # state global + semua aksi mock + localStorage
  features/
    dashboard/             # beranda per peran
    shared/                # materi, tugas, ujian, absensi, rapor, tagihan, berkas, profil
    guru/                  # form tugas/ujian, preview, rekap
    admin/                 # data master, verifikasi, biaya, sistem
    finance/               # tagihan, verifikasi, kasir, rekap, laporan
  lib/
    mock-data.ts           # agregator state awal & skenario
    seed/                  # seed per domain (people, academic, grades, operations)
    types.ts               # tipe domain
    nav.tsx                # navigasi per peran
    permissions.ts         # aturan akses route per peran
    ppdb-draft.ts          # draft pendaftaran di localStorage
  test/                    # setup Vitest + harness DemoProvider
```

## Catatan implementasi

- State disimpan di `DemoContext` dan dipertahankan ke `localStorage` (kunci `demolms-demo-v1`). Data sesi login, anak aktif, periode, dan tema ikut tersimpan.
- Aksi simpan/publikasi/unggah/verifikasi memiliki delay 300–700 ms agar loading state dapat dipresentasikan.
- Tombol unduh/cetak hanya memunculkan toast “PDF demo siap diunduh”.
- Tidak ada fetch ke URL eksternal dan tidak ada rahasia/kredensial produksi.
- Skenario presentasi: lihat [docs/DEMO-FLOWS.md](docs/DEMO-FLOWS.md).

## Batasan

- Data kembali ke kondisi awal bila `localStorage` dibersihkan atau tombol **Reset Demo** ditekan.
- Demo tidak mengirim email/WhatsApp, tidak memproses pembayaran, dan tidak menyimpan file sungguhan.
- Semua nama, nomor telepon, rekening, dan email bersifat fiktif.
