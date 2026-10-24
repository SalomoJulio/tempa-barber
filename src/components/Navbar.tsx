"use client";

import { useState } from "react";

const navigation = [
  { label: "Tentang", href: "#tentang" },
  { label: "Layanan", href: "#layanan" },
  { label: "Barber", href: "#barber" },
  { label: "Galeri", href: "#galeri" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/95 backdrop-blur-xl">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12"
      >
        <a
          href="#beranda"
          aria-label="TEMPA — Beranda"
          onClick={closeMenu}
          className="inline-flex items-center gap-3"
        >
          <svg
            viewBox="0 0 64 72"
            fill="currentColor"
            aria-hidden="true"
            className="h-11 w-10 shrink-0 text-accent"
          >
            <path d="M4 4H37L14 20H4Z" />
            <path d="M42 4H60V20H40L22 40V24Z" />
            <path d="M22 47L40 27V56L22 72Z" />
          </svg>

          <span>
            <span className="block text-xl font-semibold tracking-[0.2em] text-accent">
              TEMPA
            </span>

            <span className="mt-1 block text-[7px] tracking-[0.25em] text-foreground/75">
              BARBER &amp; GROOMING
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs text-muted transition-colors duration-200 hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#booking"
          className="hidden items-center gap-6 rounded-sm border border-accent/70 px-5 py-2.5 text-xs text-accent transition-colors duration-200 hover:bg-accent hover:text-background md:inline-flex"
        >
          Booking
          <span aria-hidden="true">↗</span>
        </a>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="inline-flex min-h-11 items-center gap-3 px-2 text-sm text-foreground md:hidden"
        >
          {menuOpen ? "Tutup" : "Menu"}
          <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-foreground/10 bg-background px-6 py-5 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="py-3 text-sm text-muted transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            ))}

            <a
              href="#booking"
              onClick={closeMenu}
              className="mt-3 inline-flex items-center justify-between rounded-sm bg-accent px-5 py-3.5 text-sm font-medium text-background"
            >
              Booking sekarang
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}