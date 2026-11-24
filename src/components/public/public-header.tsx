"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/pendaftaran", label: "Pendaftaran" },
  { href: "/cek-pendaftaran", label: "Cek Status" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-slate-900">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-slate-900">
              demolms
            </span>
            <span className="block text-[11px] text-slate-500">Pesantren &amp; Sekolah</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi publik">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-slate-200" aria-hidden />
          <ButtonLink href="/login" variant="outline" size="sm">
            Masuk
          </ButtonLink>
          <ButtonLink href="/pendaftaran/form" size="sm">
            Daftar Sekarang
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="public-mobile-nav"
          aria-label={open ? "Tutup menu" : "Buka menu"}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <nav id="public-mobile-nav" className="border-t border-slate-100 bg-white px-4 py-3 md:hidden" aria-label="Navigasi publik mobile">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <ButtonLink href="/login" variant="outline" className="flex-1">
              Masuk
            </ButtonLink>
            <ButtonLink href="/pendaftaran/form" className="flex-1">
              Daftar
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
