import type {
  AttendanceRecord,
  AttendanceStatus,
  FinanceAdmin,
  FinanceTransaction,
  Invoice,
  NotificationItem,
  OutboxEmail,
  Payment,
  PpdbFee,
  Registration,
  StudentDocument,
} from "../types";
import { students } from "./people";

const attendanceDates = [
  "2026-09-08",
  "2026-09-15",
  "2026-09-22",
  "2026-09-29",
  "2026-10-06",
  "2026-10-13",
  "2026-10-20",
  "2026-10-27",
  "2026-11-03",
  "2026-11-10",
  "2026-11-17",
];

const attendanceSubjects = ["sub-1", "sub-3"];

function statusFor(studentIndex: number, recordIndex: number): AttendanceStatus {
  if (studentIndex === 0) {
    if (recordIndex === 3 || recordIndex === 9) return "izin";
    if (recordIndex === 12) return "sakit";
    if (recordIndex === 18) return "alpa";
    return "hadir";
  }
  const value = (recordIndex + studentIndex * 5) % 37;
  if (value === 0) return "alpa";
  if (value === 7) return "sakit";
  if (value === 14) return "izin";
  return "hadir";
}

export const attendance: AttendanceRecord[] = students.flatMap((student, studentIndex) =>
  attendanceDates.flatMap((date, dateIndex) =>
    attendanceSubjects.map((subjectId, subjectIndex) => {
      const recordIndex = dateIndex * 2 + subjectIndex;
      const status = statusFor(studentIndex, recordIndex);
      return {
        id: `att-${student.id}-${recordIndex}`,
        date,
        classId: student.classId,
        subjectId,
        studentId: student.id,
        status,
        note:
          status === "izin"
            ? "Izin keperluan keluarga"
            : status === "sakit"
              ? "Surat keterangan orang tua"
              : status === "alpa"
                ? "Tanpa keterangan"
                : undefined,
        periodId: "per-2026-ganjil",
      };
    })
  )
);

interface InvoiceSeed {
  status: Invoice["status"];
  paidAmount: number;
}

const invoiceSeeds: Record<string, InvoiceSeed[]> = {
  "st-1": [
    { status: "lunas", paidAmount: 450000 },
    { status: "lunas", paidAmount: 450000 },
    { status: "belum_bayar", paidAmount: 0 },
  ],
  "st-2": [
    { status: "lunas", paidAmount: 500000 },
    { status: "lunas", paidAmount: 500000 },
    { status: "lunas", paidAmount: 500000 },
  ],
  "st-3": [
    { status: "lunas", paidAmount: 450000 },
    { status: "dibayar_sebagian", paidAmount: 200000 },
    { status: "menunggu_verifikasi", paidAmount: 250000 },
  ],
  "st-4": [
    { status: "lunas", paidAmount: 450000 },
    { status: "lunas", paidAmount: 450000 },
    { status: "menunggu_verifikasi", paidAmount: 450000 },
  ],
  "st-5": [
    { status: "lunas", paidAmount: 450000 },
    { status: "ditolak", paidAmount: 0 },
    { status: "belum_bayar", paidAmount: 0 },
  ],
  "st-6": [
    { status: "lunas", paidAmount: 450000 },
    { status: "lunas", paidAmount: 450000 },
    { status: "lunas", paidAmount: 450000 },
  ],
  "st-7": [
    { status: "belum_bayar", paidAmount: 0 },
    { status: "lunas", paidAmount: 500000 },
    { status: "belum_bayar", paidAmount: 0 },
  ],
  "st-8": [
    { status: "lunas", paidAmount: 500000 },
    { status: "lunas", paidAmount: 500000 },
    { status: "lunas", paidAmount: 500000 },
  ],
  "st-9": [
    { status: "lunas", paidAmount: 450000 },
    { status: "belum_bayar", paidAmount: 0 },
    { status: "belum_bayar", paidAmount: 0 },
  ],
};

const months = [
  { label: "September 2026", dueDate: "2026-09-10", created: "2026-08-25" },
  { label: "Oktober 2026", dueDate: "2026-10-10", created: "2026-09-25" },
  { label: "November 2026", dueDate: "2026-11-10", created: "2026-10-25" },
];

let invoiceCounter = 0;

