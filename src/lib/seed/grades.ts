import type { Grade, ReportCard } from "../types";
import { students } from "./people";

const subjectIds = ["sub-1", "sub-2", "sub-3", "sub-4"];

const notes: Record<string, string> = {
  "st-1": "Menunjukkan kemajuan baik pada hafalan. Perlu ketelitian pada hitungan pecahan.",
  "st-2": "Konsisten dan mandiri. Pertahankan kebiasaan muraja'ah harian.",
  "st-3": "Aktif di kelas. Tingkatkan ketepatan waktu pengumpulan tugas.",
  "st-4": "Perlu lebih percaya diri saat setoran hafalan. Terus berlatih.",
  "st-5": "Akhlak baik dan sopan. Fokus pada ketelitian soal matematika.",
  "st-6": "Rapi dalam menulis. Perlu memperbanyak latihan tajwid.",
  "st-7": "Semangat belajar tinggi. Perhatikan tanda baca pada soal hitungan.",
  "st-8": "Sangat teliti dan rajin. Bantu teman dalam kelompok belajar.",
  "st-9": "Perlu penguatan kedisiplinan waktu. Isi tugas baik.",
};

let gradeCounter = 0;

export const grades: Grade[] = students.flatMap((student, studentIndex) =>
  subjectIds.map((subjectId, subjectIndex) => {
    gradeCounter += 1;
    const base = 74 + ((studentIndex * 3 + subjectIndex * 5) % 22);
    return {
      id: `grd-${gradeCounter}`,
      studentId: student.id,
      subjectId,
      periodId: "per-2026-ganjil",
      assignmentScore: Math.min(100, base + 2),
      examScore: Math.max(60, base - 4),
      memorizationScore: Math.min(100, base + 6),
      akhlakScore: Math.min(100, base + 8),
      note: notes[student.id],
    };
  })
);

export const reportCards: ReportCard[] = students.map((student, index) => ({
  id: `rc-${index + 1}`,
  studentId: student.id,
  periodId: "per-2026-ganjil",
  status: index < 2 ? "published" : "draft",
  homeroomNote:
    notes[student.id] ??
    "Terus tingkatkan semangat belajar dan jagalah adab kepada guru serta orang tua.",
  publishedAt: index < 2 ? "2026-11-21" : undefined,
}));
