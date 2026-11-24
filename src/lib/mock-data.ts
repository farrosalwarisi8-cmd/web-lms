import type { DemoState, ScenarioKey, Submission } from "./types";
import {
  classes,
  demoAccounts,
  jenjang,
  parents,
  schoolPeriods,
  students,
  subjects,
  teachers,
} from "./seed/people";
import {
  examAttempts,
  exams,
  materials,
  submissions,
  tasks,
} from "./seed/academic";
import { grades, reportCards } from "./seed/grades";
import {
  attendance,
  documents,
  financeAdmins,
  invoices,
  notifications,
  outboxEmails,
  payments,
  ppdbFees,
  registrations,
  transactions,
} from "./seed/operations";

export {
  classes,
  demoAccounts,
  jenjang,
  parents,
  schoolPeriods,
  students,
  subjects,
  teachers,
  examAttempts,
  exams,
  materials,
  submissions,
  tasks,
  grades,
  reportCards,
  attendance,
  documents,
  invoices,
  notifications,
  payments,
  registrations,
  transactions,
  financeAdmins,
  outboxEmails,
  ppdbFees,
};

export const scenarioMeta: {
  key: ScenarioKey;
  label: string;
  description: string;
}[] = [
  {
    key: "default",
    label: "Data Awal Demo",
    description: "Kondisi normal dengan campuran status di semua peran.",
  },
  {
    key: "wali_attention",
    label: "Skenario A — Wali Perlu Perhatian",
    description:
      "Anak pertama punya 2 tugas belum dikumpulkan, SPP belum lunas, akta belum diunggah, kehadiran 82%.",
  },
  {
    key: "guru_work",
    label: "Skenario B — Guru Punya Pekerjaan",
    description:
      "Lima tugas belum dinilai, absensi kelas kosong, dan satu ujian draft siap dipreview.",
  },
  {
    key: "keuangan_queue",
    label: "Skenario C — Keuangan Punya Antrean",
    description:
      "Delapan pembayaran menunggu verifikasi, tunggakan SPP, dan arus kas bulan berjalan.",
  },
];

export function createInitialState(): DemoState {
  return {
    isLoggedIn: false,
    activeRole: null,
    activeChildId: "st-1",
    activeParentId: "par-1",
    activePeriodId: "per-2026-ganjil",
    activeTeacherId: "tch-1",
    notifications: notifications.map((item) => ({ ...item })),
    parents: parents.map((item) => ({ ...item, childIds: [...item.childIds] })),
    students: students.map((item) => ({ ...item })),
    tasks: tasks.map((item) => ({ ...item })),
    submissions: submissions.map((item) => ({ ...item })),
    exams: exams.map((item) => ({
      ...item,
      questions: item.questions.map((q) => ({ ...q })),
    })),
    examAttempts: examAttempts.map((item) => ({
      ...item,
      answers: { ...item.answers },
    })),
    attendance: attendance.map((item) => ({ ...item })),
    materials: materials.map((item) => ({ ...item })),
    grades: grades.map((item) => ({ ...item })),
    reportCards: reportCards.map((item) => ({ ...item })),
    invoices: invoices.map((item) => ({ ...item })),
    payments: payments.map((item) => ({ ...item })),
    documents: documents.map((item) => ({ ...item })),
    registrations: registrations.map((item) => ({
      ...item,
      documents: item.documents.map((doc) => ({ ...doc })),
    })),
    teachers: teachers.map((item) => ({
      ...item,
      subjectIds: [...item.subjectIds],
      classIds: [...item.classIds],
    })),
    classes: classes.map((item) => ({ ...item })),
    jenjang: jenjang.map((item) => ({ ...item })),
    subjects: subjects.map((item) => ({ ...item })),
    schoolPeriods: schoolPeriods.map((item) => ({ ...item })),
    transactions: transactions.map((item) => ({ ...item })),
    financeAdmins: financeAdmins.map((item) => ({ ...item })),
    outboxEmails: outboxEmails.map((item) => ({ ...item })),
    ppdbFees: ppdbFees.map((item) => ({ ...item })),
    toast: null,
    scenario: "default",
    theme: "light",
  };
}

