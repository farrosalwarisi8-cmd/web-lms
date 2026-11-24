"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";

export function MockFileUpload({
  label = "Unggah berkas",
  hint = "PDF, JPG, atau PNG maksimal 5 MB (simulasi lokal)",
  accept = ".pdf,.jpg,.jpeg,.png",
  value,
  onChange,
  onUploaded,
  disabled,
}: {
  label?: string;
  hint?: string;
  accept?: string;
  value?: string;
  onChange?: (fileName: string | null) => void;
  onUploaded?: (fileName: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(value ?? null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFileName(value ?? null);
  }, [value]);

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + 12);
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [uploading]);

  useEffect(() => {
    if (!uploading || progress < 100) return;
    const timer = window.setTimeout(() => {
      setUploading(false);
      if (fileName) {
        onChange?.(fileName);
        onUploaded?.(fileName);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [uploading, progress, fileName, onChange, onUploaded]);

  function handleSelect(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setProgress(0);
    setUploading(true);
  }

  function removeFile() {
    setFileName(null);
    setProgress(0);
    setUploading(false);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="label-base">{label}</span>
      {fileName && !uploading ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{fileName}</p>
              <p className="flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Berhasil diunggah (demo)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white"
            aria-label={`Hapus berkas ${fileName}`}
            disabled={disabled}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-4 text-center transition hover:border-brand-400 hover:bg-brand-50/40",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <UploadCloud className="h-6 w-6 text-slate-400" aria-hidden />
          <span className="text-sm font-semibold text-slate-700">
            {uploading ? "Mengunggah berkas..." : "Pilih berkas dari perangkat"}
          </span>
          <span className="text-xs text-slate-500">{hint}</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => handleSelect(event.target.files?.[0])}
          />
        </label>
      )}
      {uploading && (
        <ProgressBar
          value={progress}
          tone="emerald"
          label="Progres unggah simulasi"
          hint={`${progress}%`}
          className="mt-2"
        />
      )}
    </div>
  );
}
