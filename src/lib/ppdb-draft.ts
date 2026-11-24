export interface PpdbDraft {
  studentName: string;
  gender: "putra" | "putri";
  birthPlace: string;
  birthDate: string;
  level: 7 | 8 | 9;
  previousSchool: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  documents: Record<string, boolean>;
  proofFile: string;
  registrationNumber: string;
}

export const PPDB_DRAFT_KEY = "lms-ppdb-draft-v1";
export const PPDB_LAST_KEY = "lms-ppdb-last-v1";

export const requiredDocuments = [
  "Kartu Keluarga",
  "Akta Kelahiran",
  "Ijazah / Surat Keterangan Lulus",
  "Pas Foto 3x4",
  "KTP Wali",
];

export const emptyDraft: PpdbDraft = {
  studentName: "",
  gender: "putra",
  birthPlace: "",
  birthDate: "",
  level: 7,
  previousSchool: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
  documents: {},
  proofFile: "",
  registrationNumber: "",
};

export function loadDraft(): PpdbDraft {
  if (typeof window === "undefined") return { ...emptyDraft, documents: {} };
  try {
    const raw = window.localStorage.getItem(PPDB_DRAFT_KEY);
    if (!raw) return { ...emptyDraft, documents: {} };
    const parsed = JSON.parse(raw) as Partial<PpdbDraft>;
    return { ...emptyDraft, ...parsed, documents: { ...(parsed.documents ?? {}) } };
  } catch {
    return { ...emptyDraft, documents: {} };
  }
}

export function saveDraft(partial: Partial<PpdbDraft>) {
  if (typeof window === "undefined") return;
  const next = { ...loadDraft(), ...partial };
  window.localStorage.setItem(PPDB_DRAFT_KEY, JSON.stringify(next));
}

export function resetDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PPDB_DRAFT_KEY);
}

export function saveRegistrationNumber(number: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PPDB_LAST_KEY, number);
}

export function loadRegistrationNumber() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PPDB_LAST_KEY) ?? "";
}

export const ppdbSteps = [
  { title: "Data calon santri", description: "Identitas santri" },
  { title: "Data wali", description: "Kontak wali" },
  { title: "Dokumen", description: "Unggah berkas" },
  { title: "Pembayaran", description: "Bukti transfer" },
  { title: "Verifikasi", description: "Keputusan admin" },
];