function withScenario(
  state: DemoState,
  scenario: ScenarioKey
): DemoState {
  const next: DemoState = { ...state, scenario };

  if (scenario === "wali_attention") {
    next.submissions = next.submissions.filter(
      (item) => !(item.studentId === "st-1" && item.taskId !== "tsk-2")
    );
    next.submissions.push({
      id: "subm-scenario-a",
      taskId: "tsk-8",
      studentId: "st-1",
      status: "terkirim",
      content: "Dokumentasi praktik tayamum sudah diunggah lebih awal.",
      fileName: "tayamum-fauzan.jpg",
      submittedAt: "2026-11-22",
      updatedAt: "2026-11-22",
    });
    next.invoices = next.invoices.map((invoice) =>
      invoice.studentId === "st-1" && invoice.periodLabel.startsWith("November")
        ? { ...invoice, status: "belum_bayar", paidAmount: 0 }
        : invoice
    );
    next.documents = next.documents.filter(
      (doc) => !(doc.studentId === "st-1" && doc.name === "Akta Kelahiran")
    );
    next.activeChildId = "st-1";
    next.activeRole = "orang_tua";
    next.notifications = [
      {
        id: "notif-scenario-a",
        title: "Skenario A aktif",
        message:
          "Ahmad Fauzan memiliki 2 tugas belum dikumpulkan, SPP November belum lunas, dan akta kelahiran belum diunggah.",
        date: "2026-11-24",
        read: false,
        type: "warning",
      },
      ...next.notifications,
    ];
  }

  if (scenario === "guru_work") {
    const extra: Submission[] = [
      {
        id: "subm-sc-b1",
        taskId: "tsk-1",
        studentId: "st-3",
        status: "terkirim",
        content: "Insya kegiatan harian sudah selesai ditulis.",
        fileName: "insya-rizky.jpg",
        submittedAt: "2026-11-23",
        updatedAt: "2026-11-23",
      },
      {
        id: "subm-sc-b2",
        taskId: "tsk-1",
        studentId: "st-4",
        status: "terkirim",
        content: "Insya beserta terjemahan, mohon diperiksa.",
        fileName: "insya-fatimah-v2.jpg",
        submittedAt: "2026-11-23",
        updatedAt: "2026-11-23",
      },
      {
        id: "subm-sc-b3",
        taskId: "tsk-8",
        studentId: "st-4",
        status: "terkirim",
        content: "Foto praktik tayamum dan rukun-rukunnya.",
        fileName: "tayamum-fatimah.jpg",
        submittedAt: "2026-11-23",
        updatedAt: "2026-11-23",
      },
      {
        id: "subm-sc-b4",
        taskId: "tsk-11",
        studentId: "st-2",
        status: "terkirim",
        content: "Peta konsep tiga cabang iman.",
        fileName: "cabang-iman-aisyah.pdf",
        submittedAt: "2026-11-23",
        updatedAt: "2026-11-23",
      },
      {
        id: "subm-sc-b5",
        taskId: "tsk-8",
        studentId: "st-1",
        status: "terkirim",
        content: "Dokumentasi praktik tayamum di rumah.",
        fileName: "tayamum-fauzan.jpg",
        submittedAt: "2026-11-23",
        updatedAt: "2026-11-23",
      },
    ];
    next.submissions = [...next.submissions, ...extra];
    next.activeRole = "guru";
    next.activeTeacherId = "tch-1";
    next.notifications = [
      {
        id: "notif-scenario-b",
        title: "Skenario B aktif",
        message:
          "Lima tugas menunggu penilaian dan absensi kelas 8A pekan ini belum diisi.",
        date: "2026-11-24",
        read: false,
        type: "warning",
      },
      ...next.notifications,
    ];
  }

  if (scenario === "keuangan_queue") {
    const waitingInvoices = next.invoices
      .filter((invoice) => invoice.status !== "lunas")
      .slice(0, 8);
    const extraPayments = waitingInvoices.map((invoice, index) => ({
      id: `pay-scenario-${index + 1}`,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      amount: invoice.amount - invoice.paidAmount || invoice.amount,
      method: (index % 2 === 0 ? "Transfer BSI" : "Transfer Mandiri") as
        | "Transfer BSI"
        | "Transfer Mandiri",
      proofName: `bukti-transfer-${index + 1}.jpg`,
      status: "menunggu" as const,
      submittedAt: "2026-11-23",
      note: "Menunggu verifikasi admin keuangan.",
    }));
    next.payments = [
      ...extraPayments,
      ...next.payments.filter((payment) => payment.status !== "menunggu"),
    ];
    next.invoices = next.invoices.map((invoice) => {
      const match = extraPayments.find((p) => p.invoiceId === invoice.id);
      return match && invoice.status === "belum_bayar"
        ? { ...invoice, status: "menunggu_verifikasi" as const }
        : invoice;
    });
    next.activeRole = "admin_keuangan";
    next.notifications = [
      {
        id: "notif-scenario-c",
        title: "Skenario C aktif",
        message:
          "Ada 8 pembayaran menunggu verifikasi. Beberapa santri masih memiliki tunggakan SPP.",
        date: "2026-11-24",
        read: false,
        type: "warning",
      },
      ...next.notifications,
    ];
  }

  return next;
}

export function createStateForScenario(scenario: ScenarioKey): DemoState {
  return withScenario(createInitialState(), scenario);
}