export const invoices: Invoice[] = students.flatMap((student) => {
  const seeds = invoiceSeeds[student.id] ?? [];
  const amount = student.classId === "cls-9a" ? 500000 : 450000;
  return seeds.map((seed, index) => {
    invoiceCounter += 1;
    const month = months[index];
    return {
      id: `inv-${invoiceCounter}`,
      number: `SPP-${month.label.slice(0, 3).toUpperCase()}-${student.nis}`,
      studentId: student.id,
      type: "spp" as const,
      periodLabel: month.label,
      description: `SPP bulan ${month.label}`,
      amount,
      paidAmount: seed.paidAmount,
      dueDate: month.dueDate,
      status: seed.status,
      createdAt: month.created,
    };
  });
});

export const payments: Payment[] = invoices.flatMap((invoice, index): Payment[] => {
  if (invoice.status === "belum_bayar") return [];
  if (invoice.status === "lunas") {
    return [
      {
        id: `pay-${invoice.id}`,
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: invoice.amount,
        method: index % 2 === 0 ? "Transfer BSI" : "Transfer Mandiri",
        proofName: `bukti-${invoice.number.toLowerCase()}.jpg`,
        status: "diverifikasi",
        submittedAt: invoice.dueDate,
        verifiedAt: invoice.dueDate,
        note: "Pembayaran sesuai nominal tagihan.",
      },
    ];
  }
  if (invoice.status === "menunggu_verifikasi") {
    return [
      {
        id: `pay-${invoice.id}`,
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: invoice.paidAmount || invoice.amount,
        method: "Transfer BSI",
        proofName: `bukti-${invoice.number.toLowerCase()}.jpg`,
        status: "menunggu",
        submittedAt: invoice.dueDate,
        note: "Mohon diverifikasi oleh admin keuangan.",
      },
    ];
  }
  if (invoice.status === "ditolak") {
    return [
      {
        id: `pay-${invoice.id}`,
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        amount: invoice.amount,
        method: "Transfer Mandiri",
        proofName: `bukti-${invoice.number.toLowerCase()}.jpg`,
        status: "ditolak",
        submittedAt: invoice.dueDate,
        verifiedAt: invoice.dueDate,
        note: "Bukti transfer tidak terbaca, mohon unggah ulang.",
      },
    ];
  }
  // dibayar sebagian
  return [
    {
      id: `pay-${invoice.id}`,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: invoice.paidAmount,
      method: "Transfer BSI",
      proofName: `bukti-${invoice.number.toLowerCase()}.jpg`,
      status: "diverifikasi",
      submittedAt: invoice.dueDate,
      verifiedAt: invoice.dueDate,
      note: "Dibayar sebagian, sisa dapat diangsur.",
    },
  ];
});

const documentTypes = [
  "Kartu Keluarga",
  "Akta Kelahiran",
  "Ijazah / Surat Keterangan Lulus",
  "Pas Foto 3x4",
  "KTP Wali",
];

let documentCounter = 0;

