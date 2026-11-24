import type {
  AttendanceRecord,
  DemoState,
  ExamAttempt,
  Grade,
  Student,
} from "./types";

export const DEMO_TODAY = "2026-11-24";
export const DEMO_PASSWORD = "demo123";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(value?: string) {
  if (!value) return 0;
  const target = new Date(value);
  const today = new Date(DEMO_TODAY);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function getStudent(state: DemoState, id?: string | null): Student | undefined {
  if (!id) return undefined;
  return state.students.find((student) => student.id === id);
}

export function getStudentName(state: DemoState, id?: string | null) {
  return getStudent(state, id)?.name ?? "Santri";
}

export function getClassName(state: DemoState, classId?: string) {
  return state.classes.find((item) => item.id === classId)?.name ?? "—";
}

export function getSubjectName(state: DemoState, subjectId?: string) {
  return state.subjects.find((item) => item.id === subjectId)?.name ?? "—";
}

export function getSubjectCode(state: DemoState, subjectId?: string) {
  return state.subjects.find((item) => item.id === subjectId)?.code ?? "—";
}

export function getTeacherName(state: DemoState, teacherId?: string) {
  return state.teachers.find((item) => item.id === teacherId)?.name ?? "—";
}

export function getParentName(state: DemoState, parentId?: string) {
  return state.parents.find((item) => item.id === parentId)?.name ?? "Wali";
}

export function finalScore(grade: Grade) {
  return Math.round(
    grade.assignmentScore * 0.3 +
      grade.examScore * 0.4 +
      grade.memorizationScore * 0.2 +
      grade.akhlakScore * 0.1
  );
}

export function attendanceSummary(records: AttendanceRecord[]) {
  const total = records.length;
  const hadir = records.filter((item) => item.status === "hadir").length;
  const izin = records.filter((item) => item.status === "izin").length;
  const sakit = records.filter((item) => item.status === "sakit").length;
  const alpa = records.filter((item) => item.status === "alpa").length;
  return {
    total,
    hadir,
    izin,
    sakit,
    alpa,
    percentage: total === 0 ? 0 : Math.round((hadir / total) * 100),
  };
}

export function attemptScore(
  state: DemoState,
  examId: string,
  answers: Record<string, string>
): number {
  const exam = state.exams.find((item) => item.id === examId);
  if (!exam) return 0;
  let earned = 0;
  let total = 0;
  exam.questions.forEach((question) => {
    total += question.score;
    if (question.type === "pilihan_ganda" && question.options) {
      const answer = answers[question.id];
      if (answer && Number(answer) === question.correctIndex) {
        earned += question.score;
      }
    } else if (question.type === "esai" && answers[question.id]?.trim()) {
      earned += Math.round(question.score * 0.8);
    }
  });
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

export function findAttempt(
  state: DemoState,
  examId: string,
  studentId: string
): ExamAttempt | undefined {
  return state.examAttempts.find(
    (attempt) => attempt.examId === examId && attempt.studentId === studentId
  );
}

export function todayISO() {
  return DEMO_TODAY;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function percent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
