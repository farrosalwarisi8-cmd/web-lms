export type DemoRole =
  | "calon_wali"
  | "orang_tua"
  | "siswa"
  | "guru"
  | "admin_akademik"
  | "admin_keuangan"
  | "super_admin";

export type TaskStatus = "draft" | "published";
export type SubmissionStatus =
  | "belum"
  | "draft"
  | "terkirim"
  | "terlambat"
  | "dinilai"
  | "perlu_revisi";

export type ExamStatus = "akan_datang" | "aktif" | "ditutup";
export type AttemptStatus = "belum" | "mengerjakan" | "terkirim" | "dinilai";

export type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpa";

export type InvoiceStatus =
  | "belum_bayar"
  | "menunggu_verifikasi"
  | "dibayar_sebagian"
  | "lunas"
  | "ditolak";

export type PaymentStatus = "menunggu" | "diverifikasi" | "ditolak";

export type RegistrationStatus =
  | "draft"
  | "menunggu_pembayaran"
  | "menunggu_verifikasi"
  | "perlu_perbaikan"
  | "diterima"
  | "ditolak";

export type MaterialStatus = "draft" | "published";
export type ReportCardStatus = "draft" | "published";
export type DocumentStatus = "lengkap" | "perlu_perbaikan";

export interface Student {
  id: string;
  nis: string;
  name: string;
  classId: string;
  parentId: string;
  gender: "putra" | "putri";
  birthPlace: string;
  birthDate: string;
  address: string;
  status: "aktif" | "nonaktif";
  joinedAt: string;
}

export interface ParentAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  childIds: string[];
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  subjectIds: string[];
  classIds: string[];
  status: "aktif" | "nonaktif";
}

export interface Jenjang {
  id: string;
  name: string;
  description: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  jenjangId: string;
  level: number;
  homeroomTeacherId: string;
  room: string;
  capacity: number;
  periodId: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: "Diniyah" | "Umum";
}

export interface SchoolPeriod {
  id: string;
  name: string;
  semester: "Ganjil" | "Genap";
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  content: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  status: MaterialStatus;
  fileName?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  instructions: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  deadline: string;
  maxScore: number;
  allowRevision: boolean;
  attachmentName?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  status: SubmissionStatus;
  content: string;
  fileName?: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  updatedAt: string;
}

export interface ExamQuestion {
  id: string;
  type: "pilihan_ganda" | "esai";
  text: string;
  options?: string[];
  correctIndex?: number;
  score: number;
  imageMock?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  durationMinutes: number;
  scheduledAt: string;
  status: ExamStatus;
  published: boolean;
  questions: ExamQuestion[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string>;
  status: AttemptStatus;
  startedAt?: string;
  submittedAt?: string;
  score?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  subjectId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  periodId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  periodId: string;
  assignmentScore: number;
  examScore: number;
  memorizationScore: number;
  akhlakScore: number;
  note?: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  periodId: string;
  status: ReportCardStatus;
  homeroomNote: string;
  publishedAt?: string;
}

export interface Invoice {
  id: string;
  number: string;
  studentId: string;
  type: "spp" | "pendaftaran" | "kegiatan";
  periodLabel: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: "Transfer BSI" | "Transfer Mandiri" | "Tunai";
  proofName?: string;
  status: PaymentStatus;
  submittedAt: string;
  verifiedAt?: string;
  note?: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  name: string;
  type: string;
  fileName: string;
  size: string;
  uploadedAt: string;
  status: DocumentStatus;
}

export interface RegistrationDocument {
  name: string;
  uploaded: boolean;
}

export interface Registration {
  id: string;
  number: string;
  studentName: string;
  gender: "putra" | "putri";
  birthDate: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  level: 7 | 8 | 9;
  previousSchool: string;
  status: RegistrationStatus;
  paymentStatus: "belum" | "menunggu_verifikasi" | "lunas";
  documents: RegistrationDocument[];
  submittedAt: string;
  notes?: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  type: "masuk" | "keluar";
  category: string;
  description: string;
  amount: number;
  method?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success" | "danger";
}

export interface FinanceAdmin {
  id: string;
  name: string;
  email: string;
  role: "Admin Keuangan" | "Kasir";
  status: "aktif" | "nonaktif";
}

export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: "terkirim" | "gagal" | "menunggu";
  sentAt: string;
  error?: string;
}

export interface PpdbFee {
  id: string;
  label: string;
  amount: number;
  required: boolean;
}

export interface ToastState {
  id: string;
  message: string;
  description?: string;
  type: "success" | "error" | "info";
}

export type ScenarioKey = "default" | "wali_attention" | "guru_work" | "keuangan_queue";

export interface DemoState {
  isLoggedIn: boolean;
  activeRole: DemoRole | null;
  activeChildId: string | null;
  activeParentId: string;
  activePeriodId: string;
  activeTeacherId: string;
  notifications: NotificationItem[];
  parents: ParentAccount[];
  students: Student[];
  tasks: Task[];
  submissions: Submission[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  attendance: AttendanceRecord[];
  materials: Material[];
  grades: Grade[];
  reportCards: ReportCard[];
  invoices: Invoice[];
  payments: Payment[];
  documents: StudentDocument[];
  registrations: Registration[];
  teachers: Teacher[];
  classes: SchoolClass[];
  jenjang: Jenjang[];
  subjects: Subject[];
  schoolPeriods: SchoolPeriod[];
  transactions: FinanceTransaction[];
  financeAdmins: FinanceAdmin[];
  outboxEmails: OutboxEmail[];
  ppdbFees: PpdbFee[];
  toast: ToastState | null;
  scenario: ScenarioKey;
  theme: "light" | "warm";
}