export const documents: StudentDocument[] = students.flatMap((student) =>
  documentTypes.flatMap((type) => {
    if (student.id === "st-1" && type === "Akta Kelahiran") return [];
    documentCounter += 1;
    return [
      {
        id: `doc-${documentCounter}`,
        studentId: student.id,
        name: type,
        type,
        fileName: `${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
        size: `${(documentCounter % 4) + 1}.${documentCounter % 9} MB`,
        uploadedAt: "2026-07-16",
        status:
          student.id === "st-5" && type === "Kartu Keluarga"
            ? ("perlu_perbaikan" as const)
            : ("lengkap" as const),
      },
    ];
  })
);

const registrationDocs = [
  { name: "Kartu Keluarga", uploaded: true },
  { name: "Akta Kelahiran", uploaded: true },
  { name: "Ijazah / SKL", uploaded: true },
  { name: "Pas Foto 3x4", uploaded: true },
  { name: "KTP Wali", uploaded: true },
];

export const registrations: Registration[] = [
  {
    id: "reg-1",
    number: "PPDB-2026-0001",
    studentName: "Aulia Rahma",
    gender: "putri",
    birthDate: "2013-05-14",
    parentName: "Dewi Lestari",
    parentPhone: "0812-3456-1122",
    parentEmail: "calonwali@demo.local",
    address: "Jl. Raya Cibinong No. 45, Bogor",
    level: 7,
    previousSchool: "SDN Cibinong 02",
    status: "menunggu_verifikasi",
    paymentStatus: "lunas",
    documents: registrationDocs,
    submittedAt: "2026-11-18",
    notes: "Berkas lengkap, menunggu verifikasi akademik.",
  },
  {
    id: "reg-2",
    number: "PPDB-2026-0002",
    studentName: "Muhammad Hafiz",
    gender: "putra",
    birthDate: "2013-02-20",
    parentName: "Andi Suherman",
    parentPhone: "0813-1122-3344",
    parentEmail: "andi@example.local",
    address: "Jl. Merpati No. 10, Depok",
    level: 7,
    previousSchool: "SDIT Al-Hikmah",
    status: "menunggu_pembayaran",
    paymentStatus: "belum",
    documents: registrationDocs.map((doc) => ({ ...doc, uploaded: doc.name !== "KTP Wali" })),
    submittedAt: "2026-11-19",
  },
  {
    id: "reg-3",
    number: "PPDB-2026-0003",
    studentName: "Salma Kamila",
    gender: "putri",
    birthDate: "2012-09-08",
    parentName: "Yusuf Maulana",
    parentPhone: "0857-5566-7788",
    parentEmail: "yusuf@example.local",
    address: "Jl. Cemara No. 7, Bekasi",
    level: 8,
    previousSchool: "MTs Nurul Iman",
    status: "perlu_perbaikan",
    paymentStatus: "menunggu_verifikasi",
    documents: registrationDocs.map((doc) => ({
      ...doc,
      uploaded: doc.name !== "Akta Kelahiran",
    })),
    submittedAt: "2026-11-16",
    notes: "Mohon unggah akta kelahiran yang terbaca jelas.",
  },
  {
    id: "reg-4",
    number: "PPDB-2026-0004",
    studentName: "Ibrahim Malik",
    gender: "putra",
    birthDate: "2013-07-01",
    parentName: "Hasan Basri",
    parentPhone: "0812-9988-7766",
    parentEmail: "hasan@example.local",
    address: "Jl. Melur No. 3, Tangerang",
    level: 7,
    previousSchool: "SDN Tangerang 05",
    status: "diterima",
    paymentStatus: "lunas",
    documents: registrationDocs,
    submittedAt: "2026-11-10",
    notes: "Diterima dan sudah melakukan daftar ulang.",
  },
  {
    id: "reg-5",
    number: "PPDB-2026-0005",
    studentName: "Naila Husna",
    gender: "putri",
    birthDate: "2012-12-12",
    parentName: "Rina Marlina",
    parentPhone: "0821-3344-5566",
    parentEmail: "rina@example.local",
    address: "Jl. Kenari No. 18, Bogor",
    level: 8,
    previousSchool: "MTs Al-Falah",
    status: "menunggu_verifikasi",
    paymentStatus: "lunas",
    documents: registrationDocs,
    submittedAt: "2026-11-20",
  },
  {
    id: "reg-6",
    number: "PPDB-2026-0006",
    studentName: "Farhan Maulana",
    gender: "putra",
    birthDate: "2011-03-19",
    parentName: "Ahmad Fauzi",
    parentPhone: "0813-7788-9900",
    parentEmail: "fauzi@example.local",
    address: "Jl. Dahlia No. 12, Jakarta",
    level: 9,
    previousSchool: "MTs Ansharussunnah",
    status: "ditolak",
    paymentStatus: "lunas",
    documents: registrationDocs,
    submittedAt: "2026-11-08",
    notes: "Tidak memenuhi syarat administrasi usia.",
  },
  {
    id: "reg-7",
    number: "PPDB-2026-0007",
    studentName: "Zahra Amelia",
    gender: "putri",
    birthDate: "2013-10-05",
    parentName: "Maya Sari",
    parentPhone: "0852-1122-3344",
    parentEmail: "maya@example.local",
    address: "Jl. Anggrek No. 6, Cibinong",
    level: 7,
    previousSchool: "SDN Cibinong 01",
    status: "draft",
    paymentStatus: "belum",
    documents: registrationDocs.map((doc) => ({ ...doc, uploaded: false })),
    submittedAt: "2026-11-23",
  },
  {
    id: "reg-8",
    number: "PPDB-2026-0008",
    studentName: "Hasan Basri",
    gender: "putra",
    birthDate: "2012-06-30",
    parentName: "Sutrisno",
    parentPhone: "0811-4455-6677",
    parentEmail: "sutrisno@example.local",
    address: "Jl. Flamboyan No. 14, Tangerang",
    level: 8,
    previousSchool: "MTs Al-Ikhlas",
    status: "menunggu_verifikasi",
    paymentStatus: "menunggu_verifikasi",
    documents: registrationDocs,
    submittedAt: "2026-11-21",
  },
  {
    id: "reg-9",
    number: "PPDB-2026-0009",
    studentName: "Maryam Sadiyah",
    gender: "putri",
    birthDate: "2011-01-17",
    parentName: "Ida Farida",
    parentPhone: "0812-6677-8899",
    parentEmail: "ida@example.local",
    address: "Jl. Kamboja No. 9, Cianjur",
    level: 9,
    previousSchool: "MTs Nurul Huda",
    status: "diterima",
    paymentStatus: "lunas",
    documents: registrationDocs,
    submittedAt: "2026-11-09",
  },
  {
    id: "reg-10",
    number: "PPDB-2026-0010",
    studentName: "Ali Akbar",
    gender: "putra",
    birthDate: "2013-08-23",
    parentName: "Rudi Hartono",
    parentPhone: "0857-3344-2211",
    parentEmail: "rudi@example.local",
    address: "Jl. Mawar No. 2, Depok",
    level: 7,
    previousSchool: "SDIT Bina Insan",
    status: "menunggu_pembayaran",
    paymentStatus: "belum",
    documents: registrationDocs.map((doc) => ({ ...doc, uploaded: doc.name !== "Ijazah / SKL" })),
    submittedAt: "2026-11-22",
  },
];

export const transactions: FinanceTransaction[] = [
  { id: "trx-1", date: "2026-11-03", type: "masuk", category: "SPP", description: "Pembayaran SPP November (12 santri)", amount: 5400000, method: "Transfer" },
  { id: "trx-2", date: "2026-11-04", type: "masuk", category: "PPDB", description: "Biaya pendaftaran santri baru (5 pendaftar)", amount: 1500000, method: "Transfer" },
  { id: "trx-3", date: "2026-11-06", type: "keluar", category: "Operasional", description: "Pembelian alat tulis dan kertas ujian", amount: 850000, method: "Tunai" },
  { id: "trx-4", date: "2026-11-10", type: "keluar", category: "Gaji", description: "Honor pengajar tahfidz pekan pertama", amount: 2400000, method: "Transfer" },
  { id: "trx-5", date: "2026-11-12", type: "masuk", category: "SPP", description: "Pelunasan tunggakan SPP Oktober (3 santri)", amount: 1350000, method: "Transfer" },
  { id: "trx-6", date: "2026-11-14", type: "keluar", category: "Perlengkapan", description: "Perbaikan sound system ruang kelas", amount: 675000, method: "Tunai" },
  { id: "trx-7", date: "2026-11-17", type: "masuk", category: "Donasi", description: "Infaq pembangunan aula serbaguna", amount: 3000000, method: "Transfer" },
  { id: "trx-8", date: "2026-11-20", type: "keluar", category: "Kegiatan", description: "Konsumsi kegiatan mabit santri", amount: 1250000, method: "Tunai" },
  { id: "trx-9", date: "2026-10-05", type: "masuk", category: "SPP", description: "Pembayaran SPP Oktober", amount: 7200000, method: "Transfer" },
  { id: "trx-10", date: "2026-10-09", type: "keluar", category: "Gaji", description: "Honor guru dan staf Oktober", amount: 8500000, method: "Transfer" },
  { id: "trx-11", date: "2026-10-15", type: "keluar", category: "Operasional", description: "Tagihan listrik dan air pesantren", amount: 1850000, method: "Transfer" },
  { id: "trx-12", date: "2026-10-22", type: "masuk", category: "PPDB", description: "Biaya pendaftaran gelombang dua", amount: 2100000, method: "Transfer" },
  { id: "trx-13", date: "2026-09-04", type: "masuk", category: "SPP", description: "Pembayaran SPP September", amount: 8100000, method: "Transfer" },
  { id: "trx-14", date: "2026-09-18", type: "keluar", category: "Kegiatan", description: "Transport studi lapangan kelas 9", amount: 2200000, method: "Tunai" },
];

export const financeAdmins: FinanceAdmin[] = [
  {
    id: "fa-1",
    name: "Ustadz Fajar Nugroho",
    email: "keuangan@demo.local",
    role: "Admin Keuangan",
    status: "aktif",
  },
  {
    id: "fa-2",
    name: "Ustadzah Laila Fitriani",
    email: "kasir@demo.local",
    role: "Kasir",
    status: "aktif",
  },
  {
    id: "fa-3",
    name: "Ustadz Dwi Prasetyo",
    email: "dwi.keuangan@demo.local",
    role: "Kasir",
    status: "nonaktif",
  },
];

export const outboxEmails: OutboxEmail[] = [
  {
    id: "mail-1",
    to: "wali@demo.local",
    subject: "Pemberitahuan Tagihan SPP November 2026",
    body: "Assalamu'alaikum, tagihan SPP bulan November 2026 sebesar Rp450.000 dapat dibayar sebelum 10 November.",
    status: "terkirim",
    sentAt: "2026-11-01 07:00",
  },
  {
    id: "mail-2",
    to: "calonwali@demo.local",
    subject: "Berkas Pendaftaran Diterima",
    body: "Berkas pendaftaran Ananda Aulia Rahma telah kami terima dan sedang diverifikasi.",
    status: "terkirim",
    sentAt: "2026-11-18 10:15",
  },
  {
    id: "mail-3",
    to: "budi.santoso@example.local",
    subject: "Reminder Pembayaran PPDB",
    body: "Mohon segera menyelesaikan pembayaran biaya pendaftaran agar proses verifikasi dapat dilanjutkan.",
    status: "gagal",
    sentAt: "2026-11-19 09:40",
    error: "Alamat email tidak valid",
  },
  {
    id: "mail-4",
    to: "rahmawati@demo.local",
    subject: "Rapor Semester Ganjil Telah Terbit",
    body: "Rapor Ananda Muhammad Rizky Pratama telah diterbitkan dan dapat dibaca pada menu Rapor.",
    status: "menunggu",
    sentAt: "2026-11-24 06:30",
  },
  {
    id: "mail-5",
    to: "siti@demo.local",
    subject: "Unggahan Ulang Bukti Pembayaran",
    body: "Bukti transfer yang diunggah tidak terbaca. Mohon unggah ulang melalui menu Tagihan.",
    status: "gagal",
    sentAt: "2026-11-21 14:05",
    error: "Lampiran melebihi batas ukuran",
  },
];

export const ppdbFees: PpdbFee[] = [
  { id: "fee-1", label: "Biaya Formulir Pendaftaran", amount: 150000, required: true },
  { id: "fee-2", label: "Biaya Administrasi Berkas", amount: 100000, required: true },
  { id: "fee-3", label: "Uang Pangkal (dapat diangsur)", amount: 1250000, required: false },
  { id: "fee-4", label: "Seragam dan Perlengkapan", amount: 650000, required: false },
];

export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "2 tugas belum dikumpulkan",
    message: "Ahmad Fauzan memiliki tugas Insya dan hafalan Al-Mulk yang mendekati tenggat.",
    date: "2026-11-24",
    read: false,
    type: "warning",
  },
  {
    id: "notif-2",
    title: "Tagihan SPP November",
    message: "Tagihan SPP November 2026 belum dibayar. Jatuh tempo 10 November 2026.",
    date: "2026-11-10",
    read: false,
    type: "danger",
  },
  {
    id: "notif-3",
    title: "Rapor ganjil telah terbit",
    message: "Rapor Aisyah Nur Fadhilah untuk semester ganjil sudah dapat dibaca.",
    date: "2026-11-21",
    read: true,
    type: "success",
  },
  {
    id: "notif-4",
    title: "Pembayaran sedang diverifikasi",
    message: "Bukti transfer SPP November sedang diperiksa admin keuangan.",
    date: "2026-11-20",
    read: true,
    type: "info",
  },
  {
    id: "notif-5",
    title: "Berkas belum lengkap",
    message: "Akta kelahiran Ahmad Fauzan belum diunggah. Mohon lengkapi pada menu Berkas.",
    date: "2026-11-18",
    read: false,
    type: "warning",
  },
];
