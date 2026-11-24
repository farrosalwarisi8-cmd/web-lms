import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-800 ring-rose-200",
  info: "bg-blue-50 text-blue-800 ring-blue-200",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-blue-500",
  brand: "bg-brand-500",
};

const statusMap: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Dipublikasikan", tone: "success" },
  belum: { label: "Belum dikerjakan", tone: "neutral" },
  belum_bayar: { label: "Belum dibayar", tone: "danger" },
  terkirim: { label: "Terkirim", tone: "info" },
  terlambat: { label: "Terlambat", tone: "danger" },
  dinilai: { label: "Dinilai", tone: "success" },
  perlu_revisi: { label: "Perlu revisi", tone: "warning" },
  akan_datang: { label: "Akan datang", tone: "info" },
  aktif: { label: "Aktif", tone: "success" },
  ditutup: { label: "Ditutup", tone: "neutral" },
  mengerjakan: { label: "Sedang dikerjakan", tone: "warning" },
  hadir: { label: "Hadir", tone: "success" },
  izin: { label: "Izin", tone: "info" },
  sakit: { label: "Sakit", tone: "warning" },
  alpa: { label: "Alpa", tone: "danger" },
  menunggu_verifikasi: { label: "Menunggu verifikasi", tone: "warning" },
  dibayar_sebagian: { label: "Dibayar sebagian", tone: "info" },
  lunas: { label: "Lunas", tone: "success" },
  ditolak: { label: "Ditolak", tone: "danger" },
  menunggu: { label: "Menunggu", tone: "warning" },
  diverifikasi: { label: "Diverifikasi", tone: "success" },
  menunggu_pembayaran: { label: "Menunggu pembayaran", tone: "warning" },
  perlu_perbaikan: { label: "Perlu perbaikan", tone: "warning" },
  diterima: { label: "Diterima", tone: "success" },
  lengkap: { label: "Lengkap", tone: "success" },
  nonaktif: { label: "Nonaktif", tone: "neutral" },
  gagal: { label: "Gagal", tone: "danger" },
  "naik kelas": { label: "Naik kelas", tone: "success" },
  "tinggal kelas": { label: "Tinggal kelas", tone: "danger" },
};

export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status?: string;
  label?: string;
  tone?: BadgeTone;
  className?: string;
}) {
  const meta = status ? statusMap[status] : undefined;
  const resolvedTone = tone ?? meta?.tone ?? "neutral";
  const text = label ?? meta?.label ?? status ?? "—";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[resolvedTone],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dots[resolvedTone])} aria-hidden />
      {text}
    </span>
  );
}
