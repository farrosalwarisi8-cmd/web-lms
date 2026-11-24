"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileSearch,
  Search,
  XCircle,
} from "lucide-react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useDemo } from "@/context/demo-context";
import type { Registration } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statusOrder = [
  "draft",
  "menunggu_pembayaran",
  "menunggu_verifikasi",
  "perlu_perbaikan",
  "diterima",
  "ditolak",
];

const timelineSteps = [
  { key: "draft", label: "Formulir dibuat", message: "Data awal pendaftaran disimpan." },
  { key: "menunggu_pembayaran", label: "Menunggu pembayaran", message: "Biaya pendaftaran belum dibayar." },
  { key: "menunggu_verifikasi", label: "Verifikasi berkas & pembayaran", message: "Admin sedang memeriksa pendaftaran." },
  { key: "keputusan", label: "Keputusan", message: "Diterima, ditolak, atau diminta perbaikan." },
];

function StepIcon({ state }: { state: "done" | "active" | "pending" | "rejected" }) {
  if (state === "done") return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
  if (state === "rejected") return <XCircle className="h-5 w-5 text-rose-600" aria-hidden />;
  if (state === "active") return <Clock className="h-5 w-5 text-amber-600" aria-hidden />;
  return <Circle className="h-5 w-5 text-slate-300" aria-hidden />;
}

export default function CekPendaftaranPage() {
  const { state, hydrated } = useDemo();
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);

  function search(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;
    setSearched(true);
    const found =
      state.registrations.find((item) => item.number.toLowerCase() === normalized) ?? null;
    setResult(found);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const number = params.get("number");
    if (number) {
      setQuery(number);
      if (hydrated) search(number);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const currentIndex = result
    ? result.status === "diterima" || result.status === "ditolak" || result.status === "perlu_perbaikan"
      ? 3
      : Math.max(0, statusOrder.indexOf(result.status) - 1)
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />
      <main className="container-page flex-1 py-8">
        <Link href="/pendaftaran" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke informasi pendaftaran
        </Link>

        <div className="mx-auto mt-3 max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800">
                <FileSearch className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Cek status pendaftaran</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Masukkan nomor pendaftaran yang diterima setelah formulir dikirim.
                </p>
              </div>
            </div>

            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={(event) => {
                event.preventDefault();
                search(query);
              }}
            >
              <Field label="Nomor pendaftaran" htmlFor="registration-number" className="flex-1">
                <Input
                  id="registration-number"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Contoh: PPDB-2026-0001"
                  autoComplete="off"
                  className="font-mono"
                />
              </Field>
              <Button type="submit" icon={<Search className="h-4 w-4" />} className="sm:mb-0">
                Cek Status
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Contoh nomor demo:</span>
              {["PPDB-2026-0001", "PPDB-2026-0003", "PPDB-2026-0004"].map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => {
                    setQuery(number);
                    search(number);
                  }}
                  className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 hover:bg-brand-100 hover:text-brand-900"
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          {searched && !result && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
              <EmptyState
                icon={FileSearch}
                title="Nomor pendaftaran tidak ditemukan"
                description="Periksa kembali penulisan nomor. Gunakan salah satu contoh nomor demo di atas untuk melihat tampilan status."
                tone="warning"
                action={
                  <Button variant="outline" onClick={() => { setSearched(false); setQuery(""); }}>
                    Coba nomor lain
                  </Button>
                }
              />
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Nomor pendaftaran
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-900">{result.number}</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">{result.studentName}</p>
                    <p className="text-xs text-slate-500">
                      Kelas {result.level} · Wali {result.parentName} · Dikirim {formatDate(result.submittedAt)}
                    </p>
                  </div>
                  <StatusBadge status={result.status} />
                </div>

                {result.notes && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-inset ring-amber-200">
                    <strong>Catatan admin:</strong> {result.notes}
                  </div>
                )}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                    <p className="text-[11px] text-slate-500">Status pembayaran</p>
                    <div className="mt-1">
                      <StatusBadge
                        status={result.paymentStatus === "lunas" ? "lunas" : result.paymentStatus === "menunggu_verifikasi" ? "menunggu_verifikasi" : "belum_bayar"}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-inset ring-slate-200">
                    <p className="text-[11px] text-slate-500">Kelengkapan dokumen</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {result.documents.filter((doc) => doc.uploaded).length} / {result.documents.length} dokumen
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-slate-900">Progres pendaftaran</h2>
                <ol className="mt-4 space-y-4">
                  {timelineSteps.map((step, index) => {
                    const isDecision = step.key === "keputusan";
                    let status: "done" | "active" | "pending" | "rejected" = "pending";
                    if (isDecision) {
                      if (result.status === "diterima") status = "done";
                      else if (result.status === "ditolak") status = "rejected";
                      else if (result.status === "perlu_perbaikan") status = "active";
                    } else if (index < currentIndex) status = "done";
                    else if (index === currentIndex) status = "active";

                    return (
                      <li key={step.key} className="flex gap-3">
                        <span className="mt-0.5 shrink-0">
                          <StepIcon state={status} />
                        </span>
                        <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {isDecision && result.status === "diterima"
                              ? "Diterima"
                              : isDecision && result.status === "ditolak"
                                ? "Ditolak"
                                : isDecision && result.status === "perlu_perbaikan"
                                  ? "Perlu perbaikan berkas"
                                  : step.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isDecision && result.status === "diterima"
                              ? "Selamat! Silakan ikuti instruksi daftar ulang dari panitia."
                              : isDecision && result.status === "ditolak"
                                ? "Pendaftaran belum dapat diterima. Hubungi panitia untuk informasi lanjutan."
                                : isDecision && result.status === "perlu_perbaikan"
                                  ? "Mohon lengkapi atau perbaiki berkas sesuai catatan admin."
                                  : step.message}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
