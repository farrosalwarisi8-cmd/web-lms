import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { ButtonLink } from "@/components/ui/button";
import { useDemo } from "@/context/demo-context";
import { rolesForPath } from "@/lib/permissions";
import { roleLabels } from "@/lib/seed/people";
import { usePathname } from "next/navigation";

export function AccessDenied() {
  const { state } = useDemo();
  const pathname = usePathname();
  const allowed = rolesForPath(pathname);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 text-center animate-fade-up">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-700">
        <ShieldOff className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-bold text-slate-900">Akses demo dibatasi</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Halaman ini tidak tersedia untuk peran aktif Anda. Ini adalah simulasi aturan akses
        berbasis peran, bukan pembatasan keamanan sungguhan.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {state.activeRole && <RoleBadge role={state.activeRole} />}
        <span className="text-xs text-slate-500">
          Dibutuhkan: {allowed.map((role) => roleLabels[role]).join(", ")}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink href="/dashboard">Kembali ke beranda</ButtonLink>
        <ButtonLink href="/pilih-role" variant="outline">
          Pilih peran demo lain
        </ButtonLink>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Butuh bantuan?{" "}
        <Link href="/" className="underline hover:text-slate-600">
          Pelajari demo
        </Link>
      </p>
    </div>
  );
}
