"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AttendanceRecord,
  DemoRole,
  DemoState,
  Exam,
  ExamAttempt,
  FinanceAdmin,
  Invoice,
  Material,
  Registration,
  RegistrationStatus,
  ScenarioKey,
  SchoolPeriod,
  Student,
  Subject,
  Submission,
  Task,
  Teacher,
  ToastState,
} from "@/lib/types";
import { createInitialState, createStateForScenario, demoAccounts, scenarioMeta } from "@/lib/mock-data";
import { DEMO_TODAY, attemptScore, todayISO } from "@/lib/utils";

const STORAGE_KEY = "demolms-demo-v1";

type NewTask = Omit<Task, "id" | "createdAt">;
type NewExam = Omit<Exam, "id">;
type NewMaterial = Omit<Material, "id" | "createdAt">;
type NewAttendance = Omit<AttendanceRecord, "id">;

interface DemoContextValue {
  state: DemoState;
  hydrated: boolean;
  loginAs: (role: DemoRole) => void;
  loginWithEmail: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  switchRole: (role: DemoRole) => void;
  selectChild: (childId: string) => void;
  selectPeriod: (periodId: string) => void;
  showToast: (message: string, type?: ToastState["type"], description?: string) => void;
  dismissToast: () => void;
  addTask: (input: NewTask) => Promise<void>;
  updateTask: (id: string, input: Partial<Task>) => Promise<void>;
  publishTask: (id: string) => Promise<void>;
  saveTaskDraft: (taskId: string, studentId: string, content: string) => Promise<void>;
  submitTask: (
    taskId: string,
    studentId: string,
    content: string,
    fileName?: string
  ) => Promise<void>;
  gradeSubmission: (id: string, score: number, feedback: string) => Promise<void>;
  addExam: (input: NewExam) => Promise<void>;
  publishExam: (id: string) => Promise<void>;
  startExam: (examId: string, studentId: string) => Promise<void>;
  answerExamQuestion: (
    examId: string,
    studentId: string,
    questionId: string,
    answer: string
  ) => void;
  submitExam: (examId: string, studentId: string) => Promise<void>;
  gradeExamAttempt: (attemptId: string, score: number) => Promise<void>;
  saveAttendance: (records: NewAttendance[]) => Promise<void>;
  addMaterial: (input: NewMaterial) => Promise<void>;
  publishMaterial: (id: string) => Promise<void>;
  updateGrade: (
    gradeId: string,
    values: { assignmentScore: number; examScore: number; memorizationScore: number; akhlakScore: number; note?: string }
  ) => Promise<void>;
  publishReportCard: (id: string) => Promise<void>;
  createInvoice: (input: {
    studentId: string;
    type: Invoice["type"];
    periodLabel: string;
    description: string;
    amount: number;
    dueDate: string;
  }) => Promise<void>;
  uploadPaymentProof: (input: {
    invoiceId: string;
    amount: number;
    method: "Transfer BSI" | "Transfer Mandiri" | "Tunai";
    fileName: string;
  }) => Promise<void>;
  verifyPayment: (paymentId: string, approve: boolean, note?: string) => Promise<void>;
  recordCashPayment: (invoiceId: string, amount: number) => Promise<void>;
  uploadDocument: (studentId: string, name: string, fileName: string) => Promise<void>;
  deleteDocument: (id: string) => void;
  submitRegistration: (input: {
    studentName: string;
    gender: Student["gender"];
    birthDate: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    address: string;
    level: 7 | 8 | 9;
    previousSchool: string;
    documents: string[];
  }) => Promise<string>;
  updateRegistrationStatus: (
    id: string,
    status: RegistrationStatus,
    note?: string
  ) => Promise<void>;
  verifyRegistrationPayment: (id: string) => Promise<void>;
  addStudent: (input: {
    name: string;
    classId: string;
    gender: Student["gender"];
    parentName: string;
    parentPhone: string;
    birthPlace?: string;
    birthDate?: string;
    address?: string;
  }) => Promise<void>;
  updateStudent: (id: string, values: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (input: {
    name: string;
    email: string;
    phone: string;
    subjectIds: string[];
    classIds: string[];
  }) => Promise<void>;
  updateTeacher: (id: string, values: Partial<Teacher>) => Promise<void>;
  addJenjang: (input: { name: string; description: string }) => Promise<void>;
  addClass: (input: {
    name: string;
    jenjangId: string;
    level: number;
    homeroomTeacherId: string;
    room: string;
  }) => Promise<void>;
  addSubject: (input: { code: string; name: string; category: Subject["category"] }) => Promise<void>;
  addPeriod: (input: {
    name: string;
    semester: SchoolPeriod["semester"];
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  promoteStudents: (studentIds: string[], targetClassId: string) => Promise<void>;
  addTransaction: (input: {
    type: "masuk" | "keluar";
    category: string;
    description: string;
    amount: number;
    method?: string;
  }) => Promise<void>;
  addFinanceAdmin: (input: {
    name: string;
    email: string;
    role: FinanceAdmin["role"];
  }) => Promise<void>;
  updateFinanceAdminStatus: (id: string, status: FinanceAdmin["status"]) => void;
  updatePpdbFee: (id: string, amount: number) => Promise<void>;
  retryEmail: (id: string) => Promise<void>;
  markNotificationsRead: () => void;
  resetDemo: () => void;
  seedScenario: (scenario: ScenarioKey) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

let counter = 0;
function makeId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DemoState>;
        if (parsed && Array.isArray(parsed.students)) {
          const base = createInitialState();
          const merged: DemoState = { ...base, ...parsed, toast: null };
          const defaultJenjangId = merged.jenjang[0]?.id ?? base.jenjang[0]?.id ?? "";
          merged.classes = merged.classes.map((cls) =>
            cls.jenjangId ? cls : { ...cls, jenjangId: defaultJenjangId }
          );
          setState(merged);
        }
      }
    } catch {
      // Data demo rusak atau tidak tersedia: gunakan data awal.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const { toast: _toast, ...persisted } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // localStorage penuh atau diblokir: demo tetap berjalan di memori.
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!state.toast) return;
    const id = window.setTimeout(() => {
      setState((prev) => (prev.toast?.id === state.toast?.id ? { ...prev, toast: null } : prev));
    }, 3200);
    return () => window.clearTimeout(id);
  }, [state.toast]);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success", description?: string) => {
      setState((prev) => ({
        ...prev,
        toast: { id: makeId("toast"), message, type, description },
      }));
    },
    []
  );

  const dismissToast = useCallback(() => {
    setState((prev) => ({ ...prev, toast: null }));
  }, []);

  const loginAs = useCallback((role: DemoRole) => {
    const account = demoAccounts.find((item) => item.role === role);
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      activeRole: role,
      activeChildId:
        role === "orang_tua" || role === "siswa" ? "st-1" : prev.activeChildId,
      activeParentId: "par-1",
      activeTeacherId: "tch-1",
      toast: {
        id: makeId("toast"),
        message: `Masuk sebagai ${account?.label ?? role}`,
        description: account?.description,
        type: "success",
      },
    }));
  }, []);

  const loginWithEmail = useCallback(
    (email: string, password: string) => {
      const account = demoAccounts.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!account) {
        return { ok: false, error: "Email demo tidak ditemukan. Gunakan salah satu akun demo." };
      }
      if (password !== account.password) {
        return { ok: false, error: "Password demo salah. Gunakan password demo123." };
      }
      loginAs(account.role);
      return { ok: true };
    },
    [loginAs]
  );

  const logout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoggedIn: false,
      activeRole: null,
      toast: {
        id: makeId("toast"),
        message: "Anda telah keluar dari demo",
        type: "info",
      },
    }));
  }, []);

  const switchRole = useCallback((role: DemoRole) => {
    const account = demoAccounts.find((item) => item.role === role);
    setState((prev) => ({
      ...prev,
      isLoggedIn: true,
      activeRole: role,
      activeChildId: role === "orang_tua" || role === "siswa" ? "st-1" : prev.activeChildId,
      toast: {
        id: makeId("toast"),
        message: `Peran aktif: ${account?.label ?? role}`,
        description: "Navigasi dan data menyesuaikan peran demo.",
        type: "info",
      },
    }));
  }, []);

  const selectChild = useCallback((childId: string) => {
    setState((prev) => ({ ...prev, activeChildId: childId }));
  }, []);

  const selectPeriod = useCallback((periodId: string) => {
    setState((prev) => ({ ...prev, activePeriodId: periodId }));
  }, []);

  const addTask = useCallback(
    async (input: NewTask) => {
      await delay(500);
      const task: Task = { ...input, id: makeId("tsk"), createdAt: todayISO() };
      setState((prev) => ({
        ...prev,
        tasks: [task, ...prev.tasks],
        toast: {
          id: makeId("toast"),
          message: input.status === "draft" ? "Draft tugas disimpan" : "Tugas dipublikasikan",
          description: `Tugas "${input.title}" tersedia untuk kelas terkait.`,
          type: "success",
        },
      }));
    },
    []
  );

  const updateTask = useCallback(async (id: string, input: Partial<Task>) => {
    await delay(400);
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...input } : task)),
      toast: { id: makeId("toast"), message: "Tugas diperbarui", type: "success" },
    }));
  }, []);

  const publishTask = useCallback(async (id: string) => {
    await delay(450);
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status: "published" } : task
      ),
      toast: {
        id: makeId("toast"),
        message: "Tugas dipublikasikan",
        description: "Siswa dan wali dapat melihat tugas ini sekarang.",
        type: "success",
      },
    }));
  }, []);

  const saveTaskDraft = useCallback(
    async (taskId: string, studentId: string, content: string) => {
      await delay(400);
      setState((prev) => {
        const existing = prev.submissions.find(
          (item) => item.taskId === taskId && item.studentId === studentId
        );
        const draft: Submission = {
          id: existing?.id ?? makeId("subm"),
          taskId,
          studentId,
          status: "draft",
          content,
          updatedAt: todayISO(),
        };
        return {
          ...prev,
          submissions: existing
            ? prev.submissions.map((item) => (item.id === existing.id ? { ...item, ...draft } : item))
            : [draft, ...prev.submissions],
          toast: {
            id: makeId("toast"),
            message: "Draft tugas disimpan",
            description: "Anda dapat melanjutkan dan mengirim nanti.",
            type: "info",
          },
        };
      });
    },
    []
  );

  const submitTask = useCallback(
    async (taskId: string, studentId: string, content: string, fileName?: string) => {
      await delay(600);
      setState((prev) => {
        const task = prev.tasks.find((item) => item.id === taskId);
        const late = task ? task.deadline < DEMO_TODAY : false;
        const existing = prev.submissions.find(
          (item) => item.taskId === taskId && item.studentId === studentId
        );
        const submission: Submission = {
          id: existing?.id ?? makeId("subm"),
          taskId,
          studentId,
          status: late ? "terlambat" : "terkirim",
          content,
          fileName,
          submittedAt: todayISO(),
          updatedAt: todayISO(),
        };
        return {
          ...prev,
          submissions: existing
            ? prev.submissions.map((item) => (item.id === existing.id ? submission : item))
            : [submission, ...prev.submissions],
          toast: {
            id: makeId("toast"),
            message: late ? "Tugas terkirim (terlambat)" : "Tugas berhasil dikirim",
            description: late
              ? "Guru akan melihat status keterlambatan pengumpulan."
              : "Guru akan menerima notifikasi pengumpulan tugas.",
            type: late ? "info" : "success",
          },
        };
      });
    },
    []
  );

  const gradeSubmission = useCallback(
    async (id: string, score: number, feedback: string) => {
      await delay(500);
      setState((prev) => ({
        ...prev,
        submissions: prev.submissions.map((item) =>
          item.id === id
            ? { ...item, score, feedback, status: "dinilai", updatedAt: todayISO() }
            : item
        ),
        toast: {
          id: makeId("toast"),
          message: "Penilaian disimpan",
          description: "Nilai dan feedback terlihat oleh siswa serta wali.",
          type: "success",
        },
      }));
    },
    []
  );

  const addExam = useCallback(async (input: NewExam) => {
    await delay(500);
    const exam: Exam = { ...input, id: makeId("exm") };
    setState((prev) => ({
      ...prev,
      exams: [exam, ...prev.exams],
      toast: {
        id: makeId("toast"),
        message: input.published ? "Ujian dipublikasikan" : "Draft ujian disimpan",
        type: "success",
      },
    }));
  }, []);

  const publishExam = useCallback(async (id: string) => {
    await delay(450);
    setState((prev) => ({
      ...prev,
      exams: prev.exams.map((exam) =>
        exam.id === id ? { ...exam, published: true, status: "aktif" } : exam
      ),
      toast: {
        id: makeId("toast"),
        message: "Ujian aktif",
        description: "Siswa dapat mulai mengerjakan ujian ini.",
        type: "success",
      },
    }));
  }, []);

  const startExam = useCallback(async (examId: string, studentId: string) => {
    await delay(400);
    setState((prev) => {
      const existing = prev.examAttempts.find(
        (item) => item.examId === examId && item.studentId === studentId
      );
      if (existing) {
        return {
          ...prev,
          examAttempts: prev.examAttempts.map((item) =>
            item.id === existing.id ? { ...item, status: "mengerjakan" } : item
          ),
        };
      }
      const attempt: ExamAttempt = {
        id: makeId("att"),
        examId,
        studentId,
        answers: {},
        status: "mengerjakan",
        startedAt: todayISO(),
      };
      return { ...prev, examAttempts: [attempt, ...prev.examAttempts] };
    });
  }, []);

  const answerExamQuestion = useCallback(
    (examId: string, studentId: string, questionId: string, answer: string) => {
      setState((prev) => ({
        ...prev,
        examAttempts: prev.examAttempts.map((attempt) =>
          attempt.examId === examId && attempt.studentId === studentId
            ? { ...attempt, answers: { ...attempt.answers, [questionId]: answer } }
            : attempt
        ),
      }));
    },
    []
  );

  const submitExam = useCallback(async (examId: string, studentId: string) => {
    await delay(600);
    setState((prev) => {
      const attempt = prev.examAttempts.find(
        (item) => item.examId === examId && item.studentId === studentId
      );
      if (!attempt) return prev;
      return {
        ...prev,
        examAttempts: prev.examAttempts.map((item) =>
          item.id === attempt.id
            ? {
                ...item,
                status: "terkirim",
                submittedAt: todayISO(),
                score: attemptScore(prev, examId, attempt.answers),
              }
            : item
        ),
        toast: {
          id: makeId("toast"),
          message: "Jawaban ujian terkirim",
          description: "Nilai akan tampil setelah guru menyelesaikan penilaian.",
          type: "success",
        },
      };
    });
  }, []);

  const gradeExamAttempt = useCallback(async (attemptId: string, score: number) => {
    await delay(450);
    setState((prev) => ({
      ...prev,
      examAttempts: prev.examAttempts.map((attempt) =>
        attempt.id === attemptId ? { ...attempt, status: "dinilai", score } : attempt
      ),
      toast: { id: makeId("toast"), message: "Nilai ujian disimpan", type: "success" },
    }));
  }, []);

  const saveAttendance = useCallback(async (records: NewAttendance[]) => {
    await delay(550);
    if (records.length === 0) return;
    const { classId, subjectId, date } = records[0];
    setState((prev) => {
      const remaining = prev.attendance.filter(
        (item) =>
          !(
            item.classId === classId &&
            item.subjectId === subjectId &&
            item.date === date
          )
      );
      const withIds = records.map((record) => ({ ...record, id: makeId("att") }));
      return {
        ...prev,
        attendance: [...withIds, ...remaining],
        toast: {
          id: makeId("toast"),
          message: "Absensi tersimpan",
          description: `${records.length} santri tercatat pada ${date}.`,
          type: "success",
        },
      };
    });
  }, []);

  const addMaterial = useCallback(async (input: NewMaterial) => {
    await delay(500);
    const material: Material = {
      ...input,
      id: makeId("mat"),
      createdAt: todayISO(),
    };
    setState((prev) => ({
      ...prev,
      materials: [material, ...prev.materials],
      toast: {
        id: makeId("toast"),
        message: input.status === "published" ? "Materi dipublikasikan" : "Draft materi disimpan",
        type: "success",
      },
    }));
  }, []);

  const publishMaterial = useCallback(async (id: string) => {
    await delay(450);
    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((item) =>
        item.id === id ? { ...item, status: "published" } : item
      ),
      toast: { id: makeId("toast"), message: "Materi dipublikasikan", type: "success" },
    }));
  }, []);

  const updateGrade = useCallback(
    async (
      gradeId: string,
      values: { assignmentScore: number; examScore: number; memorizationScore: number; akhlakScore: number; note?: string }
    ) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        grades: prev.grades.map((grade) =>
          grade.id === gradeId ? { ...grade, ...values } : grade
        ),
        toast: { id: makeId("toast"), message: "Nilai berhasil diperbarui", type: "success" },
      }));
    },
    []
  );

  const publishReportCard = useCallback(async (id: string) => {
    await delay(500);
    setState((prev) => ({
      ...prev,
      reportCards: prev.reportCards.map((card) =>
        card.id === id
          ? { ...card, status: "published", publishedAt: todayISO() }
          : card
      ),
      notifications: [
        {
          id: makeId("notif"),
          title: "Rapor diterbitkan",
          message: "Rapor semester ganjil telah dipublikasikan untuk siswa dan wali.",
          date: todayISO(),
          read: false,
          type: "success",
        },
        ...prev.notifications,
      ],
      toast: {
        id: makeId("toast"),
        message: "Rapor diterbitkan",
        description: "Siswa dan wali dapat membaca rapor sekarang.",
        type: "success",
      },
    }));
  }, []);

  const createInvoice = useCallback(
    async (input: {
      studentId: string;
      type: Invoice["type"];
      periodLabel: string;
      description: string;
      amount: number;
      dueDate: string;
    }) => {
      await delay(500);
      setState((prev) => {
        const student = prev.students.find((item) => item.id === input.studentId);
        const invoice: Invoice = {
          ...input,
          id: makeId("inv"),
          number: `INV-${todayISO().replace(/-/g, "")}-${(prev.invoices.length + 1)
            .toString()
            .padStart(4, "0")}`,
          paidAmount: 0,
          status: "belum_bayar",
          createdAt: todayISO(),
          description:
            input.description ||
            `${input.type === "spp" ? "SPP" : input.type} untuk ${student?.name ?? "santri"}`,
        };
        return {
          ...prev,
          invoices: [invoice, ...prev.invoices],
          toast: {
            id: makeId("toast"),
            message: "Tagihan dibuat",
            description: `Tagihan untuk ${student?.name ?? "santri"} senilai Rp${input.amount.toLocaleString("id-ID")}.`,
            type: "success",
          },
        };
      });
    },
    []
  );

  const uploadPaymentProof = useCallback(
    async (input: {
      invoiceId: string;
      amount: number;
      method: "Transfer BSI" | "Transfer Mandiri" | "Tunai";
      fileName: string;
    }) => {
      await delay(700);
      setState((prev) => {
        const invoice = prev.invoices.find((item) => item.id === input.invoiceId);
        if (!invoice) return prev;
        const payment = {
          id: makeId("pay"),
          invoiceId: invoice.id,
          studentId: invoice.studentId,
          amount: input.amount,
          method: input.method,
          proofName: input.fileName,
          status: "menunggu" as const,
          submittedAt: todayISO(),
          note: "Bukti pembayaran diunggah melalui demo.",
        };
        return {
          ...prev,
          payments: [payment, ...prev.payments],
          invoices: prev.invoices.map((item) =>
            item.id === invoice.id
              ? {
                  ...item,
                  paidAmount: item.paidAmount + input.amount,
                  status: "menunggu_verifikasi",
                }
              : item
          ),
          toast: {
            id: makeId("toast"),
            message: "Bukti pembayaran terkirim",
            description: "Menunggu verifikasi admin keuangan. Status tagihan diperbarui.",
            type: "success",
          },
        };
      });
    },
    []
  );

  const verifyPayment = useCallback(
    async (paymentId: string, approve: boolean, note?: string) => {
      await delay(550);
      setState((prev) => {
        const payment = prev.payments.find((item) => item.id === paymentId);
        if (!payment) return prev;
        const invoice = prev.invoices.find((item) => item.id === payment.invoiceId);
        const newPaid = approve
          ? (invoice?.paidAmount ?? payment.amount)
          : Math.max(0, (invoice?.paidAmount ?? 0) - payment.amount);
        const invoiceStatus = approve
          ? newPaid >= (invoice?.amount ?? 0)
            ? "lunas"
            : "dibayar_sebagian"
          : "ditolak";
        return {
          ...prev,
          payments: prev.payments.map((item) =>
            item.id === paymentId
              ? {
                  ...item,
                  status: approve ? "diverifikasi" : "ditolak",
                  verifiedAt: todayISO(),
                  note: note || item.note,
                }
              : item
          ),
          invoices: prev.invoices.map((item) =>
            item.id === payment.invoiceId
              ? {
                  ...item,
                  paidAmount: newPaid,
                  status: invoiceStatus,
                }
              : item
          ),
          toast: {
            id: makeId("toast"),
            message: approve ? "Pembayaran diverifikasi" : "Pembayaran ditolak",
            description: approve
              ? "Status tagihan wali telah diperbarui."
              : "Wali dapat mengunggah ulang bukti pembayaran.",
            type: approve ? "success" : "error",
          },
        };
      });
    },
    []
  );

  const recordCashPayment = useCallback(async (invoiceId: string, amount: number) => {
    await delay(500);
    setState((prev) => {
      const invoice = prev.invoices.find((item) => item.id === invoiceId);
      if (!invoice) return prev;
      const payment = {
        id: makeId("pay"),
        invoiceId,
        studentId: invoice.studentId,
        amount,
        method: "Tunai" as const,
        status: "diverifikasi" as const,
        submittedAt: todayISO(),
        verifiedAt: todayISO(),
        note: "Pembayaran diterima di kasir.",
      };
      const newPaid = invoice.paidAmount + amount;
      return {
        ...prev,
        payments: [payment, ...prev.payments],
        invoices: prev.invoices.map((item) =>
          item.id === invoiceId
            ? {
                ...item,
                paidAmount: newPaid,
                status: newPaid >= item.amount ? "lunas" : "dibayar_sebagian",
              }
            : item
        ),
        transactions: [
          {
            id: makeId("trx"),
            date: todayISO(),
            type: "masuk" as const,
            category: "SPP",
            description: `Pembayaran tunai ${invoice.number}`,
            amount,
            method: "Tunai",
          },
          ...prev.transactions,
        ],
        toast: {
          id: makeId("toast"),
          message: "Pembayaran kasir dicatat",
          description: "Kwitansi demo berhasil dibuat dan status tagihan diperbarui.",
          type: "success",
        },
      };
    });
  }, []);

  const uploadDocument = useCallback(
    async (studentId: string, name: string, fileName: string) => {
      await delay(700);
      setState((prev) => {
        const existing = prev.documents.find(
          (doc) => doc.studentId === studentId && doc.name === name
        );
        const doc = {
          id: existing?.id ?? makeId("doc"),
          studentId,
          name,
          type: name,
          fileName,
          size: "1.4 MB",
          uploadedAt: todayISO(),
          status: "lengkap" as const,
        };
        return {
          ...prev,
          documents: existing
            ? prev.documents.map((item) => (item.id === existing.id ? doc : item))
            : [doc, ...prev.documents],
          toast: {
            id: makeId("toast"),
            message: "Berkas berhasil diunggah",
            description: `${name} tersimpan pada data demo.`,
            type: "success",
          },
        };
      });
    },
    []
  );

  const deleteDocument = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
      toast: {
        id: makeId("toast"),
        message: "Berkas dihapus dari demo",
        type: "info",
      },
    }));
  }, []);

  const submitRegistration = useCallback(
    async (input: {
      studentName: string;
      gender: Student["gender"];
      birthDate: string;
      parentName: string;
      parentPhone: string;
      parentEmail: string;
      address: string;
      level: 7 | 8 | 9;
      previousSchool: string;
      documents: string[];
    }) => {
      await delay(700);
      const number = `PPDB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const registration: Registration = {
        id: makeId("reg"),
        number,
        studentName: input.studentName,
        gender: input.gender,
        birthDate: input.birthDate,
        parentName: input.parentName,
        parentPhone: input.parentPhone,
        parentEmail: input.parentEmail,
        address: input.address,
        level: input.level,
        previousSchool: input.previousSchool,
        status: "menunggu_pembayaran",
        paymentStatus: "belum",
        documents: input.documents.map((name) => ({ name, uploaded: true })),
        submittedAt: todayISO(),
        notes: "Pendaftaran baru dari form demo.",
      };
      setState((prev) => ({
        ...prev,
        registrations: [registration, ...prev.registrations],
        toast: {
          id: makeId("toast"),
          message: "Pendaftaran berhasil dikirim",
          description: `Nomor pendaftaran Anda: ${number}`,
          type: "success",
        },
      }));
      return number;
    },
    []
  );

  const updateRegistrationStatus = useCallback(
    async (id: string, status: RegistrationStatus, note?: string) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        registrations: prev.registrations.map((registration) =>
          registration.id === id
            ? { ...registration, status, notes: note ?? registration.notes }
            : registration
        ),
        toast: {
          id: makeId("toast"),
          message:
            status === "diterima"
              ? "Pendaftar diterima"
              : status === "ditolak"
                ? "Pendaftar ditolak"
                : status === "perlu_perbaikan"
                  ? "Permintaan perbaikan dikirim"
                  : "Status pendaftaran diperbarui",
          type: status === "ditolak" ? "error" : "success",
        },
      }));
    },
    []
  );

  const verifyRegistrationPayment = useCallback(async (id: string) => {
    await delay(450);
    setState((prev) => ({
      ...prev,
      registrations: prev.registrations.map((registration) =>
        registration.id === id
          ? {
              ...registration,
              paymentStatus: "lunas",
              status:
                registration.status === "menunggu_pembayaran"
                  ? "menunggu_verifikasi"
                  : registration.status,
            }
          : registration
      ),
      toast: {
        id: makeId("toast"),
        message: "Pembayaran pendaftaran diverifikasi",
        type: "success",
      },
    }));
  }, []);

  const addStudent = useCallback(
    async (input: {
      name: string;
      classId: string;
      gender: Student["gender"];
      parentName: string;
      parentPhone: string;
      birthPlace?: string;
      birthDate?: string;
      address?: string;
    }) => {
      await delay(500);
      setState((prev) => {
        const parentId = makeId("par");
        const studentId = makeId("st");
        const parent = {
          id: parentId,
          name: input.parentName,
          email: `${input.parentName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@demo.local`,
          phone: input.parentPhone,
          childIds: [studentId],
        };
        const student: Student = {
          id: studentId,
          nis: `26${(prev.students.length + 1).toString().padStart(5, "0")}`,
          name: input.name,
          classId: input.classId,
          parentId,
          gender: input.gender,
          birthPlace: input.birthPlace ?? "Bogor",
          birthDate: input.birthDate ?? "2013-01-01",
          address: input.address ?? "Alamat belum diisi",
          status: "aktif",
          joinedAt: todayISO(),
        };
        return {
          ...prev,
          parents: [parent, ...prev.parents],
          students: [student, ...prev.students],
          toast: {
            id: makeId("toast"),
            message: "Siswa baru ditambahkan",
            description: `${input.name} masuk ke kelas yang dipilih.`,
            type: "success",
          },
        };
      });
    },
    []
  );

  const updateStudent = useCallback(async (id: string, values: Partial<Student>) => {
    await delay(400);
    setState((prev) => ({
      ...prev,
      students: prev.students.map((student) =>
        student.id === id ? { ...student, ...values } : student
      ),
      toast: { id: makeId("toast"), message: "Data siswa diperbarui", type: "success" },
    }));
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await delay(400);
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((student) => student.id !== id),
      toast: { id: makeId("toast"), message: "Data siswa dihapus dari demo", type: "info" },
    }));
  }, []);

  const addTeacher = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      subjectIds: string[];
      classIds: string[];
    }) => {
      await delay(500);
      setState((prev) => {
        const teacher: Teacher = {
          id: makeId("tch"),
          nip: `G-2026-${(prev.teachers.length + 1).toString().padStart(3, "0")}`,
          ...input,
          status: "aktif",
        };
        return {
          ...prev,
          teachers: [teacher, ...prev.teachers],
          toast: {
            id: makeId("toast"),
            message: "Data guru ditambahkan",
            description: `${input.name} tersimpan pada data demo.`,
            type: "success",
          },
        };
      });
    },
    []
  );

  const updateTeacher = useCallback(async (id: string, values: Partial<Teacher>) => {
    await delay(400);
    setState((prev) => ({
      ...prev,
      teachers: prev.teachers.map((teacher) =>
        teacher.id === id ? { ...teacher, ...values } : teacher
      ),
      toast: { id: makeId("toast"), message: "Data guru diperbarui", type: "success" },
    }));
  }, []);

  const addJenjang = useCallback<DemoContextValue["addJenjang"]>(
    async (input) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        jenjang: [
          ...prev.jenjang,
          {
            id: makeId("jnj"),
            name: input.name.trim(),
            description: input.description.trim() || "Jenjang baru pada data demo.",
          },
        ],
        toast: {
          id: makeId("toast"),
          message: "Jenjang ditambahkan",
          description: `${input.name.trim()} sekarang tersedia di form tambah kelas.`,
          type: "success",
        },
      }));
    },
    []
  );

  const addClass = useCallback(
    async (input: {
      name: string;
      jenjangId: string;
      level: number;
      homeroomTeacherId: string;
      room: string;
    }) => {
      await delay(500);
      setState((prev) => {
        const newClass = {
          id: makeId("cls"),
          ...input,
          capacity: 28,
          periodId: prev.activePeriodId,
        };
        return {
          ...prev,
          classes: [...prev.classes, newClass],
          toast: {
            id: makeId("toast"),
            message: "Kelas ditambahkan",
            description: `Kelas ${input.name} siap digunakan.`,
            type: "success",
          },
        };
      });
    },
    []
  );

  const addSubject = useCallback(
    async (input: { code: string; name: string; category: Subject["category"] }) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, { id: makeId("sub"), ...input }],
        toast: { id: makeId("toast"), message: "Mata pelajaran ditambahkan", type: "success" },
      }));
    },
    []
  );

  const addPeriod = useCallback(
    async (input: {
      name: string;
      semester: SchoolPeriod["semester"];
      startDate: string;
      endDate: string;
    }) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        schoolPeriods: [
          ...prev.schoolPeriods,
          { id: makeId("per"), ...input, active: false },
        ],
        toast: { id: makeId("toast"), message: "Periode ajaran ditambahkan", type: "success" },
      }));
    },
    []
  );

  const promoteStudents = useCallback(
    async (studentIds: string[], targetClassId: string) => {
      await delay(600);
      setState((prev) => ({
        ...prev,
        students: prev.students.map((student) =>
          studentIds.includes(student.id) ? { ...student, classId: targetClassId } : student
        ),
        toast: {
          id: makeId("toast"),
          message: "Kenaikan kelas diproses",
          description: `${studentIds.length} santri dipindahkan ke kelas baru.`,
          type: "success",
        },
      }));
    },
    []
  );

  const addTransaction = useCallback(
    async (input: {
      type: "masuk" | "keluar";
      category: string;
      description: string;
      amount: number;
      method?: string;
    }) => {
      await delay(500);
      setState((prev) => ({
        ...prev,
        transactions: [
          { id: makeId("trx"), date: todayISO(), ...input },
          ...prev.transactions,
        ],
        toast: {
          id: makeId("toast"),
          message: input.type === "masuk" ? "Pemasukan dicatat" : "Pengeluaran dicatat",
          type: "success",
        },
      }));
    },
    []
  );

  const addFinanceAdmin = useCallback(
    async (input: { name: string; email: string; role: FinanceAdmin["role"] }) => {
      await delay(450);
      setState((prev) => ({
        ...prev,
        financeAdmins: [
          ...prev.financeAdmins,
          { id: makeId("fa"), ...input, status: "aktif" as const },
        ],
        toast: { id: makeId("toast"), message: "Akun admin keuangan ditambahkan", type: "success" },
      }));
    },
    []
  );

  const updateFinanceAdminStatus = useCallback(
    (id: string, status: FinanceAdmin["status"]) => {
      setState((prev) => ({
        ...prev,
        financeAdmins: prev.financeAdmins.map((admin) =>
          admin.id === id ? { ...admin, status } : admin
        ),
        toast: {
          id: makeId("toast"),
          message:
            status === "aktif" ? "Akses akun diaktifkan" : "Akses akun dinonaktifkan",
          type: "info",
        },
      }));
    },
    []
  );

  const updatePpdbFee = useCallback(async (id: string, amount: number) => {
    await delay(400);
    setState((prev) => ({
      ...prev,
      ppdbFees: prev.ppdbFees.map((fee) => (fee.id === id ? { ...fee, amount } : fee)),
      toast: { id: makeId("toast"), message: "Biaya PPDB diperbarui", type: "success" },
    }));
  }, []);

  const retryEmail = useCallback(async (id: string) => {
    await delay(500);
    setState((prev) => ({
      ...prev,
      outboxEmails: prev.outboxEmails.map((email) =>
        email.id === id ? { ...email, status: "terkirim" as const, error: undefined } : email
      ),
      toast: {
        id: makeId("toast"),
        message: "Email demo dikirim ulang",
        description: "Status outbox diperbarui menjadi terkirim.",
        type: "success",
      },
    }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState((prev) => {
      const fresh = createInitialState();
      return {
        ...fresh,
        isLoggedIn: prev.isLoggedIn,
        activeRole: prev.activeRole,
        activeChildId: prev.activeChildId,
        toast: {
          id: makeId("toast"),
          message: "Reset demo selesai",
          description: "Semua data mock kembali ke kondisi awal.",
          type: "info",
        },
      };
    });
  }, []);

  const seedScenario = useCallback((scenario: ScenarioKey) => {
    const next = createStateForScenario(scenario);
    const meta = scenarioMeta.find((item) => item.key === scenario);
    setState((prev) => ({
      ...next,
      // Skenario presentasi tidak boleh memutus sesi demo yang sedang berjalan.
      isLoggedIn: prev.isLoggedIn,
      activeRole: prev.isLoggedIn ? (next.activeRole ?? prev.activeRole) : next.activeRole,
      toast: {
        id: makeId("toast"),
        message: `Skenario dimuat: ${meta?.label ?? scenario}`,
        description: meta?.description,
        type: "success",
      },
    }));
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      hydrated,
      loginAs,
      loginWithEmail,
      logout,
      switchRole,
      selectChild,
      selectPeriod,
      showToast,
      dismissToast,
      addTask,
      updateTask,
      publishTask,
      saveTaskDraft,
      submitTask,
      gradeSubmission,
      addExam,
      publishExam,
      startExam,
      answerExamQuestion,
      submitExam,
      gradeExamAttempt,
      saveAttendance,
      addMaterial,
      publishMaterial,
      updateGrade,
      publishReportCard,
      createInvoice,
      uploadPaymentProof,
      verifyPayment,
      recordCashPayment,
      uploadDocument,
      deleteDocument,
      submitRegistration,
      updateRegistrationStatus,
      verifyRegistrationPayment,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      updateTeacher,
      addJenjang,
      addClass,
      addSubject,
      addPeriod,
      promoteStudents,
      addTransaction,
      addFinanceAdmin,
      updateFinanceAdminStatus,
      updatePpdbFee,
      retryEmail,
      markNotificationsRead,
      resetDemo,
      seedScenario,
    }),
    [
      state,
      hydrated,
      loginAs,
      loginWithEmail,
      logout,
      switchRole,
      selectChild,
      selectPeriod,
      showToast,
      dismissToast,
      addTask,
      updateTask,
      publishTask,
      saveTaskDraft,
      submitTask,
      gradeSubmission,
      addExam,
      publishExam,
      startExam,
      answerExamQuestion,
      submitExam,
      gradeExamAttempt,
      saveAttendance,
      addMaterial,
      publishMaterial,
      updateGrade,
      publishReportCard,
      createInvoice,
      uploadPaymentProof,
      verifyPayment,
      recordCashPayment,
      uploadDocument,
      deleteDocument,
      submitRegistration,
      updateRegistrationStatus,
      verifyRegistrationPayment,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      updateTeacher,
      addJenjang,
      addClass,
      addSubject,
      addPeriod,
      promoteStudents,
      addTransaction,
      addFinanceAdmin,
      updateFinanceAdminStatus,
      updatePpdbFee,
      retryEmail,
      markNotificationsRead,
      resetDemo,
      seedScenario,
    ]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo harus dipakai di dalam DemoProvider");
  }
  return context;
}
