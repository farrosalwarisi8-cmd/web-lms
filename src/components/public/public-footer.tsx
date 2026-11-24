import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-slate-900">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">demolms</span>
              <span className="block text-[11px] text-slate-500">Demo LMS Pesantren Ansharussunnah · Bogor</span>
            </span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Mendidik santri dengan adab, ilmu, dan amal. Demo frontend ini memperlihatkan alur layanan
            akademik, keuangan, dan pendaftaran dalam satu sistem.
          </p>
          <p className="mt-3 inline-flex rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200">
            Demo lokal — tidak ada data nyata, pembayaran, atau pengiriman email.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigasi</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { href: "/pendaftaran", label: "Alur Pendaftaran" },
              { href: "/pendaftaran/form", label: "Formulir Pendaftaran" },
              { href: "/cek-pendaftaran", label: "Cek Status" },
              { href: "/login", label: "Masuk Demo" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-600 hover:text-slate-900 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kontak</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              Jl. Raya Cibinong No. 45, Bogor
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              0812-3456-7890 (demo)
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              info@ansharussunnah.demo
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4">
        <p className="container-page text-center text-xs text-slate-400">
          © 2026 demolms — Demo frontend LMS untuk presentasi UX.
        </p>
      </div>
    </footer>
  );
}
