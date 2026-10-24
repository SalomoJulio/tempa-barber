"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center px-6"><div className="max-w-md rounded-3xl border border-accent/25 bg-surface p-8"><p className="text-[10px] uppercase tracking-[0.2em] text-accent">TEMPA / Workspace</p><h1 className="mt-5 font-serif text-4xl italic">Sebentar, kita coba lagi.</h1><p className="mt-4 text-sm leading-7 text-muted">Halaman admin belum dapat dimuat. Periksa koneksi dan konfigurasi tanpa membagikan secret key.</p><button onClick={reset} className="mt-6 min-h-12 rounded-full bg-accent px-6 text-sm text-background">Coba lagi</button><Link href="/" className="ml-4 inline-flex min-h-11 items-center text-xs text-accent">Ke website ↗</Link></div></main>;
}
