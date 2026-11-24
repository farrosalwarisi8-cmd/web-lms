# Panduan Demo & Route

Semua data adalah simulasi lokal. Tidak ada backend, autentikasi, pembayaran, atau email nyata.
Password semua akun demo: `demo123`.

## 1. Route

### Publik

| Route | Isi |
| --- | --- |
| `/` | Landing page sekolah/LMS |
| `/pendaftaran` | Informasi, jadwal, biaya, dan tahapan PPDB |
| `/pendaftaran/form` | Formulir calon santri & wali (validasi, simpan draft) |
| `/pendaftaran/dokumen` | Unggah 5 dokumen wajib (progres palsu) |
| `/pendaftaran/pembayaran` | Ringkasan biaya & unggah bukti transfer |
| `/pendaftaran/sukses` | Nomor pendaftaran & instruksi lanjutan |
| `/cek-pendaftaran` | Pencarian status berdasarkan nomor |
| `/login` | Simulasi login & pemilihan peran |
| `/lupa-password` | Simulasi permintaan reset |
| `/reset-password` | Simulasi OTP + password baru |
| `/pilih-role` | Pemilih peran demo cepat |
| `/ganti-password` | Simulasi ganti password |

### Dashboard

`/dashboard` — beranda sesuai peran
`/dashboard/materi` · `/dashboard/tugas` · `/dashboard/tugas/buat`
`/dashboard/ujian` · `/dashboard/ujian/buat` · `/dashboard/ujian/preview` · `/dashboard/ujian/kerjakan` · `/dashboard/ujian/rekap`
`/dashboard/absensi` · `/dashboard/rekap-nilai` · `/dashboard/rapor`
`/dashboard/tagihan` · `/dashboard/keuangan` · `/dashboard/kasir` · `/dashboard/rekap-keuangan` · `/dashboard/laporan`
`/dashboard/siswa` · `/dashboard/guru` · `/dashboard/kelas` · `/dashboard/mapel` · `/dashboard/periode-ajaran` · `/dashboard/kenaikan-kelas`
`/dashboard/verifikasi-pendaftaran` · `/dashboard/biaya-ppdb` · `/dashboard/berkas`
`/dashboard/kelola-akun-keuangan` · `/dashboard/email-outbox`
`/dashboard/akademik` · `/dashboard/pengaturan` · `/dashboard/profil`

Aturan akses per peran ada di `src/lib/permissions.ts`. Route yang tidak diizinkan menampilkan halaman **Akses demo dibatasi** (bukan keamanan nyata).

## 2. Alur demo per peran

### Calon Wali / Pengunjung

1. Buka `/pendaftaran` → **Mulai Formulir Pendaftaran**.
2. Isi data (coba kosongkan kolom wajib untuk melihat error inline), simpan draft.
3. Unggah kelima dokumen; progres 0–100% muncul. Lanjut ke pembayaran.
4. Unggah bukti transfer → tombol **Kirim Pendaftaran** aktif → konfirmasi.
5. Salin nomor pendaftaran pada halaman sukses, lalu buka `/cek-pendaftaran` untuk melihat timeline.
6. Login `calonwali@demo.local` atau klik **Buka Dashboard Calon Wali** untuk melihat stepper status.

### Wali (`wali@demo.local`)

1. Beranda menampilkan “Yang perlu diperhatikan”, tugas belum dikumpulkan, SPP, berkas, kehadiran.
2. Ganti anak dari selector di topbar: data tugas, nilai, SPP, dan berkas berubah.
3. Buka **Tagihan SPP** → **Unggah Bukti** pada tagihan November → status menjadi *Menunggu verifikasi*.
4. Coba **Berkas** → unggah akta kelahiran yang belum ada → persentase kelengkapan naik.
5. **Rapor** menampilkan rapor yang sudah terbit; tombol unduh hanya toast demo.
6. Wali tidak dapat mengubah nilai atau mengumpulkan tugas.

### Siswa (`siswa@demo.local`)

1. Beranda “Belajar hari ini” menampilkan tugas terdekat dan ujian aktif.
2. **Tugas** → buka tugas → simpan draft, lalu kirim dengan dialog konfirmasi. Status berubah menjadi Terkirim/Terlambat.
3. **Ujian** → **Mulai Ujian** pada ujian Bahasa Arab. Timer berjalan; gunakan **Percepat** untuk presentasi. Tinjau jawaban lalu kirim.
4. Setelah guru menilai, nilai tampil di daftar ujian dan rapor.

### Guru (`guru@demo.local`)

1. Beranda menunjukkan absensi belum diisi, tugas belum dinilai, ujian draft.
2. **Tugas** → lihat pengumpulan → **Nilai** → isi skor & feedback. Nilai muncul untuk siswa/wali.
3. **Tugas → Buat Tugas** → simpan draft atau publikasikan.
4. **Ujian → Buat Ujian** → tambah soal PG/esai → publikasikan → **Preview**.
5. **Absensi** → pilih kelas/mapel/tanggal → ubah status → simpan.
6. **Rekap Nilai** → ubah nilai komponen; **Rapor** → terbitkan rapor siswa.

### Admin Akademik (`akademik@demo.local`)

1. Beranda menampilkan antrean verifikasi dan sebaran kelas.
2. **Verifikasi Pendaftar** → Periksa → Terima / Tolak / Minta Perbaikan. Verifikasi pembayaran PPDB bila perlu.
3. **Siswa / Guru / Kelas / Mapel / Periode** → tambah atau ubah data; perubahan langsung terlihat di halaman lain.
4. **Kenaikan Kelas** → pilih kelas asal/tujuan → pilih santri → proses.
5. **Biaya PPDB** → ubah nominal dan cek perubahan di `/pendaftaran`.

### Admin Keuangan (`keuangan@demo.local`)

1. Beranda menampilkan antrean pembayaran, arus kas, dan tunggakan.
2. **Keuangan** → Periksa bukti → Setujui/Tolak. Status tagihan wali berubah.
3. **Tagihan** → Buat Tagihan baru untuk santri.
4. **Kasir** → pilih tagihan → proses pembayaran tunai → kwitansi demo.
5. **Rekap Keuangan / Laporan** → lihat rekap bulanan, tunggakan, ekspor/cetak (toast demo).

### Super Admin (`superadmin@demo.local`)

1. Beranda ringkasan akademik, pendaftaran, keuangan, dan masalah data.
2. **Email Outbox** → buka email, lihat error, kirim ulang email gagal.
3. **Pengaturan** → muat skenario atau reset demo.
4. Akses area akademik/keuangan verifikasi untuk melihat lintas area.

## 3. Skenario presentasi

Buka menu profil kanan atas → bagian **Skenario presentasi**.

### Skenario A — Wali perlu perhatian

- Anak pertama (Ahmad Fauzan) memiliki 2 tugas belum dikumpulkan.
- SPP November belum dibayar.
- Akta kelahiran belum diunggah.
- Kehadiran 82% dengan 1 alpa.

Cocok dimulai dari login wali, lanjut ke tagihan/berkas.

### Skenario B — Guru punya pekerjaan

- Lima pengumpulan tugas menunggu penilaian.
- Absensi kelas belum diisi untuk tanggal demo.
- Satu ujian draft siap dipreview.

Cocok dimulai dari login guru → tugas → absensi → preview ujian.

### Skenario C — Keuangan punya antrean

- Delapan pembayaran menunggu verifikasi.
- Tunggakan SPP tetap ada.
- Transaksi pemasukan/pengeluaran bulan berjalan.

Cocok dimulai dari login admin keuangan → halaman keuangan.

**Reset Demo** mengembalikan seluruh data mock ke kondisi awal (peran yang sedang login dipertahankan agar demo tidak terputus).

## 4. Hal yang sengaja disimulasikan

| Interaksi | Perilaku demo |
| --- | --- |
| Login | Memilih peran, tanpa autentikasi |
| Upload file | Hanya nama file yang disimpan; progres 0–100% |
| Pembayaran | Mengubah status tagihan, tanpa transaksi |
| Email/WhatsApp | Hanya notifikasi in-app dan outbox mock |
| Unduh/cetak | Toast “PDF demo siap diunduh” |
| Timer ujian | Hitung mundur lokal, bisa dipercepat |
| Pergantian peran | Langsung mengganti navigasi & data |

## 5. Uji cepat sebelum presentasi

1. `npm run typecheck` dan `npm run build`.
2. Login satu per satu ke tujuh akun demo.
3. Ganti anak pada akun wali.
4. Kirim tugas sebagai siswa, lalu nilai sebagai guru.
5. Unggah bukti SPP sebagai wali, verifikasi sebagai admin keuangan.
6. Muat Skenario A/B/C dan Reset Demo.
7. Pastikan refresh halaman tidak membuat aplikasi crash.
